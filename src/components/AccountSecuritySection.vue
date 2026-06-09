<script lang="ts" setup>
import { computed, ref } from 'vue'
import { User } from '@/models/users/users';
import { VForm } from 'vuetify/components';

const isCurrentPasswordVisible = ref(false)
const isNewPasswordVisible      = ref(false)
const isConfirmPasswordVisible  = ref(false)
const isAllInputtedValid        = ref(true)
const user                      = ref<User>()

onMounted(() => { fetchProfile() })

const initialFormData = { currentPassword: '', newPassword: '', confirmNewPassword: '' }
const formData        = ref({ ...initialFormData })
const refVForm        = ref<VForm>()
const isChangePasswordDialogVisible = ref(false)
const isSuccessDialogVisible        = ref(false)

const fetchProfile = async () => {
  try {
    const res = await useApi('/user/profile', { method: 'GET' })
    const value = res.data.value as { data: any }
    user.value = { ...value.data }
  } catch (e) {
    console.error(e)
  }
}

const passwordStrength = computed(() => {
  const v = formData.value.newPassword
  if (!v) return { score: 0, label: 'Lemah', color: '#e8eaf2', checks: { len: false, lower: false, num: false } }

  const checks = {
    len:   v.length >= 8,
    lower: /[a-z]/.test(v),
    num:   /[\d\s\W]/.test(v),
  }
  let score = Object.values(checks).filter(Boolean).length
  if (v.length >= 12 && score === 3) score = 4

  const labels = ['Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat']
  const colors = ['#e8eaf2', '#ef4444', '#f59e0b', '#3d5fc8', '#16a34a']
  return { score, label: labels[score], color: colors[score], checks }
})

const updatePassword = async () => {
  try {
    const { execute, error, data, onFetchError } = useApi(
      '/user/password',
      {
        method: 'PUT',
        body: JSON.stringify({
          id: user.value?.id,
          currentPassword: formData.value.currentPassword,
          newPassword:     formData.value.newPassword,
        }),
        headers: { 'Content-Type': 'application/json' },
      },
      { immediate: false }
    )

    onFetchError((err: any) => {
      console.error('Fetch error:', err)
      alert('Gagal memperbarui kata sandi. Periksa kata sandi saat ini dan coba lagi.')
    })

    await execute()

    if (error.value) {
      console.error('Error updating password:', error.value)
      alert('Gagal memperbarui kata sandi.')
      return
    }

    const response = data.value as any
    if (response?.success) {
      isChangePasswordDialogVisible.value = false
      isSuccessDialogVisible.value        = true
      refVForm.value?.reset()
    } else {
      alert('Gagal memperbarui kata sandi. Coba lagi.')
    }
  } catch (e) {
    console.error('Exception updating password:', e)
    alert('Terjadi kesalahan saat memperbarui kata sandi.')
  }
}

const onFormSubmit = async () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      isAllInputtedValid.value              = true
      isChangePasswordDialogVisible.value   = true
    } else {
      isAllInputtedValid.value = false
    }
  })
}
</script>

