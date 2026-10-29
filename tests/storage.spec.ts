import { expect, test } from '@playwright/test';
import { createPost, goWrite } from './helpers';

test('localStorage hỏng JSON hoặc sai kiểu không gây trắng trang', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/login');
  for (const raw of ['{invalid', '{"id":1}', '[{"id":"local-invalid"}]', 'null']) {
    await page.evaluate((value) => {
      for (const key of ['miniblog.session', 'miniblog.posts', 'miniblog.comments']) {
        localStorage.setItem(key, value);
      }
    }, raw);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Đăng nhập', exact: true })).toBeVisible();
  }
  await goWrite(page);
  await createPost(page);
  await expect(page.getByText('0 bình luận', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Lỗi ghi localStorage có thông báo và không điều hướng sai', async ({ page }) => {
  await goWrite(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); };
  });
  await page.locator('#title').fill('Bài viết không thể lưu');
  await page.locator('#body').fill('Nội dung kiểm tra thông báo khi bộ nhớ trình duyệt bị đầy.');
  await page.getByRole('button', { name: 'Đăng bài viết' }).click();
  await expect(page.getByText(/Không lưu được dữ liệu/)).toBeVisible();
  await expect(page).toHaveURL(/\/write$/);
  await expect(page.getByRole('button', { name: 'Đăng bài viết' })).toBeEnabled();
  expect(await page.evaluate(() => localStorage.getItem('miniblog.posts'))).toBeNull();
});

test('Bài viết và bình luận tự tạo xem được khi API mất mạng', async ({ page }) => {
  await goWrite(page);
  await createPost(page);
  await page.locator('#comment').fill('Bình luận cho bài viết tự tạo.');
  await page.getByRole('button', { name: 'Gửi bình luận' }).click();
  await expect(page.locator('.comment')).toHaveCount(1);
  let requests = 0;
  await page.route('https://jsonplaceholder.typicode.com/**', (route) => {
    requests += 1;
    return route.abort();
  });
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bài viết kiểm thử MiniBlog');
  await expect(page.locator('.comment')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Thử lại' })).toHaveCount(0);
  expect(requests).toBe(0);
});

test('Phiên đăng nhập đồng bộ giữa hai tab', async ({ page, context }) => {
  await goWrite(page);
  const second = await context.newPage();
  await second.goto('/write');
  await expect(second.getByRole('heading', { level: 1 })).toHaveText('Viết bài mới');
  await page.getByRole('button', { name: 'Đăng xuất' }).click();
  await expect(second).toHaveURL(/\/login$/);
  await expect(second.getByRole('button', { name: 'Đăng nhập', exact: true })).toBeVisible();
});
