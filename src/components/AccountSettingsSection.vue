<script lang="ts" setup>
import { User } from '@/models/users/users';

interface Props {
  user?: User,
  isUpdateProfileDialogVisible: boolean
  isChangeEmailDialogVisible: boolean
  isDeleteAccountDialogVisible: boolean
}

interface Emit {
  (e: 'update:isUpdateProfileDialogVisible', val: boolean): void
  (e: 'update:isChangeEmailDialogVisible', val: boolean): void
  (e: 'update:isDeleteAccountDialogVisible', val: boolean): void
}

const emit = defineEmits<Emit>()
const props = defineProps<Props>()

const showUpdateProfileDialog = () => emit('update:isUpdateProfileDialogVisible', true)
const showChangeEmailDialog   = () => emit('update:isChangeEmailDialogVisible', true)
const showDeleteAccountDialog = () => emit('update:isDeleteAccountDialogVisible', true)

const userConfirmed = ref(false)

const { t } = useI18n()
</script>

<template>
  <div class="pas-wrap">

    <!-- Personal Info Card -->
    <div class="pas-card">
      <div class="pas-ch">
        <span class="pas-ch__ic">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.4" r="3.8" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M5.5 19.2a6.5 6.5 0 0 1 13 0"/></svg>
        </span>
        <div>
          <h2 class="pas-ch__title">{{ t('settings.personal.title') }}</h2>
          <div class="pas-ch__sub">{{ t('settings.personal.subtitle') }}</div>
        </div>
        <button class="pas-btn pas-btn--ghost pas-ch__act" @click="showUpdateProfileDialog">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="M5 19h3l9.2-9.2a1.6 1.6 0 0 0 0-2.3l-1.7-1.7a1.6 1.6 0 0 0-2.3 0L4 14.9V19Z"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="M13.5 6.5 17 10"/></svg>
          {{ t('settings.personal.change') }}
        </button>
      </div>
      <div class="pas-cbody">
        <div class="pas-fgrid">
          <div class="pas-field">
            <label>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.4" r="3.8" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M5.5 19.2a6.5 6.5 0 0 1 13 0"/></svg>
              {{ t('settings.personal.firstName') }}
            </label>
            <div class="pas-val">{{ props.user?.firstName || '—' }}</div>
          </div>
          <div class="pas-field">
            <label>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.4" r="3.8" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M5.5 19.2a6.5 6.5 0 0 1 13 0"/></svg>
              {{ t('settings.personal.lastName') }}
            </label>
            <div class="pas-val">{{ props.user?.lastName || '—' }}</div>
          </div>
          <div class="pas-field">
            <label>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="M6.5 4h3l1.4 3.5-2 1.3a11 11 0 0 0 4.8 4.8l1.3-2 3.5 1.4v3a1.5 1.5 0 0 1-1.6 1.5A14.5 14.5 0 0 1 5 5.6 1.5 1.5 0 0 1 6.5 4Z"/></svg>
              {{ t('settings.personal.phone') }}
            </label>
            <div class="pas-val">{{ props.user?.phone || '—' }}</div>
          </div>
          <div class="pas-field">
            <label>
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="9" cy="11" r="2.1" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M13.5 9.5h3.2M13.5 12.5h3.2M6.6 15.6a2.7 2.7 0 0 1 4.8 0"/></svg>
              {{ t('settings.personal.position') }}
            </label>
            <div class="pas-val">{{ props.user?.position?.name || '—' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Email Card -->
    <div class="pas-card">
      <div class="pas-ch">
        <span class="pas-ch__ic">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.4" y="5.6" width="17.2" height="12.8" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="m4.6 7.5 7.4 5.2 7.4-5.2"/></svg>
        </span>
        <div>
          <h2 class="pas-ch__title">{{ t('settings.email.title') }}</h2>
          <div class="pas-ch__sub">{{ t('settings.email.subtitle') }}</div>
        </div>
      </div>
      <div class="pas-cbody">
        <div class="pas-email-row">
          <div class="pas-field pas-field--grow">
            <label>
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.4" y="5.6" width="17.2" height="12.8" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="m4.6 7.5 7.4 5.2 7.4-5.2"/></svg>
              {{ t('settings.email.address') }}
            </label>
            <div class="pas-val">
              {{ props.user?.email || '—' }}
              <span class="pas-verified">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="M12 3.4 5 5.9v5.5c0 4.2 3 7.1 7 9.2 4-2.1 7-5 7-9.2V5.9z"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="m9 12 2.2 2.2 4-4.2"/></svg>
                {{ t('settings.email.verified') }}
              </span>
            </div>
          </div>
          <button class="pas-btn pas-btn--ghost" @click="showChangeEmailDialog">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.4" y="5.6" width="17.2" height="12.8" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="m4.6 7.5 7.4 5.2 7.4-5.2"/></svg>
            {{ t('settings.email.changeBtn') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Danger Zone Card -->
    <div class="pas-card pas-card--danger">
      <div class="pas-ch">
        <span class="pas-ch__ic">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="M12 4.5 3.5 19h17z"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 10v4"/><circle cx="12" cy="16.6" r="1.05" fill="currentColor"/></svg>
        </span>
        <div>
          <h2 class="pas-ch__title">{{ t('settings.danger.title') }}</h2>
          <div class="pas-ch__sub">{{ t('settings.danger.subtitle') }}</div>
        </div>
      </div>
      <div class="pas-cbody">
        <p class="pas-danger__desc">{{ t('settings.danger.desc') }}</p>
        <label class="pas-confirm" :class="{ 'pas-confirm--checked': userConfirmed }" @click="userConfirmed = !userConfirmed">
          <span class="pas-cbox">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="m5.5 12.5 4 4 9-9.5"/></svg>
          </span>
          <span>{{ t('settings.danger.confirm') }}</span>
        </label>
        <button
          class="pas-btn pas-btn--deactivate"
          :class="{ 'pas-btn--deactivate-on': userConfirmed }"
          :disabled="!userConfirmed"
          @click="showDeleteAccountDialog"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="M12 4.5 3.5 19h17z"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 10v4"/><circle cx="12" cy="16.6" r="1.05" fill="currentColor"/></svg>
          {{ t('settings.danger.deactivate') }}
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
.pas-wrap {
  --pas-navy:      #3d5fc8;
  --pas-navy-deep: #2e4db5;
  --pas-navy-tint: #eef1fb;
  --pas-red:       #dc2626;
  --pas-red-tint:  #fef2f2;
  --pas-green:     #16a34a;
  --pas-green-tint:#f0fdf4;
  --pas-ink-strong:#1e2440;
  --pas-ink:       #4b5280;
  --pas-muted:     #8b90b8;
  --pas-line:      #e8eaf2;
  --pas-line-soft: #f0f2f7;
  --pas-field-bg:  #fafbfe;
  --pas-shadow:    0 1px 2px rgba(20,24,40,.04), 0 14px 34px -22px rgba(20,24,40,.22);

  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 0 28px 36px;
}

/* ===== Card ===== */
.pas-card {
  background: #fff;
  border: 1px solid var(--pas-line);
  border-radius: 20px;
  box-shadow: var(--pas-shadow);
  overflow: hidden;

  &--danger {
    border-color: rgba(220,38,38,.22);
    .pas-ch__ic { background: var(--pas-red-tint); color: var(--pas-red); }
    .pas-ch { border-bottom-color: rgba(220,38,38,.10); }
  }
}

/* ===== Card Header ===== */
.pas-ch {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--pas-line-soft);
}

.pas-ch__ic {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--pas-navy-tint);
  color: var(--pas-navy);
  display: grid;
  place-items: center;
  flex: none;

  svg { width: 21px; height: 21px; }
}

.pas-ch__title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--pas-ink-strong);
}

