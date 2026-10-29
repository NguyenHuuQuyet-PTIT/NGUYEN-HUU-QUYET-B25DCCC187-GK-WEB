import { expect, test } from '@playwright/test';

test('API 500, JSON sai kiểu và JSON hỏng đều có thể thử lại', async ({ page }) => {
  for (const response of [
    { status: 500, body: 'server error' },
    { status: 200, body: '{"invalid":true}' },
    { status: 200, body: '{invalid-json' },
  ]) {
    await page.route('https://jsonplaceholder.typicode.com/posts', (route) =>
      route.fulfill({ ...response, contentType: 'application/json' }));
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Thử lại' })).toBeVisible();
    await expect(page.locator('.post-card')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible();
    await page.unroute('https://jsonplaceholder.typicode.com/posts');
    await page.getByRole('button', { name: 'Thử lại' }).click();
    await expect(page.locator('.post-card')).toHaveCount(9);
  }
});

test('Lỗi bình luận hoặc tác giả ở chi tiết phục hồi bằng Thử lại', async ({ page }) => {
  for (const endpoint of ['/posts/1/comments', '/users/1']) {
    const url = `https://jsonplaceholder.typicode.com${endpoint}`;
    await page.route(url, (route) => route.fulfill({ status: 503, body: 'Unavailable' }));
    await page.goto('/posts/1');
    await expect(page.getByRole('alert')).toContainText('HTTP 503');
    await expect(page.getByRole('link', { name: 'Về danh sách bài viết' })).toBeVisible();
    await page.unroute(url);
    await page.getByRole('button', { name: 'Thử lại' }).click();
    await expect(page.locator('.comment')).toHaveCount(5);
    await expect(page.locator('.detail-meta strong')).toHaveText('Leanne Graham');
  }
});

test('AbortController thực sự hủy signal khi rời trang', async ({ page }) => {
  await page.addInitScript(() => {
    const originalFetch = window.fetch;
    const audit = window as typeof window & { abortedRequests: string[] };
    audit.abortedRequests = [];
    window.fetch = (input, options) => {
      options?.signal?.addEventListener('abort', () => audit.abortedRequests.push(String(input)));
      return originalFetch(input, options);
    };
  });
  await page.route('https://jsonplaceholder.typicode.com/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await route.continue().catch(() => undefined);
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('Đang tải');
  await page.evaluate(() => {
    (window as typeof window & { abortedRequests: string[] }).abortedRequests = [];
  });
  await page.getByRole('link', { name: 'Đăng nhập', exact: true }).click();
  await expect.poll(() => page.evaluate(() =>
    (window as typeof window & { abortedRequests: string[] }).abortedRequests.length)).toBe(2);
});

test('ID quá lớn, số âm và UUID local không tồn tại trả về 404', async ({ page }) => {
  for (const id of ['-1', '01', '1.5', '9007199254740992', 'local-00000000-0000-4000-8000-000000000000']) {
    await page.goto(`/posts/${id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Không tìm thấy bài viết');
    await expect(page.getByRole('button', { name: 'Thử lại' })).toHaveCount(0);
    await page.getByRole('link', { name: 'Về trang chủ', exact: true }).click();
    await expect(page).toHaveURL('/');
  }
});
