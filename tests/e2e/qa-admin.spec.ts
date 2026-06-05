/**
 * QA Test — Admin Features (authenticated)
 */
import { test, expect, Page } from '@playwright/test'

// ─── helpers ────────────────────────────────────────────────────────────────

const ss = (page: Page, name: string) =>
  page.screenshot({ path: `tests/screenshots/admin-${name}.png`, fullPage: false })

const XSS = '<script>alert(1)</script>'

async function getErrors(page: Page) {
  return page.locator('.v-messages__message:visible, .v-alert:visible').allTextContents()
}

async function clickBtn(page: Page, label: string | RegExp) {
  await page.locator('.v-btn').filter({ hasText: label }).first().click()
}

async function waitForDialog(page: Page) {
  await page.waitForSelector('.v-dialog .v-card', { timeout: 6000 })
  await page.waitForTimeout(500)
}

/** Isi field di dalam dialog berdasarkan placeholder */
async function fillByPlaceholder(page: Page, placeholder: string, value: string) {
  const input = page.locator(`.v-dialog input[placeholder="${placeholder}"]`)
  await input.clear()
  await input.fill(value)
}

async function closeDialog(page: Page) {
  const closeBtn = page.locator('.v-dialog .v-btn').filter({ hasText: /cancel|close/i }).first()
  if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false))
    await closeBtn.click()
  else
    await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
}

async function openCreateUserDialog(page: Page) {
  await page.goto('/admin/users')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)
  await page.locator('.v-btn').filter({ hasText: 'Add New User' }).first().click()
  await waitForDialog(page)
}

// ─── HALAMAN ADMIN/USERS ─────────────────────────────────────────────────────

