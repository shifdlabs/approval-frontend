import { test as setup, expect } from '@playwright/test'

const ADMIN_EMAIL    = 'admin@approval.com'
const ADMIN_PASSWORD = 'Test1234!'
const STAFF_EMAIL    = 'staff1@approval.com'
const STAFF_PASSWORD = 'Test1234!'

async function loginAs(page: any, email: string, password: string, storageFile: string) {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.locator('button[type="submit"]').click()

  // Tunggu redirect setelah login berhasil
  await page.waitForURL(url => !url.toString().includes('localhost:5173/') || url.toString() !== 'http://localhost:5173/', { timeout: 10000 })
  await page.waitForLoadState('networkidle')

  // Verifikasi berhasil masuk (bukan di halaman login lagi)
  const currentUrl = page.url()
  const isLoggedIn = !currentUrl.endsWith('localhost:5173/') || currentUrl.includes('/admin') || currentUrl.includes('/reguler')
  expect(isLoggedIn, `Login gagal untuk ${email}. URL: ${currentUrl}`).toBe(true)

  await page.context().storageState({ path: storageFile })
  console.log(`✅ Auth saved untuk ${email} → ${storageFile}`)
}

setup('login sebagai admin', async ({ page }) => {
  await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD, 'tests/e2e/.auth/admin.json')
})

setup('login sebagai reguler', async ({ page }) => {
  await loginAs(page, STAFF_EMAIL, STAFF_PASSWORD, 'tests/e2e/.auth/reguler.json')
})
