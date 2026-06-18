<script setup lang="ts">
import { generalSettingsController } from '@/controllers/admin/general-settings-controller'

const {
  slaMaxDays,
  isLoading,
  isSaving,
  errorMessage,
  successMessage,
  saveSettings,
} = generalSettingsController()

const { t } = useI18n()

const isConfirmDialogVisible = ref(false)

const onConfirmSave = async () => {
  isConfirmDialogVisible.value = false
  await saveSettings()
}
</script>

<template>
  <VCard>
    <template #title>
      <div class="v-card-title text-wrap">{{ t('generalSettings.title') }}</div>
    </template>
    <template #subtitle>
      <div class="text-wrap">{{ t('generalSettings.subtitle') }}</div>
    </template>

    <VDivider />

    <VCardText>
      <div v-if="isLoading" class="d-flex justify-center py-8">
        <VProgressCircular indeterminate color="primary" />
      </div>

      <div v-else>
        <!-- SLA Section -->
        <div class="mb-6">
          <p class="text-subtitle-1 font-weight-semibold mb-1">{{ t('generalSettings.slaTitle') }}</p>
          <p class="text-body-2 text-medium-emphasis mb-4">{{ t('generalSettings.slaSubtitle') }}</p>

          <VRow>
            <VCol cols="12" sm="4">
              <AppTextField
                v-model.number="slaMaxDays"
                :label="t('generalSettings.slaMaxDays')"
                type="number"
                :min="1"
                :max="30"
                :rules="[
                  (v: number) => (v >= 1 && v <= 30) || t('generalSettings.slaValidation'),
                ]"
                :hint="t('generalSettings.slaHint')"
                persistent-hint
              />
            </VCol>
          </VRow>
        </div>

        <VAlert v-if="errorMessage" type="error" class="mb-4" density="compact" closable @click:close="errorMessage = ''">
          {{ errorMessage }}
        </VAlert>
        <VAlert v-if="successMessage" type="success" class="mb-4" density="compact" closable @click:close="successMessage = ''">
          {{ successMessage }}
        </VAlert>

        <VBtn
          color="primary"
          :loading="isSaving"
          @click="isConfirmDialogVisible = true"
        >
          {{ t('generalSettings.save') }}
        </VBtn>
      </div>
    </VCardText>
  </VCard>

  <!-- Confirmation Dialog -->
  <VDialog v-model="isConfirmDialogVisible" persistent :width="$vuetify.display.smAndDown ? 'auto' : 480">
    <VCard class="bm-dialog">
      <div class="bmd-head">
        <div class="bmd-mark">
          <VIcon icon="tabler-settings" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>{{ t('generalSettings.confirmTitle') }}</h2>
          <p>{{ t('generalSettings.confirmBody') }}</p>
        </div>
        <button class="bmd-close" type="button" @click="isConfirmDialogVisible = false">
          <VIcon icon="tabler-x" size="18" />
        </button>
      </div>
      <div class="bmd-foot">
        <button class="bmd-btn bmd-btn-ghost" type="button" @click="isConfirmDialogVisible = false">
          {{ t('generalSettings.cancelBtn') }}
        </button>
        <button
          class="bmd-btn bmd-btn-primary"
          type="button"
          :disabled="isSaving"
          @click="onConfirmSave"
        >
          {{ isSaving ? t('common.saving') : t('generalSettings.confirmBtn') }}
        </button>
      </div>
    </VCard>
  </VDialog>
</template>
