<script setup lang="ts">
import { VForm } from 'vuetify/components'
import { loginController } from '@/controllers/login-controller'

const {
  isPasswordVisible,
  refVForm,
  isLoginError,
  loginErrorMessage,
  isAccountInactive,
  isInProgress,
  credentials,
  onSubmit,
} = loginController()

const { t } = useI18n()
</script>

<template>
  <div class="lp-page">
    <!-- ══ Loading Overlay ══ -->
    <Transition name="lp-fade">
      <div v-if="isInProgress" class="lp-overlay" role="status" aria-live="polite">
        <div class="lp-loader-card">
          <div class="lp-spinner">
            <div class="lp-ring" />
            <div class="lp-pin">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <rect x="4" y="7" width="12.5" height="12.5" rx="3.2" fill="currentColor" opacity="0.24" />
                <rect x="7.5" y="3.5" width="12.5" height="12.5" rx="3.2" fill="currentColor" />
                <path d="m11.1 9.7 1.7 1.7 3.1-3.3" fill="none" stroke="#ffffff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
          <h3 class="lp-loader-title">
            {{ t('auth.loaderTitle') }}<span class="lp-dots"><i /><i /><i /></span>
          </h3>
          <p class="lp-loader-sub">{{ t('auth.loaderSubtext') }}</p>
          <div class="lp-track"><div class="lp-bar" /></div>
        </div>
      </div>
    </Transition>

    <div class="lp-shell">

      <!-- ══ Brand Panel ══ -->
      <aside class="lp-brand" aria-hidden="true">
        <div class="lp-brand-top">
          <div class="lp-brand-mark">
            <svg viewBox="0 0 24 24" width="27" height="27">
              <rect x="4" y="7" width="12.5" height="12.5" rx="3.2" fill="#ffffff" opacity="0.34" />
              <rect x="7.5" y="3.5" width="12.5" height="12.5" rx="3.2" fill="#ffffff" />
              <path d="m11.1 9.7 1.7 1.7 3.1-3.3" fill="none" stroke="#314f91" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="lp-brand-name">
            <b>Shifd Approval</b>
            <span>{{ t('auth.brandTagline') }}</span>
          </div>
        </div>

        <div class="lp-brand-hero">
          <h1>{{ t('auth.brandHero') }}</h1>
          <p>{{ t('auth.brandDesc') }}</p>

          <div class="lp-feats">
            <div class="lp-feat">
              <span class="lp-feat-dot">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="m5 12 4.5 4.5L19 7" /></svg>
              </span>
              {{ t('auth.brandFeat1') }}
            </div>
            <div class="lp-feat">
              <span class="lp-feat-dot">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
              </span>
              {{ t('auth.brandFeat2') }}
            </div>
            <div class="lp-feat">
              <span class="lp-feat-dot">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6z" /></svg>
              </span>
              {{ t('auth.brandFeat3') }}
            </div>
          </div>
        </div>
      </aside>

      <!-- ══ Form Side ══ -->
      <section class="lp-form-side">
        <div class="lp-form-wrap">
          <div class="lp-welcome">
            <div class="lp-eyebrow">{{ t('auth.loginEyebrow') }}</div>
            <h2 class="lp-h2">{{ t('auth.loginH2') }}</h2>
            <p class="lp-desc">{{ t('auth.loginDesc') }}</p>
          </div>

          <VForm ref="refVForm" @submit.prevent="onSubmit" class="lp-vform">
            <!-- Email -->
            <div class="lp-field">
              <AppTextField
                v-model="credentials.email"
                :label="t('auth.email')"
                type="email"
                :placeholder="t('auth.emailPh')"
                prepend-inner-icon="tabler-mail"
                :rules="[requiredValidator, emailValidator]"
                hide-details="auto"
              />
            </div>

            <!-- Password -->
            <div class="lp-field">
              <div class="lp-field-head">
                <span class="lp-label">{{ t('auth.password') }}</span>
                <RouterLink to="/forgot-password" class="lp-forgot">
                  {{ t('auth.forgotLink') }}
                </RouterLink>
              </div>
              <AppTextField
                v-model="credentials.password"
                :placeholder="t('auth.loginPasswordPh')"
                :type="isPasswordVisible ? 'text' : 'password'"
                autocomplete="current-password"
                prepend-inner-icon="tabler-lock"
                :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                :rules="[requiredValidator]"
                hide-details="auto"
              />
            </div>

            <!-- Remember me -->
            <label class="lp-remember">
              <input v-model="credentials.remember" type="checkbox" class="lp-cb-native" />
              <span class="lp-cb-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="m5 12 4.5 4.5L19 7" /></svg>
              </span>
              <span class="lp-cb-lbl">{{ t('auth.rememberMe') }}</span>
            </label>

            <!-- Server-side errors -->
            <VAlert
              v-if="isLoginError"
              color="error"
              variant="tonal"
              density="compact"
              prepend-icon="tabler-alert-circle"
              class="lp-alert"
            >
              {{ loginErrorMessage || t('auth.wrongCredentials') }}
            </VAlert>
            <VAlert
              v-if="isAccountInactive"
              color="warning"
              variant="tonal"
              density="compact"
              prepend-icon="tabler-user-off"
              class="lp-alert"
            >
              {{ loginErrorMessage || t('auth.accountDisabled') }}
            </VAlert>

            <!-- Submit -->
            <button class="lp-submit" type="submit" :disabled="isInProgress">
              {{ t('auth.loginBtn') }}
              <svg class="lp-submit-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="19" height="19"><path d="M5 12h13m0 0-5-5m5 5-5 5" /></svg>
            </button>
          </VForm>

          <p class="lp-legal">
            {{ t('auth.legalText') }}
            <a href="#" class="lp-legal-link">{{ t('auth.termsOfService') }}</a>
            &amp;
            <a href="#" class="lp-legal-link">{{ t('auth.privacyPolicy') }}</a>.
          </p>
        </div>
      </section>

    </div>
  </div>
