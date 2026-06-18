import { ref } from 'vue'

interface AppSetting {
  key: string
  value: string
}

export const generalSettingsController = () => {
  const slaMaxDays = ref<number>(7)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const fetchSettings = async () => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const res = await useApi('/appsettings', { method: 'GET' })
      const payload = res.data.value as any
      if (payload?.success && Array.isArray(payload.data)) {
        const slaSetting = payload.data.find((s: AppSetting) => s.key === 'sla_max_days')
        if (slaSetting) {
          slaMaxDays.value = Number(slaSetting.value) || 7
        }
      }
    } catch {
      errorMessage.value = 'Gagal memuat pengaturan.'
    } finally {
      isLoading.value = false
    }
  }

  const saveSettings = async () => {
    if (slaMaxDays.value < 1 || slaMaxDays.value > 30) {
      errorMessage.value = 'Durasi SLA harus antara 1 hingga 30 hari.'
      return
    }

    isSaving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
      const res = await useApi('/appsettings', {
        method: 'PUT',
        body: JSON.stringify({ properties: [{ key: 'sla_max_days', value: String(slaMaxDays.value) }] }),
        headers: { 'Content-Type': 'application/json' },
      })
      const payload = res.data.value as any
      if (payload?.success) {
        successMessage.value = 'Pengaturan berhasil disimpan.'
      } else {
        errorMessage.value = 'Gagal menyimpan pengaturan.'
      }
    } catch {
      errorMessage.value = 'Gagal menyimpan pengaturan.'
    } finally {
      isSaving.value = false
    }
  }

  fetchSettings()

  return {
    slaMaxDays,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    saveSettings,
  }
}
