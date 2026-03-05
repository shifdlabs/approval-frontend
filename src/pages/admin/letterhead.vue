<script setup lang="ts">
import FileUploadIcon from '@/components/buttons/FileUploadIcon.vue';
import { letterHeadController } from '@/controllers/admin/letter-head-controller';

const {
  imageUrl,
  initialFormData,
  isSuccessSnackbarVisible,
  updateLetterhead,
  handleFileSelected
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
          <div class="d-flex align-center flex-wrap">
            <div v-if="imageUrl != ''">
              <img :src="imageUrl" alt="Example Image" style="max-width: 100px; max-height: 100px;"/>
            </div>

            <div v-else>
              <FileUploadIcon :initialUrl="initialFormData.companyLogoUrl" @file-selected="handleFileSelected"/>
            </div>

            <VRow style="flex-direction: column;" class="ml-4">
              <!-- <VBtn color="primary" style="max-width: 198px;" class="mb-2">
              Upload Company Logo
              </VBtn> -->
              <VLabel>
                Allowed Only for PNG. Max size of 1Mb
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
            :rules="[requiredValidator]"
          />
        </VCol>

        <VCol cols="12">
          <AppTextField
            v-model="initialFormData.description"
            label="Description"
            placeholder="Enter your company description"
            :rules="[requiredValidator]"
          />
        </VCol>

        <VCol 
        cols="12"
        md="6">
          <AppTextField
            v-model="initialFormData.email"
            label="Email"
            placeholder="Enter your company email"
            :rules="[requiredValidator]"
          />
        </VCol>

        <VCol 
        cols="12"
        md="6">
          <AppTextField
            v-model="initialFormData.phoneNumber"
            label="Phone Number"
            placeholder="Enter your company phone number"
            :rules="[requiredValidator]"
          />
        </VCol>

        <VCol 
        cols="12"
        md="6">
          <AppTextField
            v-model="initialFormData.address"
            label="Address"
            placeholder="Enter your company address"
            :rules="[requiredValidator]"
          />
        </VCol>

        <VCol 
        cols="12"
        md="6">
          <AppTextField
            v-model="initialFormData.city"
            label="City"
            placeholder="Enter your company city"
            :rules="[requiredValidator]"
          />
        </VCol>

        <VCol
              cols="12"
              class="d-flex flex-wrap gap-4"
            >
              <VBtn
                color="primary"
                variant="tonal"
              >
                Preview as Letterhead
              </VBtn>

              <VBtn 
              type="submit"
              @click="updateLetterhead"
              >
                Save Changes
              </VBtn>
            </VCol>
      </VRow>
    </VCardText>
  </VCard>

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
  