</template>

<style lang="scss">
// ═══════════════════════════════════════════════════════
// Login Page — Meridian Design
// Light & dark mode for every component
// ═══════════════════════════════════════════════════════

// ── CSS tokens (light) ──
.lp-page {
  --lp-page-bg: oklch(0.967 0.003 255);
  --lp-page-glow: var(--bm-navy-tint);
  --lp-shell-bg: #ffffff;
  --lp-shell-border: oklch(0.925 0.005 262);
  --lp-shell-shadow: 0 1px 2px rgba(20,24,40,.05), 0 30px 70px -34px rgba(20,24,40,.42);
  --lp-ink-strong: oklch(0.27 0.018 262);
  --lp-ink: oklch(0.46 0.015 262);
  --lp-muted: oklch(0.62 0.012 262);
  --lp-navy: oklch(0.44 0.115 264);
  --lp-navy-deep: oklch(0.36 0.10 264);
  --lp-field-bg: oklch(0.985 0.002 262);
  --lp-field-bg-hover: oklch(0.99 0.004 264);
  --lp-field-border: oklch(0.925 0.005 262);
  --lp-field-border-hover: oklch(0.85 0.02 264);
  --lp-field-text: oklch(0.27 0.018 262);
  --lp-field-ph: oklch(0.62 0.012 262);
  --lp-cb-border: oklch(0.925 0.005 262);
  --lp-cb-bg: #ffffff;
  --lp-track-bg: oklch(0.92 0.04 264);
  --lp-loader-bg: #ffffff;
  --lp-loader-border: oklch(0.925 0.005 262);
}

// ── CSS tokens (dark) ──
.v-theme--dark .lp-page {
  --lp-page-bg: oklch(0.13 0.01 262);
  --lp-page-glow: oklch(0.22 0.05 264);
  --lp-shell-bg: oklch(0.17 0.012 262);
  --lp-shell-border: oklch(0.26 0.015 262);
  --lp-shell-shadow: 0 1px 3px rgba(0,0,0,.4), 0 30px 70px -34px rgba(0,0,0,.6);
  --lp-ink-strong: oklch(0.94 0.008 262);
  --lp-ink: oklch(0.78 0.010 262);
  --lp-muted: oklch(0.58 0.010 262);
  --lp-field-bg: oklch(0.21 0.015 262);
  --lp-field-bg-hover: oklch(0.23 0.016 262);
  --lp-field-border: oklch(0.32 0.018 262);
  --lp-field-border-hover: oklch(0.40 0.025 264);
  --lp-field-text: oklch(0.93 0.007 262);
  --lp-field-ph: oklch(0.50 0.010 262);
  --lp-cb-border: oklch(0.34 0.018 262);
  --lp-cb-bg: oklch(0.21 0.015 262);
  --lp-track-bg: oklch(0.28 0.04 264);
  --lp-loader-bg: oklch(0.19 0.014 262);
  --lp-loader-border: oklch(0.28 0.015 262);
}

// ─────────────────────────────────────────────
// Page wrapper
// ─────────────────────────────────────────────

.lp-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  background:
    radial-gradient(120% 80% at 80% -10%, var(--lp-page-glow) 0%, transparent 52%),
    var(--lp-page-bg);
}

