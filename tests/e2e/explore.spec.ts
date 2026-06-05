import { test, expect } from '@playwright/test'

test('explore admin pages DOM', async ({ page }) => {
  await page.goto('/admin/users')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'tests/screenshots/explore-admin-users.png', fullPage: true })

  // Cari tombol untuk buka dialog
  const buttons = await page.locator('button, .v-btn').allTextContents()
  console.log('Buttons on /admin/users:', buttons.filter(b => b.trim()))

  // Cari dialog trigger
  const addBtn = page.locator('.v-btn').filter({ hasText: /add|create|new|tambah/i }).first()
  if (await addBtn.isVisible()) {
    await addBtn.click()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/screenshots/explore-create-user-dialog.png', fullPage: false })
    const inputs = await page.locator('.v-dialog input, .v-dialog .v-field').allTextContents()
    console.log('Dialog inputs:', inputs)
    const dialogBtns = await page.locator('.v-dialog .v-btn').allTextContents()
    console.log('Dialog buttons:', dialogBtns)
    await page.keyboard.press('Escape')
  }
})

test('explore admin document numbers page', async ({ page }) => {
  await page.goto('/admin/document.numbers')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'tests/screenshots/explore-admin-doc-numbers.png', fullPage: true })
  const buttons = await page.locator('.v-btn').allTextContents()
  console.log('Buttons on /admin/document.numbers:', buttons.filter(b => b.trim()))
})

test('explore admin positions page', async ({ page }) => {
  await page.goto('/admin/positions')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'tests/screenshots/explore-admin-positions.png', fullPage: true })
  const buttons = await page.locator('.v-btn').allTextContents()
  console.log('Buttons on /admin/positions:', buttons.filter(b => b.trim()))
})

test('explore profile page', async ({ page }) => {
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'tests/screenshots/explore-profile.png', fullPage: true })
  const buttons = await page.locator('.v-btn').allTextContents()
  console.log('Buttons on /profile:', buttons.filter(b => b.trim()))
})
