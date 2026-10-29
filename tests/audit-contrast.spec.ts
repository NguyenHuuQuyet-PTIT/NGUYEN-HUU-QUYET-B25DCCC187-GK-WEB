import { expect, test, type Page } from '@playwright/test';
import { goWrite } from './helpers';

async function checkButtons(page: Page) {
  const buttons = await page.locator('button, .button').evaluateAll((elements) => {
    const luminance = (value: string) => {
      const rgb = (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number).map((channel) => {
        const ratio = channel / 255;
        return ratio <= 0.04045 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
      });
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    return elements.filter((element) => element.getClientRects().length > 0
      && element.textContent?.trim() && !(element as HTMLButtonElement).disabled).map((element) => {
      let parent: Element | null = element;
      let background = 'rgb(255, 255, 255)';
      while (parent) {
        const color = getComputedStyle(parent).backgroundColor;
        if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
          background = color;
          break;
        }
        parent = parent.parentElement;
      }
      const light = luminance(background);
      const dark = luminance(getComputedStyle(element).color);
      return { label: element.textContent?.trim(), ratio: (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05) };
    });
  });
  expect(buttons.length).toBeGreaterThan(0);
  for (const button of buttons) expect(button.ratio, button.label).toBeGreaterThanOrEqual(4.5);
}

test('Chữ trên nút đăng nhập, đăng bài, bình luận, phân trang và thử lại đủ tương phản', async ({ page }) => {
  await page.goto('/login');
  await checkButtons(page);
  await goWrite(page);
  await checkButtons(page);
  await page.goto('/posts/1');
  await expect(page.locator('#comment')).toBeVisible();
  await checkButtons(page);
  await page.goto('/?page=2');
  await expect(page.locator('.post-card')).toHaveCount(9);
  await checkButtons(page);
  await page.route('https://jsonplaceholder.typicode.com/**', (route) => route.abort());
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Thử lại' })).toBeVisible();
  await checkButtons(page);
});