// Force Plus Jakarta Sans on ALL elements inside login page,
// including Vuetify components that set font-family explicitly.
.lp-page *,
.lp-overlay * {
  font-family: "Plus Jakarta Sans", system-ui, sans-serif !important;
}

// ─────────────────────────────────────────────
// Shell card
// ─────────────────────────────────────────────

.lp-shell {
  width: min(1040px, 100%);
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  background: var(--lp-shell-bg);
  border: 1px solid var(--lp-shell-border);
  border-radius: 28px;
  box-shadow: var(--lp-shell-shadow);
  overflow: hidden;
}

// ─────────────────────────────────────────────
// Brand panel (always dark — no theme override)
// ─────────────────────────────────────────────

.lp-brand {
  position: relative;
  padding: 46px 46px 40px;
  color: #fff;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(130% 100% at 88% 8%, oklch(0.50 0.13 264) 0%, transparent 56%),
    linear-gradient(160deg, oklch(0.36 0.10 264) 0%, oklch(0.30 0.08 264) 100%);
  overflow: hidden;
  isolation: isolate;

  &::before {
    content: "";
    position: absolute; inset: 0; z-index: -1;
    background-image: radial-gradient(circle at 78% 14%, rgba(255,255,255,.10) 0, rgba(255,255,255,.10) 1px, transparent 1.4px);
    background-size: 22px 22px;
    mask-image: radial-gradient(120% 90% at 80% 10%, #000 0%, transparent 70%);
    opacity: .6;
  }

  &::after {
    content: "";
    position: absolute; z-index: -1;
    width: 460px; height: 460px; right: -180px; bottom: -200px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,.08);
    box-shadow: 0 0 0 36px rgba(255,255,255,.035), 0 0 0 92px rgba(255,255,255,.025);
  }
}

.lp-brand-top {
  display: flex;
  align-items: center;
  gap: 13px;
}

.lp-brand-mark {
  width: 46px; height: 46px; flex: none;
  border-radius: 13px;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.18);
  display: grid; place-items: center;
  backdrop-filter: blur(4px);
}

.lp-brand-name {
  display: flex; flex-direction: column; line-height: 1.05;

  b    { font-size: 18px; font-weight: 800; letter-spacing: -0.02em; }
  span { font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,.62); margin-top: 4px; }
}

.lp-brand-hero {
  margin-top: auto;
  padding-top: 56px;

  h1 { margin: 0; font-size: 33px; line-height: 1.16; font-weight: 800; letter-spacing: -0.03em; max-width: 16ch; text-wrap: balance; color: #fff; }
  p  { margin: 16px 0 0; font-size: 14.5px; line-height: 1.6; font-weight: 500; color: rgba(255,255,255,.74); max-width: 34ch; }
}

.lp-feats { margin-top: 30px; display: flex; flex-direction: column; gap: 13px; }

.lp-feat {
  display: flex; align-items: center; gap: 12px;
  font-size: 13.5px; font-weight: 600; color: rgba(255,255,255,.9);
}

.lp-feat-dot {
  width: 26px; height: 26px; flex: none; border-radius: 8px;
  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.16);
  display: grid; place-items: center; color: #fff;
}

// ─────────────────────────────────────────────
// Form side
// ─────────────────────────────────────────────

.lp-form-side {
  padding: 52px 52px 46px;
  display: flex; flex-direction: column; justify-content: center;
  background: var(--lp-shell-bg);
}

.lp-form-wrap { width: 100%; max-width: 380px; margin: 0 auto; }

.lp-welcome   { margin-bottom: 30px; }

.lp-eyebrow {
  font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--lp-navy);
}

.lp-h2 {
  margin: 9px 0 0; font-size: 27px; font-weight: 800;
  letter-spacing: -0.03em; color: var(--lp-ink-strong); line-height: 1.18;
}

.lp-desc {
  margin: 9px 0 0; font-size: 14.5px; line-height: 1.5;
  color: var(--lp-muted); font-weight: 500;
}

.lp-vform { display: flex; flex-direction: column; gap: 19px; }

// ─────────────────────────────────────────────
// Field wrappers & labels
// ─────────────────────────────────────────────

.lp-field {
  display: flex;
  flex-direction: column;

  // AppTextField external label override
  .app-text-field > .v-label {
    font-size: 13.5px !important;
    font-weight: 700 !important;
    letter-spacing: -0.01em !important;
    color: var(--lp-ink-strong) !important;
    opacity: 1 !important;
    margin-bottom: 9px !important;
    line-height: 1 !important;
  }
}

