import { expect, test } from '@playwright/test';
import { createPost, goWrite, login } from './helpers';

test('Tìm kiếm chuỗi dài trên điện thoại không gây tràn ngang', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  await expect(page.locator('.post-card')).toHaveCount(9);
  await page.getByLabel('Tìm bài viết').fill('x'.repeat(300));
  await expect(page.getByRole('heading', { name: 'Chưa tìm thấy bài viết phù hợp' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('Giữ query/hash sau đăng nhập và cuộn lên đầu khi chuyển trang', async ({ page }) => {
  await page.goto('/write?draft=1#editor');
  await expect(page).toHaveURL(/\/login$/);
  await page.evaluate(() => document.body.dataset.noReload = 'retained');
  await login(page);
  await expect(page).toHaveURL(/\/write\?draft=1#editor$/);
  expect(await page.locator('body').getAttribute('data-no-reload')).toBe('retained');
  await page.getByRole('link', { name: 'Trang chủ', exact: true }).click();
  await expect(page.locator('.post-card')).toHaveCount(9);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.locator('.post-card h3 a').last().click();
  await expect(page.locator('.post-body')).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('Không đọc được localStorage vẫn hiển thị ứng dụng', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Denied', 'SecurityError'); };
  });
  await page.goto('/');
  await expect(page.locator('.post-card')).toHaveCount(9);
  await page.getByRole('link', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Đăng nhập', exact: true })).toBeVisible();
});

test('Bài viết và bình luận mới đồng bộ sang tab khác', async ({ page, context }) => {
  await goWrite(page);
  const second = await context.newPage();
  await second.goto('/');
  await expect(second.getByText('100 bài viết', { exact: true })).toBeVisible();
  await createPost(page);
  await expect(second.getByText('101 bài viết', { exact: true })).toBeVisible();
  await second.locator('.post-card h3 a').first().click();
  await expect(second.getByText('0 bình luận', { exact: true })).toBeVisible();
  await page.locator('#comment').fill('Bình luận được đồng bộ giữa hai tab.');
  await page.getByRole('button', { name: 'Gửi bình luận' }).click();
  await expect(second.locator('.comment')).toHaveCount(1);
  await expect(second.locator('.comment-body')).toHaveText('Bình luận được đồng bộ giữa hai tab.');
});
