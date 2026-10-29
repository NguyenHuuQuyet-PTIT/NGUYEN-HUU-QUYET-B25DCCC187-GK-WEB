import { expect, test } from '@playwright/test';

test('Tải toàn bộ API, phân trang, tìm kiếm, sắp xếp và chi tiết tác giả/bình luận', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  await page.goto('/');
  await expect(page.getByText('100 bài viết', { exact: true })).toBeVisible();
  await expect(page.locator('.post-card')).toHaveCount(9);
  await expect(page.locator('.results-summary')).toContainText('Trang 1 / 12');
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Trang 12', exact: true }).click();
  await expect(page.locator('.post-card')).toHaveCount(1);
  await page.getByLabel('Sắp xếp theo').selectOption('oldest');
  const firstTitle = await page.locator('.post-card h3').first().innerText();
  await page.getByLabel('Tìm bài viết').fill(firstTitle.toUpperCase());
  await expect(page.locator('.post-card')).toHaveCount(1);
  await expect(page.locator('.post-card h3')).toHaveText(firstTitle);
  await page.getByRole('link', { name: `Đọc bài: ${firstTitle}`, exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(firstTitle);
  await expect(page.locator('.detail-meta strong')).toHaveText('Leanne Graham');
  await expect(page.locator('.comment')).toHaveCount(5);
  await expect(page.locator('.login-prompt')).toContainText('Đăng nhập');
  await expect(page.locator('#comment')).toHaveCount(0);
  await page.goto('/?q=khongcotieudenay');
  await expect(page.getByRole('heading', { name: 'Chưa tìm thấy bài viết phù hợp' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Thử lại' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Xóa tìm kiếm' }).click();
  await page.getByLabel('Sắp xếp theo').selectOption('title');
  const titles = await page.locator('.post-card h3').allTextContents();
  expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b, 'vi')));
  const stored = await page.evaluate(() => Object.keys(localStorage));
  expect(stored).not.toContain('miniblog.posts');
  expect(failures).toEqual([]);
});

test('Lỗi mạng có Thử lại, giữ khung trang và phục hồi không tải lại trang', async ({ page }) => {
  await page.route('https://jsonplaceholder.typicode.com/**', (route) => route.abort('failed'));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Thử lại' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bài viết mới', exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible();
  await page.evaluate(() => document.body.dataset.retryMarker = 'retained');
  await page.unroute('https://jsonplaceholder.typicode.com/**');
  await page.getByRole('button', { name: 'Thử lại' }).click();
  await expect(page.locator('.post-card')).toHaveCount(9);
  expect(await page.locator('body').getAttribute('data-retry-marker')).toBe('retained');
});

test('URL sai và bài viết API 404 chỉ có nút về trang chủ', async ({ page }) => {
  for (const path of ['/khong-ton-tai', '/posts/abc', '/posts/0', '/posts/1abc', '/posts/999999']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/không tồn tại|Không tìm thấy/);
    await expect(page.getByRole('link', { name: 'Về trang chủ', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thử lại' })).toHaveCount(0);
  }
});

test('Hiện trạng thái tải và hủy yêu cầu khi chuyển route', async ({ page }) => {
  await page.route('https://jsonplaceholder.typicode.com/posts', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue().catch(() => undefined);
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('Đang tải');
  await page.getByRole('link', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Đăng nhập', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Thử lại' })).toHaveCount(0);
});

test('Hiển thị 3/2/1 cột, menu di động và không tràn ngang', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.post-card')).toHaveCount(9);
  for (const [width, expected] of [[1440, 3], [820, 2], [390, 1], [320, 1]]) {
    await page.setViewportSize({ width, height: 900 });
    const columns = await page.locator('.post-grid').evaluate((element) =>
      getComputedStyle(element).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(expected);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeHidden();
  await page.getByRole('button', { name: 'Mở menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible();
  await page.getByRole('button', { name: 'Đóng menu' }).click();
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Mở menu' }).click();
  await page.getByRole('link', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