.lp-field-head {
  display: flex; align-items: baseline;
  justify-content: space-between; gap: 12px;
  margin-bottom: 9px;
}

.lp-label {
  font-size: 13.5px; font-weight: 700;
  letter-spacing: -0.01em; color: var(--lp-ink-strong);
}

.lp-forgot {
  font-size: 12.5px; font-weight: 600;
  color: var(--lp-navy); text-decoration: none;
  &:hover { text-decoration: underline; }
}

// ─────────────────────────────────────────────
// AppTextField — replace Vuetify outline with
// box-shadow so the border is perfectly uniform
// ─────────────────────────────────────────────

.lp-form-side {

  // 1. Hide Vuetify's 3-part outline segments
  .v-field--variant-outlined .v-field__outline {
    display: none;
  }

  // 2. Draw border via box-shadow + set bg + radius
  .v-field--variant-outlined {
    border-radius: 13px;
    background: var(--lp-field-bg);
    box-shadow: 0 0 0 1.5px var(--lp-field-border);
    transition: box-shadow 0.18s, background 0.18s;
  }

  // 3. Hover
  .v-field--variant-outlined:hover:not(.v-field--focused):not(.v-field--error) {
    box-shadow: 0 0 0 1.5px var(--lp-field-border-hover);
    background: var(--lp-field-bg-hover);
  }

  // 4. Focus — navy border + ring
  .v-field--variant-outlined.v-field--focused {
    box-shadow:
      0 0 0 1.5px var(--lp-navy),
      0 0 0 4.5px color-mix(in oklab, var(--lp-navy) 14%, transparent);
    background: var(--lp-field-bg-hover);
  }

  // 5. Error
  .v-field--variant-outlined.v-field--error {
    box-shadow: 0 0 0 1.5px rgb(var(--v-theme-error));
  }

  // 6. Input sizing & typography
  .v-field__input {
    min-height: 54px !important;
    padding-block: 0 !important;
    font-size: 14.5px !important;
    font-weight: 500 !important;
    letter-spacing: -0.01em !important;
    color: var(--lp-field-text) !important;

    input {
      color: var(--lp-field-text) !important;
      font-size: 14.5px !important;
      font-weight: 500 !important;
      letter-spacing: -0.01em !important;
    }
    input::placeholder {
      color: var(--lp-field-ph) !important;
      font-weight: 500 !important;
      opacity: 1;
    }
  }

  // 7. Remove prepend-inner divider line
  .v-field__prepend-inner {
    padding-inline-end: 4px;
  }

  // 8. Icon colors
  .v-field__prepend-inner .v-icon,
  .v-field__append-inner  .v-icon {
    color: var(--lp-muted) !important;
    opacity: 1 !important;
    transition: color 0.18s;
  }

  .v-field--focused .v-field__prepend-inner .v-icon {
    color: var(--lp-navy) !important;
  }
}

// ─────────────────────────────────────────────
// Remember me checkbox
// ─────────────────────────────────────────────

.lp-remember {
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; margin-top: -4px;
}

.lp-cb-native {
  position: absolute; opacity: 0; width: 0; height: 0;
}

.lp-cb-box {
  width: 20px; height: 20px; flex: none;
  border-radius: 6px;
  border: 1.5px solid var(--lp-cb-border);
  background: var(--lp-cb-bg);
  display: grid; place-items: center;
  transition: background 0.16s, border-color 0.16s;
  color: #fff;

  svg { opacity: 0; transform: scale(.6); transition: opacity 0.16s, transform 0.16s; }
}

.lp-cb-native:checked + .lp-cb-box {
  background: var(--lp-navy); border-color: var(--lp-navy);
  svg { opacity: 1; transform: none; }
}

.lp-cb-native:focus-visible + .lp-cb-box {
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--lp-navy) 14%, transparent);
}

.lp-cb-lbl {
  font-size: 13.5px; font-weight: 600; color: var(--lp-ink);
}

// ─────────────────────────────────────────────
// Error alert
// ─────────────────────────────────────────────

.lp-alert {
  border-radius: 10px !important;
}

// ─────────────────────────────────────────────
// Submit button
// ─────────────────────────────────────────────