<template>
  <div class="pse-wrap">
    <VForm ref="refVForm" @submit.prevent="onFormSubmit">
      <div class="pse-card">

        <!-- Card Header -->
        <div class="pse-ch">
          <span class="pse-ch__ic">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M11.8 11.2 20 11.2M17.5 11.2v3M14.4 11.2v2.4"/></svg>
          </span>
          <div>
            <h2 class="pse-ch__title">Ubah Kata Sandi</h2>
            <div class="pse-ch__sub">Perbarui kata sandi untuk menjaga keamanan akun</div>
          </div>
        </div>

        <!-- Card Body -->
        <div class="pse-cbody">
          <VAlert v-if="!isAllInputtedValid" type="error" variant="tonal" class="pse-alert mb-6" border="start">
            Harap ikuti aturan form input di bawah.
          </VAlert>

          <div class="pse-pwd-grid">
            <!-- Form Fields -->
            <div class="pse-form">
              <div class="pse-ipt">
                <label class="pse-ipt__label">Kata Sandi Saat Ini</label>
                <AppTextField
                  v-model="formData.currentPassword"
                  placeholder="Masukkan kata sandi saat ini"
                  autocomplete="current-password"
                  :type="isCurrentPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isCurrentPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isCurrentPasswordVisible = !isCurrentPasswordVisible"
                  :rules="[requiredValidator]"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </div>

              <div class="pse-ipt">
                <label class="pse-ipt__label">Kata Sandi Baru</label>
                <AppTextField
                  v-model="formData.newPassword"
                  placeholder="Buat kata sandi baru"
                  autocomplete="new-password"
                  :type="isNewPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isNewPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible"
                  :rules="[requiredValidator, passwordValidator]"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <!-- Strength Meter -->
                <div class="pse-meter" v-if="formData.newPassword">
                  <div class="pse-meter__bars">
                    <span
                      v-for="i in 4"
                      :key="i"
                      class="pse-meter__bar"
                      :style="{ background: i <= passwordStrength.score ? passwordStrength.color : '#e8eaf2' }"
                    />
                  </div>
                  <span class="pse-meter__lab" :style="{ color: passwordStrength.score > 0 ? passwordStrength.color : '#8b90b8' }">
                    {{ passwordStrength.label }}
                  </span>
                </div>
              </div>

              <div class="pse-ipt">
                <label class="pse-ipt__label">Konfirmasi Kata Sandi</label>
                <AppTextField
                  v-model="formData.confirmNewPassword"
                  placeholder="Ulangi kata sandi baru"
                  autocomplete="new-password"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                  :rules="[requiredValidator, confirmedValidator(formData.confirmNewPassword, formData.newPassword)]"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </div>
            </div>

            <!-- Requirements Panel -->
            <div class="pse-reqs">
              <h3 class="pse-reqs__title">Syarat Kata Sandi</h3>
              <div class="pse-reqs__note">Penuhi semua syarat berikut</div>

              <div class="pse-req" :class="{ 'pse-req--met': passwordStrength.checks.len }">
                <span class="pse-req__mk">
                  <svg v-if="passwordStrength.checks.len" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="m5.5 12.5 4 4 9-9.5"/></svg>
                  <svg v-else viewBox="0 0 24 24"><rect x="5.2" y="10.5" width="13.6" height="9.3" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/></svg>
                </span>
                Minimal 8 karakter — semakin panjang semakin baik.
              </div>

              <div class="pse-req" :class="{ 'pse-req--met': passwordStrength.checks.lower }">
                <span class="pse-req__mk">
                  <svg v-if="passwordStrength.checks.lower" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="m5.5 12.5 4 4 9-9.5"/></svg>
                  <svg v-else viewBox="0 0 24 24"><rect x="5.2" y="10.5" width="13.6" height="9.3" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/></svg>
                </span>
                Mengandung minimal satu huruf kecil.
              </div>

              <div class="pse-req" :class="{ 'pse-req--met': passwordStrength.checks.num }">
                <span class="pse-req__mk">
                  <svg v-if="passwordStrength.checks.num" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="m5.5 12.5 4 4 9-9.5"/></svg>
                  <svg v-else viewBox="0 0 24 24"><rect x="5.2" y="10.5" width="13.6" height="9.3" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/></svg>
                </span>
                Mengandung satu angka, simbol, atau spasi.
              </div>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="pse-foot">
          <button type="submit" class="pse-btn pse-btn--primary">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="M12 3.4 5 5.9v5.5c0 4.2 3 7.1 7 9.2 4-2.1 7-5 7-9.2V5.9z"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="m9 12 2.2 2.2 4-4.2"/></svg>
            Simpan Kata Sandi
          </button>
        </div>

      </div>
    </VForm>
  </div>

  <!-- Confirm Dialog -->
  <VDialog v-model="isChangePasswordDialogVisible" persistent class="v-dialog-sm">
    <DialogCloseBtn @click="isChangePasswordDialogVisible = false" />
    <VCard title="Konfirmasi Perubahan Kata Sandi">
      <VCardText>Apakah Anda yakin ingin mengubah kata sandi akun?</VCardText>
      <VCardText class="d-flex justify-end gap-3 flex-wrap">
        <VBtn color="secondary" variant="tonal" @click="isChangePasswordDialogVisible = false">Batal</VBtn>
        <VBtn @click="updatePassword">Ya, Ubah Kata Sandi</VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Success Dialog -->
  <VDialog v-model="isSuccessDialogVisible" persistent class="v-dialog-sm">
    <DialogCloseBtn @click="isSuccessDialogVisible = false" />
    <VCard title="Berhasil">
      <VCardText>Kata sandi Anda telah berhasil diubah.</VCardText>
      <VCardText class="d-flex justify-end gap-3 flex-wrap">
        <VBtn color="success" @click="isSuccessDialogVisible = false">OK</VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped lang="scss">
