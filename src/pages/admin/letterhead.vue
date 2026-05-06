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
</script>

<template>
    <VCard class="mb-6">
    <template #title>
      <div class="v-card-title text-wrap">
        Manage Letterhead
      </div>
    </template>

    <template #subtitle>
      <div class="text-wrap">
        All the information you’ve entered below will be compiled into a letterhead for your letter.
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
                  Remove
                </VBtn>
              </div>
            </div>

            <!-- File Upload Component -->
            <div>
              <FileUploadIcon :initialUrl="initialFormData.companyLogoUrl" @file-selected="handleFileSelected"/>
            </div>

            <VRow style="flex-direction: column;" class="ml-2">
              <VLabel>
                Allowed formats: PNG, JPG, JPEG. Max size of 1Mb
              </VLabel>
              <VLabel v-if="imageUrl != ''" class="text-success">
                ✓ Letterhead uploaded
              </VLabel>
            </VRow>
          </div>
        <VSpacer></VSpacer>
        </VCol>

        <VCol cols="12">
          <AppTextField
            v-model="initialFormData.companyName"
            label="Company Name"
            placeholder="Enter your company name"
          />
        </VCol>

        <VCol cols="12">
          <AppTextField
            v-model="initialFormData.description"
            label="Description"
            placeholder="Enter your company description"
          />
        </VCol>

        <VCol 
        cols="12"
        md="6">
          <AppTextField
            v-model="initialFormData.email"
            label="Email"
            placeholder="Enter your company email"
          />
        </VCol>

        <VCol 
        cols="12"
        md="6">
          <AppTextField
            v-model="initialFormData.phoneNumber"
            label="Phone Number"
            placeholder="Enter your company phone number"
          />
        </VCol>

        <VCol 
        cols="12"
        md="6">
          <AppTextField
            v-model="initialFormData.address"
            label="Address"
            placeholder="Enter your company address"
          />
        </VCol>

        <VCol 
        cols="12"
        md="6">
          <AppTextField
            v-model="initialFormData.city"
            label="City"
            placeholder="Enter your company city"
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
                Preview as Letterhead
              </VBtn>

              <VBtn 
              type="submit"
              @click="updateLetterhead"
              :loading="isSaving"
              :disabled="isSaving"
              >
                Save Changes
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
    <div class="text-h6 mt-4">Saving...</div>
  </VOverlay>

  <VSnackbar
    v-model="isSuccessSnackbarVisible"
    multi-line
    :timeout="3000"
  >
    Your data has been successfully stored.

    <template #actions>
      <VBtn
        color="success"
        @click="isSuccessSnackbarVisible = false"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>
</template>
  