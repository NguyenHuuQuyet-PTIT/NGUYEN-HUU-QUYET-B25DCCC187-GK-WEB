import { expect, test } from '@playwright/test';
import { createPost, goWrite, login } from './helpers';

test('Khoảng trắng bị từ chối ở mọi trường; bộ đếm theo đúng giá trị nhập', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#username').fill('   ');
  await page.locator('#password').fill('      ');
  await expect(page.locator('#username-hint')).toContainText('3/30');
  await expect(page.locator('#password-hint')).toContainText('6/64');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.locator('#username-error')).toContainText('Vui lòng nhập');
  await expect(page.locator('#password-error')).toContainText('Vui lòng nhập');
  await login(page);
  await page.getByRole('link', { name: 'Viết bài', exact: true }).click();
  await page.locator('#title').fill('     ');
  await page.locator('#body').fill(' '.repeat(20));
  await page.getByRole('button', { name: 'Đăng bài viết' }).click();
  await expect(page.locator('#title-error')).toContainText('Vui lòng nhập');
  await expect(page.locator('#body-error')).toContainText('Vui lòng nhập');
  await createPost(page);
  await page.locator('#comment').fill('   ');
  await expect(page.locator('#comment-hint')).toContainText('3/2000');
  await page.getByRole('button', { name: 'Gửi bình luận' }).click();
  await expect(page.locator('#comment-error')).toContainText('Vui lòng nhập');
});

test('Giá trị đúng min/max được chấp nhận và tiêu đề dài không bị cắt', async ({ page }) => {
  await goWrite(page);
  for (const [titleSize, bodySize, commentSize] of [[5, 20, 3], [200, 10000, 2000]]) {
    if (!page.url().endsWith('/write')) await page.getByRole('link', { name: 'Viết bài', exact: true }).click();
    const title = 't'.repeat(titleSize);
    await page.locator('#title').fill(title);
    await page.locator('#body').fill('b'.repeat(bodySize));
    await page.getByRole('button', { name: 'Đăng bài viết' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.locator('.post-body')).toHaveText('b'.repeat(bodySize));
    await page.locator('#comment').fill('c'.repeat(commentSize));
    await page.getByRole('button', { name: 'Gửi bình luận' }).click();
    await expect(page.locator('.comment-body')).toHaveText('c'.repeat(commentSize));
    await page.getByRole('link', { name: 'Về danh sách bài viết' }).click();
    await expect(page.locator('.post-card h3').first()).toHaveText(title);
  }
});

test('Khóa nút và chặn submit trùng trong cả ba form', async ({ page }) => {
  await page.goto('/write');
  await page.evaluate(() => {
    const original = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => original((time) => setTimeout(() => callback(time), 300));
  });
  await page.locator('#username').fill('admin');
  await page.locator('#password').fill('123456');
  await page.locator('form').evaluate((form: HTMLFormElement) => { form.requestSubmit(); form.requestSubmit(); });
  await expect(page.getByRole('button', { name: 'Đang đăng nhập…' })).toBeDisabled();
  await expect(page).toHaveURL(/\/write$/);
  await page.locator('#title').fill('Kiểm tra chống gửi trùng');
  await page.locator('#body').fill('Nội dung dùng để kiểm tra việc chặn hai lần gửi liên tiếp.');
  await page.locator('form').evaluate((form: HTMLFormElement) => { form.requestSubmit(); form.requestSubmit(); });
  await expect(page.getByRole('button', { name: 'Đang đăng…' })).toBeDisabled();
  await expect(page).toHaveURL(/\/posts\/local-/);
  await page.locator('#comment').fill('Bình luận chỉ được gửi một lần.');
  await page.locator('form').evaluate((form: HTMLFormElement) => { form.requestSubmit(); form.requestSubmit(); });
  await expect(page.getByRole('button', { name: 'Đang gửi…' })).toBeDisabled();
  await expect(page.locator('.comment')).toHaveCount(1);
  const counts = await page.evaluate(() => ['miniblog.posts', 'miniblog.comments'].map((key) =>
    (JSON.parse(localStorage.getItem(key) || '[]') as unknown[]).length));
  expect(counts).toEqual([1, 1]);
});

test('Lỗi lưu phiên và lưu bình luận không thông báo thành công', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Denied', 'SecurityError'); };
  });
  await login(page);
  await expect(page.getByText('Không lưu được phiên đăng nhập. Hãy kiểm tra quyền lưu trữ.')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Đăng nhập', exact: true })).toBeEnabled();
  await page.reload();
  await goWrite(page);
  await createPost(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Quota', 'QuotaExceededError'); };
  });
  await page.locator('#comment').fill('Nội dung chưa được lưu thành công.');
  await page.getByRole('button', { name: 'Gửi bình luận' }).click();
  await expect(page.getByText(/Không lưu được dữ liệu/)).toBeVisible();
  await expect(page.getByText('Đã gửi bình luận.', { exact: true })).toHaveCount(0);
  await expect(page.locator('.comment')).toHaveCount(0);
  await expect(page.locator('#comment')).toHaveValue('Nội dung chưa được lưu thành công.');
});
