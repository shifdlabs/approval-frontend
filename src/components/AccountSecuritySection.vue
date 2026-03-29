<script lang="ts" setup>
import { User } from '@/models/users/users';
import { VForm } from 'vuetify/components';

const isCurrentPasswordVisible = ref(false)
const isNewPasswordVisible = ref(false)
const isConfirmNewPasswordVisible = ref(false)
const isAllInputtedValid = ref(true)
const user = ref<User>()

onMounted(() => {
  fetchProfile()
})

const initialFormData = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};

const formData = ref({ ...initialFormData });
const refVForm = ref<VForm>()
const isChangePasswordDialogVisible = ref(false)
const isSuccessDialogVisible = ref(false)

const fetchProfile = async () => {
  try {
    const res = await useApi('/user/profile', {
      method: 'GET'
    })

    console.log(res.data.value)
    const value = res.data.value as { data: any };
    user.value = mapUser(value.data)
    console.log(user)
  } catch (e) {
    console.log(e)
  }
}

const mapUser = (rawUser: any): User => {
  return {
    ...rawUser,
  };
};

const updatePassword = async () => {
  try {
    const {
      execute,
      error,
      data,
      onFetchError,
    } = useApi('/user/password',
      {
        method: 'PUT',
        body: JSON.stringify({
          id: user.value?.id,
          currentPassword: formData.value.currentPassword,
          newPassword: formData.value.newPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        immediate: false,
      }
    )

    // Optional: hook into error
    onFetchError((fetchError) => {
      console.error('Fetch error:', fetchError)
      alert('Failed to update password. Please check your current password and try again.')
    })

    // IMPORTANT: Execute the API call
    await execute()

    // Check if there was an error
    if (error.value) {
      console.error('Error updating password:', error.value)
      alert('Failed to update password. Please check your current password.')
      return
    }

    // Check if update was successful
    const response = data.value as any
    if (response && response.success) {
      isChangePasswordDialogVisible.value = false
      isSuccessDialogVisible.value = true
      refVForm.value?.reset()
    } else {
      alert('Failed to update password. Please try again.')
    }
  } catch (e) {
    console.error('Exception updating password:', e)
    alert('An error occurred while updating password.')
  }
}

const onFormSubmit = async () => {
  refVForm.value?.validate()
    .then(({ valid: isValid }) => {
      if (isValid) {
        isAllInputtedValid.value = true
        isChangePasswordDialogVisible.value = true
      } else {
        isAllInputtedValid.value = false
      }
    })
}

</script>

<template>
  <VCardText class="pa-8">
    <VLabel style="font-size: 18px; color: black;">
      Change Password
    </VLabel>

    <VAlert v-if="!isAllInputtedValid" color="error" class="mt-6 mb-6">
        Please follow the rules of the input form.
    </VAlert>

    <VForm
    ref="refVForm"
    @submit.prevent="onFormSubmit"
    >
      <VRow>
      <VCol cols="12" md="6" class="pt-6">
        <AppTextField
          v-model="formData.currentPassword"
          label="Current Password"
          autocomplete="password"
          placeholder="············"
          :type="isCurrentPasswordVisible ? 'text' : 'password'"
          :append-inner-icon="isCurrentPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
          @click:append-inner="isCurrentPasswordVisible = !isCurrentPasswordVisible"
          :rules="[requiredValidator]"
        />

        <AppTextField
          v-model="formData.newPassword"
          label="New Password"
          autocomplete="password"
          placeholder="············"
          :type="isNewPasswordVisible ? 'text' : 'password'"
          :append-inner-icon="isNewPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
          @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible"
          :rules="[requiredValidator, passwordValidator]"
        />

        <AppTextField
          v-model="formData.confirmNewPassword"
          label="Confirm Password"
          placeholder="············"
          :type="isConfirmNewPasswordVisible ? 'text' : 'password'"
          autocomplete="password"
          :append-inner-icon="isConfirmNewPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
          :rules="[requiredValidator, confirmedValidator(formData.confirmNewPassword, formData.newPassword)]"
          @click:append-inner="isConfirmNewPasswordVisible = !isConfirmNewPasswordVisible"
        />
      </VCol>

      <VCol cols="12" md="6" class="pl-5 pt-6">
        <VRow style="flex-direction: column;">
          <p style="font-size: 15px; font-weight: 900;">Password Requirements:</p>
          <p style="font-size: 15px;">* Minimum 8 characters long - the more, the better.</p>
          <p style="font-size: 15px;">* At least one lowercase character.</p>
          <p style="font-size: 15px;">* At least one number, symbol, or whitespace character.</p>
        </VRow>
      </VCol>

      <VCol
        cols="12"
        class="d-flex flex-wrap gap-4"
      >
        <VSpacer/>
        <VBtn 
          type="submit"
        >
          Change Password
        </VBtn>
      </VCol>
    </VRow>
    </VForm>
  </VCardText>

  <VDialog
    v-model="isChangePasswordDialogVisible"
    persistent
    class="v-dialog-sm"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isChangePasswordDialogVisible = !isChangePasswordDialogVisible" />
          <!-- Dialog Content -->
    <VCard title="Confirm Account Deletion">
      <VCardText>
        Are you sure you want to change your account password?
      </VCardText>

      <VCardText class="d-flex justify-end gap-3 flex-wrap">
        <VBtn
          color="secondary"
          variant="tonal"
          @click="isChangePasswordDialogVisible = false"
        >
          Cancel
        </VBtn>

        <VBtn
        @click="updatePassword">
          Yes, Change Password
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VDialog
    v-model="isSuccessDialogVisible"
    persistent
    class="v-dialog-sm"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isSuccessDialogVisible = !isSuccessDialogVisible" />
          <!-- Dialog Content -->
    <VCard title="Success">
      <VCardText>
        Your password has been successfully changed.
      </VCardText>

      <VCardText class="d-flex justify-end gap-3 flex-wrap">
        <VBtn
        color="success"
        @click="isSuccessDialogVisible = false">
          Ok
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
  