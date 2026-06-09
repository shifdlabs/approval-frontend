<script setup lang="ts">
import FileUploadIcon from '@/components/buttons/FileUploadIcon.vue';
import { letterHeadController } from '@/controllers/admin/letter-head-controller';

const {
  imageUrl,
  initialFormData,
  isSuccessSnackbarVisible,
  isSaving,
  updateLetterhead,
  previewLetterhead,
  handleFileSelected,
  removeImage
} = letterHeadController();

const { t } = useI18n()
</script>

<template>
    <VCard class="mb-6">
    <template #title>
      <div class="v-card-title text-wrap">
        {{ t('letterhead.title') }}
      </div>
    </template>

    <template #subtitle>
      <div class="text-wrap">
        {{ t('letterhead.subtitle') }}
      </div>
    </template>
    <VCardText>
      <VRow>
        <VCol cols="12">
          <div class="d-flex align-center flex-wrap gap-4">
            <!-- Image Preview -->
            <div v-if="imageUrl != ''" class="d-flex flex-column align-center">
              <img :src="imageUrl" alt="Letterhead Preview" style="max-width: 150px; max-height: 150px; border: 2px solid #e0e0e0; border-radius: 8px; padding: 4px;"/>
              <div class="d-flex gap-2 mt-2">
                <VBtn
                  size="small"
                  color="error"
                  variant="tonal"
                  @click="removeImage"
                >
                  {{ t('letterhead.remove') }}
                </VBtn>
              </div>
            </div>

            <!-- File Upload Component -->
            <div>
              <FileUploadIcon :initialUrl="initialFormData.companyLogoUrl" @file-selected="handleFileSelected"/>
            </div>

            <VRow style="flex-direction: column;" class="ml-2">
              <VLabel>
                {{ t('letterhead.allowedFormats') }}
              </VLabel>
              <VLabel v-if="imageUrl != ''" class="text-success">
                {{ t('letterhead.uploaded') }}
              </VLabel>
            </VRow>
          </div>
        <VSpacer></VSpacer>
        </VCol>

        <VCol cols="12">
          <AppTextField
            v-model="initialFormData.companyName"
            :label="t('letterhead.companyName')"
            :placeholder="t('letterhead.companyNamePh')"
          />
        </VCol>

        <VCol cols="12">
          <AppTextField
            v-model="initialFormData.description"
            :label="t('letterhead.description')"
            :placeholder="t('letterhead.descriptionPh')"
          />
        </VCol>

        <VCol
        cols="12"
        md="6">
          <AppTextField
            v-model="initialFormData.email"
            :label="t('letterhead.email')"
            :placeholder="t('letterhead.emailPh')"
          />
        </VCol>

        <VCol
        cols="12"
        md="6">
          <AppTextField
            v-model="initialFormData.phoneNumber"
            :label="t('letterhead.phone')"
            :placeholder="t('letterhead.phonePh')"
          />
        </VCol>

        <VCol
        cols="12"
        md="6">
          <AppTextField
            v-model="initialFormData.address"
            :label="t('letterhead.address')"
            :placeholder="t('letterhead.addressPh')"
          />
        </VCol>

        <VCol
        cols="12"
        md="6">
          <AppTextField
            v-model="initialFormData.city"
            :label="t('letterhead.city')"
            :placeholder="t('letterhead.cityPh')"
          />
        </VCol>

        <VCol
              cols="12"
              class="d-flex flex-wrap gap-4"
            >
              <VBtn
                color="primary"
                variant="tonal"
                @click="previewLetterhead"
                :disabled="isSaving"
              >
                {{ t('letterhead.preview') }}
              </VBtn>

              <VBtn
              type="submit"
              @click="updateLetterhead"
              :loading="isSaving"
              :disabled="isSaving"
              >
                {{ isSaving ? t('letterhead.saving') : t('letterhead.save') }}
              </VBtn>
            </VCol>
      </VRow>
    </VCardText>
  </VCard>

  <!-- Loading Overlay -->
  <VOverlay
    v-model="isSaving"
    contained
    persistent
    class="align-center justify-center"
  >
    <VProgressCircular
      indeterminate
      size="64"
      color="primary"
    />
    <div class="text-h6 mt-4">{{ t('letterhead.saving') }}</div>
  </VOverlay>

  <VSnackbar
    v-model="isSuccessSnackbarVisible"
    multi-line
    :timeout="3000"
  >
    {{ t('letterhead.saved') }}

    <template #actions>
      <VBtn
        color="success"
        @click="isSuccessSnackbarVisible = false"
      >
        {{ t('letterhead.close') }}
      </VBtn>
    </template>
  </VSnackbar>
</template>
  