.pse-wrap {
  --pse-navy:      #3d5fc8;
  --pse-navy-deep: #2e4db5;
  --pse-navy-tint: #eef1fb;
  --pse-green:     #16a34a;
  --pse-green-tint:#f0fdf4;
  --pse-ink-strong:#1e2440;
  --pse-ink:       #4b5280;
  --pse-muted:     #8b90b8;
  --pse-line:      #e8eaf2;
  --pse-line-soft: #f0f2f7;
  --pse-shadow:    0 1px 2px rgba(20,24,40,.04), 0 14px 34px -22px rgba(20,24,40,.22);
  --pse-shadow-card: 0 1px 2px rgba(20,24,40,.05), 0 22px 48px -30px rgba(20,24,40,.26);

  padding: 0 28px 36px;
}

/* ===== Card ===== */
.pse-card {
  background: #fff;
  border: 1px solid var(--pse-line);
  border-radius: 20px;
  box-shadow: var(--pse-shadow-card);
  overflow: hidden;
}

/* ===== Card Header ===== */
.pse-ch {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--pse-line-soft);
}

.pse-ch__ic {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--pse-navy-tint);
  color: var(--pse-navy);
  display: grid;
  place-items: center;
  flex: none;

  svg { width: 21px; height: 21px; }
}

.pse-ch__title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--pse-ink-strong);
}

.pse-ch__sub {
  font-size: 12.5px;
  color: var(--pse-muted);
  font-weight: 500;
  margin-top: 2px;
}

/* ===== Card Body ===== */
.pse-cbody { padding: 28px 24px 0; }

.pse-pwd-grid {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 32px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

/* ===== Form Field ===== */
.pse-form { display: flex; flex-direction: column; gap: 6px; }

.pse-ipt { margin-bottom: 12px; }

.pse-ipt__label {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--pse-muted);
  margin-bottom: 8px;
}

/* ===== Strength Meter ===== */
.pse-meter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.pse-meter__bars {
  display: flex;
  gap: 5px;
  flex: 1;
}

.pse-meter__bar {
  height: 6px;
  flex: 1;
  border-radius: 99px;
  background: var(--pse-line);
  transition: background .25s ease;
}

.pse-meter__lab {
  font-size: 12px;
  font-weight: 700;
  color: var(--pse-muted);
  min-width: 72px;
  text-align: right;
  transition: color .25s;
}

/* ===== Requirements Panel ===== */
.pse-reqs {
  background: var(--pse-navy-tint);
  border: 1px solid rgba(61,95,200,.12);
  border-radius: 16px;
  padding: 22px;
  align-self: start;
}

.pse-reqs__title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--pse-ink-strong);
}

.pse-reqs__note {
  font-size: 12.5px;
  color: var(--pse-muted);
  font-weight: 500;
  margin-bottom: 16px;
}

.pse-req {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 9px 0;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--pse-ink);
  line-height: 1.4;
  transition: color .2s;

  &--met {
    color: var(--pse-ink-strong);

    .pse-req__mk {
      background: var(--pse-green);
      border-color: var(--pse-green);
      color: #fff;
    }
  }
}

.pse-req__mk {
  width: 22px;
  height: 22px;
  border-radius: 99px;
  flex: none;
  display: grid;
  place-items: center;
  background: #fff;
  border: 1.5px solid var(--pse-line);
  color: var(--pse-muted);
  transition: .2s;

  svg { width: 13px; height: 13px; }
}

/* ===== Card Footer ===== */
.pse-foot {
  display: flex;
  justify-content: flex-end;
  padding: 20px 24px 24px;
  margin-top: 24px;
  border-top: 1px solid var(--pse-line-soft);
}

/* ===== Button ===== */
.pse-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 24px;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
  border-radius: 13px;
  cursor: pointer;
  transition: .18s;
  white-space: nowrap;
  border: 0;

  svg { width: 18px; height: 18px; }

  &--primary {
    background: var(--pse-navy);
    color: #fff;
    box-shadow: 0 8px 18px -8px rgba(61,95,200,.65);
    &:hover { background: var(--pse-navy-deep); transform: translateY(-1px); }
  }
}

.pse-alert { border-radius: 12px; }
</style>