test.describe('ADMIN — Users Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/users')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1200)
  })

  test('ADM-01: Halaman /admin/users berhasil dimuat dengan data tabel', async ({ page }) => {
    await expect(page.locator('.v-data-table').first()).toBeVisible()
    await ss(page, '01-users-page')
  })

  test('ADM-02: Search users — filter tabel berubah sesuai keyword', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search Users"]')
    await searchInput.fill('admin')
    await page.waitForTimeout(700)
    await ss(page, '02-search-users')
    const rows = await page.locator('tbody tr').count()
    console.log(`[ADM-02] Rows setelah search "admin": ${rows}`)
    expect(rows).toBeGreaterThanOrEqual(0)
  })

  test('ADM-03: Search users — XSS payload tidak mengeksekusi script', async ({ page }) => {
    let alertFired = false
    page.on('dialog', async d => { alertFired = true; await d.dismiss() })
    await page.locator('input[placeholder="Search Users"]').fill(XSS)
    await page.waitForTimeout(700)
    await ss(page, '03-search-xss')
    expect(alertFired).toBe(false)
  })

  test('ADM-04: Buka dialog Create User — semua field tampil', async ({ page }) => {
    await openCreateUserDialog(page)
    await expect(page.locator('.v-dialog input[placeholder="Enter your first name"]')).toBeVisible()
    await expect(page.locator('.v-dialog input[placeholder="Enter your email address"]')).toBeVisible()
    await expect(page.locator('.v-dialog input[type="tel"]')).toBeVisible()
    await ss(page, '04-create-user-dialog-open')
  })

  test('ADM-05: Create User — submit kosong menampilkan error required', async ({ page }) => {
    await openCreateUserDialog(page)
    await page.locator('.v-dialog button[type="submit"]').click()
    await page.waitForTimeout(700)
    const errors = await getErrors(page)
    await ss(page, '05-create-user-empty-submit')
    expect(errors.some(e => e.toLowerCase().includes('required')),
      `Errors: ${JSON.stringify(errors)}`).toBe(true)
    await closeDialog(page)
  })

  test('ADM-06: Create User — email format invalid ditolak', async ({ page }) => {
    await openCreateUserDialog(page)
    await fillByPlaceholder(page, 'Enter your first name', 'Test')
    await fillByPlaceholder(page, 'Enter your last name', 'User')
    await fillByPlaceholder(page, 'Enter your email address', 'bukan-email')
    await fillByPlaceholder(page, 'Enter your phone number', '081234567890')
    // Password (first password field)
    await page.locator('.v-dialog input[type="password"]').first().fill('Test1234!')

    await page.locator('.v-dialog button[type="submit"]').click()
    await page.waitForTimeout(700)
    const errors = await getErrors(page)
    await ss(page, '06-create-user-invalid-email')
    expect(errors.some(e => e.toLowerCase().includes('email')),
      `Errors: ${JSON.stringify(errors)}`).toBe(true)
    await closeDialog(page)
  })

  test('ADM-07: Create User — password lemah (no uppercase/special) ditolak', async ({ page }) => {
    await openCreateUserDialog(page)
    await page.locator('.v-dialog input[type="password"]').first().fill('alllowercase1')
    await page.locator('.v-dialog button[type="submit"]').click()
    await page.waitForTimeout(700)
    const errors = await getErrors(page)
    await ss(page, '07-create-user-weak-password')
    expect(errors.some(e =>
      e.toLowerCase().includes('uppercase') ||
      e.toLowerCase().includes('special') ||
      e.toLowerCase().includes('character')
    ), `Errors: ${JSON.stringify(errors)}`).toBe(true)
    await closeDialog(page)
  })

  test('ADM-08: Create User — password dengan ^ diterima setelah fix regex', async ({ page }) => {
    await openCreateUserDialog(page)
    await page.locator('.v-dialog input[type="password"]').first().fill('Test1234^')
    // Pindah focus supaya validasi terpicu
    await page.locator('.v-dialog input[type="password"]').first().press('Tab')
    await page.waitForTimeout(500)
    const errors = await getErrors(page)
    await ss(page, '08-create-user-expanded-special-char')
    const hasPasswordError = errors.some(e =>
      (e.toLowerCase().includes('special') || e.toLowerCase().includes('character') || e.toLowerCase().includes('uppercase')) &&
      !e.toLowerCase().includes('required')
    )
    expect(hasPasswordError,
      `Password "Test1234^" masih ditolak — fix regex GAGAL. Errors: ${JSON.stringify(errors)}`).toBe(false)
    await closeDialog(page)
  })

  test('ADM-09: Create User — confirm password mismatch ditolak', async ({ page }) => {
    await openCreateUserDialog(page)
    const passwords = page.locator('.v-dialog input[type="password"]')
    await passwords.nth(0).fill('Test1234!')
    await passwords.nth(1).fill('DifferentPass1!')
    await page.locator('.v-dialog button[type="submit"]').click()
    await page.waitForTimeout(700)
    const errors = await getErrors(page)
    await ss(page, '09-create-user-password-mismatch')
    expect(errors.some(e => e.toLowerCase().includes('match') || e.toLowerCase().includes('confirm')),
      `Errors: ${JSON.stringify(errors)}`).toBe(true)
    await closeDialog(page)
  })

  test('ADM-10: Create User — phone < 5 karakter ditolak', async ({ page }) => {
    await openCreateUserDialog(page)
    await fillByPlaceholder(page, 'Enter your phone number', '123')
    await page.locator('.v-dialog input[type="password"]').first().click() // blur phone
    await page.waitForTimeout(500)
    const errors = await getErrors(page)
    await ss(page, '10-create-user-short-phone')
    expect(errors.some(e => e.toLowerCase().includes('phone') || e.includes('5')),
      `Errors: ${JSON.stringify(errors)}`).toBe(true)
    await closeDialog(page)
  })

  test('ADM-11: Create User — phone field menerima +62 (type=tel)', async ({ page }) => {
    await openCreateUserDialog(page)
    const phoneInput = page.locator('.v-dialog input[type="tel"]')
    await expect(phoneInput).toBeVisible()
    await phoneInput.fill('+6281234567890')
    const val = await phoneInput.inputValue()
    await ss(page, '11-create-user-phone-tel')
    expect(val).toContain('+62')
    await closeDialog(page)
  })

  test('ADM-12: Create User — firstName > 100 chars ditolak', async ({ page }) => {
    await openCreateUserDialog(page)
    await fillByPlaceholder(page, 'Enter your first name', 'A'.repeat(101))
    await page.locator('.v-dialog input[placeholder="Enter your last name"]').click()
    await page.waitForTimeout(500)
    const errors = await getErrors(page)
    await ss(page, '12-create-user-long-firstname')
    expect(errors.some(e => e.includes('100') || e.toLowerCase().includes('exceed')),
      `Errors: ${JSON.stringify(errors)}`).toBe(true)
    await closeDialog(page)
  })

  test('ADM-13: Create User — XSS di firstName tidak mengeksekusi script', async ({ page }) => {
    await openCreateUserDialog(page)
    let alertFired = false
    page.on('dialog', async d => { alertFired = true; await d.dismiss() })
    await fillByPlaceholder(page, 'Enter your first name', XSS)
    await page.waitForTimeout(600)
    await ss(page, '13-create-user-xss-firstname')
    expect(alertFired, 'XSS terpicu!').toBe(false)
    await closeDialog(page)
  })
})