.pas-ch__sub {
  font-size: 12.5px;
  color: var(--pas-muted);
  font-weight: 500;
  margin-top: 2px;
}

.pas-ch__act { margin-left: auto; }

/* ===== Buttons ===== */
.pas-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 18px;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
  border-radius: 11px;
  cursor: pointer;
  transition: .18s;
  white-space: nowrap;
  border: 0;

  svg { width: 17px; height: 17px; }

  &--ghost {
    background: #fff;
    color: var(--pas-navy);
    border: 1.5px solid rgba(61,95,200,.22);
    &:hover { background: var(--pas-navy-tint); border-color: var(--pas-navy); }
  }

  &--deactivate {
    height: 48px;
    padding: 0 24px;
    font-size: 14.5px;
    background: var(--pas-red);
    color: #fff;
    opacity: .45;
    pointer-events: none;
    box-shadow: 0 8px 18px -8px rgba(220,38,38,.60);

    &-on {
      opacity: 1;
      pointer-events: auto;
      &:hover { filter: brightness(1.05); transform: translateY(-1px); }
    }
  }
}

/* ===== Card Body ===== */
.pas-cbody { padding: 24px; }

/* ===== Field Grid ===== */
.pas-fgrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 22px;

  @media (max-width: 640px) { grid-template-columns: 1fr; }
}

.pas-field {
  &--grow { flex: 1; }

  label {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--pas-muted);
    margin-bottom: 8px;

    svg { width: 14px; height: 14px; color: var(--pas-navy); }
  }
}

.pas-val {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: 0 15px;
  background: var(--pas-field-bg);
  border: 1px solid var(--pas-line);
  border-radius: 11px;
  font-size: 15px;
  font-weight: 600;
  color: var(--pas-ink-strong);
  letter-spacing: -0.01em;
}

.pas-verified {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--pas-green);

  svg { width: 15px; height: 15px; }
}

/* ===== Email Row ===== */
.pas-email-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;

  @media (max-width: 640px) { flex-direction: column; align-items: stretch; }
}

/* ===== Danger Zone ===== */
.pas-danger__desc {
  margin: 0 0 18px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--pas-ink);
  font-weight: 500;
  max-width: 640px;
}

.pas-confirm {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--pas-red-tint);
  border: 1px solid rgba(220,38,38,.16);
  border-radius: 12px;
  margin-bottom: 18px;
  cursor: pointer;
  user-select: none;

  &--checked .pas-cbox {
    background: var(--pas-red);
    border-color: var(--pas-red);

    svg { opacity: 1; }
  }

  span:last-child {
    font-size: 14px;
    font-weight: 600;
    color: var(--pas-ink-strong);
  }
}

.pas-cbox {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  border: 2px solid rgba(220,38,38,.35);
  background: #fff;
  flex: none;
  display: grid;
  place-items: center;
  transition: .16s;

  svg { width: 14px; height: 14px; color: #fff; opacity: 0; transition: .16s; }
}
</style>
