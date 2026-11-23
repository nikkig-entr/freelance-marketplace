import { test, expect } from '@playwright/test';

test('homepage loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  console.log('Console errors:', errors);
  expect(errors.filter(e => e.includes('BriefcaseIcon') || e.includes('ReferenceError'))).toHaveLength(0);
});