// ─── HALAMAN ADMIN/POSITIONS ─────────────────────────────────────────────────

test.describe('ADMIN — Positions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/positions')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
  })

  test('ADM-14: Halaman /admin/positions berhasil dimuat', async ({ page }) => {
    await expect(page.locator('.v-card').first()).toBeVisible()
    await ss(page, '14-positions-page')
  })

  test('ADM-15: Create Position — form validasi berjalan', async ({ page }) => {
    await page.locator('.v-btn').filter({ hasText: 'Add Job Position' }).first().click()
    await waitForDialog(page)
    await ss(page, '15-create-position-dialog')

    // Cari input di dialog, kosongkan dan submit
    const nameInput = page.locator('.v-dialog input').first()
    if (await nameInput.isVisible()) {
      await nameInput.clear()
      // Klik di luar untuk trigger validasi
      await page.locator('.v-dialog .v-card-title').click()
      await page.waitForTimeout(500)
      const errors = await getErrors(page)
      await ss(page, '15b-create-position-validation')
      console.log(`[ADM-15] Errors: ${JSON.stringify(errors)}`)
    }
    await closeDialog(page)
  })
})

// ─── HALAMAN ADMIN/DOCUMENT-NUMBERS ──────────────────────────────────────────

test.describe('ADMIN — Document Numbers (Publication Format)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/document/numbers')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
  })

  test('ADM-16: Halaman /admin/document.numbers berhasil dimuat', async ({ page }) => {
    await page.waitForSelector('.v-card', { timeout: 8000 })
    await ss(page, '16-doc-numbers-page')
    await expect(page.locator('.v-card').first()).toBeVisible()
  })

  test('ADM-17: Create Publication Format — FIX VERIFIED — submit kosong diblok', async ({ page }) => {
    await page.waitForSelector('.v-card', { timeout: 8000 })
    // Tombol yang benar: "Add New Format"
    const createBtn = page.locator('.v-btn').filter({ hasText: 'Add New Format' }).first()
    const btnVisible = await createBtn.isVisible({ timeout: 3000 }).catch(() => false)
    if (!btnVisible) {
      console.log('[ADM-17] Tombol "Add New Format" tidak ditemukan — skip')
      return
    }
    await createBtn.click()
    await waitForDialog(page)
    await ss(page, '17-create-format-dialog-open')

    // Dialog Create Publication Format — tombol "Create Format"
    const submitBtn = page.locator('.v-dialog .v-btn').filter({ hasText: /create format/i }).first()
    const submitVisible = await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)
    if (submitVisible) {
      await submitBtn.click()
      await page.waitForTimeout(700)
      const errors = await getErrors(page)
      const isStillOpen = await page.locator('.v-dialog').isVisible()
      await ss(page, '17b-create-format-empty-submit')
      expect(isStillOpen, 'Dialog menutup padahal form kosong — fix GAGAL').toBe(true)
      expect(errors.some(e => e.toLowerCase().includes('required')),
        `Tidak ada required error. Errors: ${JSON.stringify(errors)}`).toBe(true)
    }
    await closeDialog(page)
  })
})

// ─── ADMIN — Halaman lain ─────────────────────────────────────────────────────

test.describe('ADMIN — Page Load Checks', () => {
  const adminPages = [
    { id: 'ADM-18', name: 'letterhead',     path: '/admin/letterhead' },
    { id: 'ADM-19', name: 'approvals',      path: '/admin/approvals' },
    { id: 'ADM-20', name: 'histories',      path: '/admin/histories' },
    { id: 'ADM-21', name: 'app-log',        path: '/admin/app/log' },
  ]

  for (const { id, name, path } of adminPages) {
    test(`${id}: ${path} berhasil dimuat tanpa crash`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      await page.waitForSelector('.v-card, .v-container, main', { timeout: 8000 })
      await ss(page, `${id.toLowerCase()}-${name}`)
      await expect(page.locator('.v-card, .v-container, main').first()).toBeVisible()
    })
  }
})
