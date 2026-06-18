import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120000,
  },

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Setup: login sebagai admin & reguler, simpan cookies
    {
      name: 'setup-admin',
      testMatch: '**/auth.setup.ts',
      use: { ...devices['Desktop Chrome'] },
    },

    // Test tanpa auth (login form, route protection)
    {
      name: 'unauthenticated',
      testMatch: '**/qa-form-validation.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },

    // Test admin features (pakai auth state admin)
    {
      name: 'admin',
      testMatch: '**/qa-admin.spec.ts',
      dependencies: ['setup-admin'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/admin.json',
      },
    },

    // Test reguler user features
    {
      name: 'reguler',
      testMatch: '**/qa-reguler.spec.ts',
      dependencies: ['setup-admin'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/reguler.json',
      },
    },
  ],
})
