import { test, expect } from '@playwright/test';



test.describe('Home page', () => {
  test('loads and shows Job Portal heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /job portal/i })).toBeVisible();
  });
/** 
  test('has Login and Register navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /register/i })).toBeVisible();
  });
});


test.describe('Navigation', () => {
  test('clicking Login navigates to /login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /login/i }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });

  test('clicking Register navigates to /register', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /register/i }).click();
    await expect(page).toHaveURL('/register');
    await expect(page.getByRole('heading', { name: /register/i })).toBeVisible();
  });

  test('back link on Login page returns to home', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /home/i }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /job portal/i })).toBeVisible();
  });

  test('back link on Register page returns to home', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('link', { name: /home/i }).click();
    await expect(page).toHaveURL('/');
  });
  */
});