.lp-submit {
  height: 54px; width: 100%;
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  font-size: 15px; font-weight: 700; letter-spacing: -0.01em;
  color: #fff; background: var(--lp-navy); border: 0; border-radius: 13px;
  cursor: pointer; transition: background 0.16s, transform 0.1s, box-shadow 0.16s;
  box-shadow: 0 14px 30px -14px color-mix(in oklab, var(--lp-navy) 78%, transparent);

  &:hover:not(:disabled)               { background: var(--lp-navy-deep); }
  &:hover:not(:disabled) .lp-submit-arrow { transform: translateX(3px); }
  &:active:not(:disabled)              { transform: translateY(1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
}

.lp-submit-arrow { transition: transform 0.18s; }

// ─────────────────────────────────────────────
// Legal footer
// ─────────────────────────────────────────────

.lp-legal {
  margin: 26px 0 0; text-align: center;
  font-size: 12.5px; line-height: 1.5;
  color: var(--lp-muted); font-weight: 500;
}

.lp-legal-link {
  color: var(--lp-navy); text-decoration: none; font-weight: 600;
  &:hover { text-decoration: underline; }
}

// ─────────────────────────────────────────────
// Loading overlay
// ─────────────────────────────────────────────

.lp-overlay {
  position: fixed; inset: 0; z-index: 9999;
  display: grid; place-items: center;
  background: color-mix(in oklab, oklch(0.30 0.08 264) 34%, rgba(15,18,32,.50));
  backdrop-filter: blur(6px);
}

.lp-loader-card {
  width: min(360px, calc(100% - 40px));
  background: var(--lp-loader-bg);
  border: 1px solid var(--lp-loader-border);
  border-radius: 22px;
  box-shadow: var(--bm-shadow-card);
  padding: 38px 34px 34px;
  text-align: center;
}

.lp-spinner { width: 62px; height: 62px; margin: 0 auto; position: relative; }

.lp-ring {
  width: 100%; height: 100%; border-radius: 50%;
  border: 4px solid var(--lp-track-bg);
  border-top-color: var(--lp-navy);
  animation: lp-spin .8s linear infinite;
}

.lp-pin {
  position: absolute; inset: 0; display: grid; place-items: center;
  color: var(--lp-navy);
}

@keyframes lp-spin { to { transform: rotate(360deg); } }

.lp-loader-title {
  margin: 22px 0 0; font-size: 18px; font-weight: 800;
  letter-spacing: -0.02em; color: var(--lp-ink-strong);
}

.lp-dots {
  display: inline-flex; gap: 4px; margin-left: 2px; vertical-align: middle;

  i {
    width: 4px; height: 4px; border-radius: 50%;
    background: var(--lp-muted); display: inline-block;
    animation: lp-blink 1.3s infinite both;
    &:nth-child(2) { animation-delay: .18s; }
    &:nth-child(3) { animation-delay: .36s; }
  }
}

@keyframes lp-blink { 0%,60%,100% { opacity:.25; } 30% { opacity:1; } }

.lp-loader-sub {
  margin: 7px 0 0; font-size: 13.5px;
  font-weight: 500; color: var(--lp-muted);
}

.lp-track {
  margin-top: 22px; height: 5px; border-radius: 99px;
  background: var(--lp-track-bg); overflow: hidden;
}

.lp-bar {
  height: 100%; width: 38%; border-radius: 99px;
  background: var(--lp-navy);
  animation: lp-slide 1.25s cubic-bezier(.5,0,.5,1) infinite;
}

@keyframes lp-slide { 0% { transform: translateX(-110%); } 100% { transform: translateX(320%); } }

// ─────────────────────────────────────────────
// Overlay entrance transition
// ─────────────────────────────────────────────

.lp-fade-enter-active         { transition: opacity .28s ease; }
.lp-fade-leave-active         { transition: opacity .2s ease; }
.lp-fade-enter-from,
.lp-fade-leave-to             { opacity: 0; }

.lp-fade-enter-active .lp-loader-card { transition: transform .3s cubic-bezier(.34,1.3,.5,1); }
.lp-fade-enter-from   .lp-loader-card { transform: translateY(10px) scale(.97); }

// ─────────────────────────────────────────────
// Responsive
// ─────────────────────────────────────────────

@media (max-width: 860px) {
  .lp-shell          { grid-template-columns: 1fr; max-width: 480px; border-radius: 24px; }
  .lp-brand          { padding: 34px 34px 30px; }
  .lp-brand-hero     { padding-top: 34px; h1 { font-size: 27px; } }
  .lp-feats          { display: none; }
  .lp-form-side      { padding: 40px 34px 38px; }
}

@media (max-width: 460px) {
  .lp-page  { padding: 0; align-items: stretch; }
  .lp-shell { border: 0; border-radius: 0; min-height: 100dvh; box-shadow: none; max-width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .lp-ring  { animation-duration: 1.6s; }
  .lp-bar   { animation: none; width: 60%; }
  .lp-dots i { animation: none; opacity: .6; }
}
</style>
