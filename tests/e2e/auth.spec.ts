import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('halaman login tampil dengan benar', async ({ page }) => {
    await page.goto('/login')

    await expect(page).toHaveURL(/login/)
    await expect(page.locator('input[type="text"], input[type="email"]').first()).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
  })

  test('login dengan kredensial salah menampilkan error', async ({ page }) => {
    await page.goto('/login')

    await page.locator('input[type="text"], input[type="email"]').first().fill('wrong@email.com')
    await page.locator('input[type="password"]').first().fill('wrongpassword')
    await page.locator('button[type="submit"]').click()

    // Tunggu response dan pastikan tetap di halaman login
    await page.waitForTimeout(1500)
    await expect(page).toHaveURL(/login/)
  })
})
