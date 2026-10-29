import { expect, type Page } from '@playwright/test';

export async function login(page: Page) {
  await page.getByLabel('Tên đăng nhập', { exact: false }).fill('admin');
  await page.getByLabel('Mật khẩu', { exact: false }).fill('123456');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
}

export async function goWrite(page: Page) {
  await page.goto('/write');
  await expect(page).toHaveURL(/\/login$/);
  await login(page);
  await expect(page).toHaveURL(/\/write$/);
}

export async function createPost(page: Page) {
  await page.getByLabel('Tiêu đề', { exact: false }).fill('Bài viết kiểm thử MiniBlog');
  await page.getByLabel('Nội dung bài viết', { exact: false })
    .fill('Nội dung do người dùng nhập để kiểm tra việc lưu bài viết trên trình duyệt.');
  await page.getByRole('button', { name: 'Đăng bài viết', exact: true }).click();
  await expect(page).toHaveURL(/\/posts\/local-/);
  await expect(page.getByRole('status')).toContainText('Đã đăng bài viết thành công.');
}

export async function fillOverLimit(page: Page, id: string, max: number) {
  const field = page.locator(`#${id}`);
  await field.evaluate((element) => element.removeAttribute('maxlength'));
  await field.fill('a'.repeat(max + 1));
}
