<script setup lang="ts">
import { ChangePassword } from '@/models/users/change.password';
import { ref, watch } from 'vue';
import { VForm } from 'vuetify/components';

interface Props {
    changePassword?: ChangePassword
    isDialogVisible: boolean
}

interface Emit {
  (e: 'update:changePassword', value: ChangePassword): void
  (e: 'update:isDialogVisible', val: boolean): void
}

const emit = defineEmits<Emit>()
const props = defineProps<Props>()

const initialFormData = {
  password: '',
  confirmPassword: '',
};

const formData = ref({ ...initialFormData });

// Watch the specific prop isDialogVisible
watch(
  () => props.isDialogVisible,
  (isVisible) => {
    if (isVisible) {
      // Reset formData every time the dialog becomes visible
      formData.value = { ...initialFormData }
      isAllInputtedValid.value = true
      console.log('Dialog opened, resetting formData')
    }
  }
)

const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const refVForm = ref<VForm>()
const isErrorUniqueEmail = ref(false)
const isAllInputtedValid = ref(true)

const changeUserPassword = async () => {
  try {
    const { data } = await useApi('/user/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: props.changePassword?.id,
        newPassword: formData.value.password,
      }),
    }).json<{ success: boolean }>()

    if (data.value?.success) {
      isAllInputtedValid.value = true
      emit('update:isDialogVisible', false)
    } else {
      isAllInputtedValid.value = false
      console.warn('Password update failed or success field missing.')
    }
  } catch (e) {
    console.log(e)
    emit('update:isDialogVisible', true)
    isAllInputtedValid.value = false
  }
}

const onFormSubmit = async () => {
  refVForm.value?.validate()
    .then(({ valid: isValid }) => {
      if (isValid) {
        isErrorUniqueEmail.value = false
        isAllInputtedValid.value = true
        changeUserPassword()
      } else {
        isAllInputtedValid.value = false
      }
    })
}

const onFormReset = () => {
  console.log(props.changePassword?.id)
  emit('update:isDialogVisible', false)
}

const dialogModelValueUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val)
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 700"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-2">
      <VCardText>
        <!-- 👉 Title -->
        <h4 class="text-h4 text-center mb-2">
          Change Password For {{ props.changePassword?.email }}
        </h4>

        <VAlert v-if="!isAllInputtedValid" color="error" class="mt-6 mb-6">
          Please follow the rules of the input form.
        </VAlert>

        <!-- 👉 Form -->
        <VForm
          class="mt-0"
          ref="refVForm"
          @submit.prevent="onFormSubmit"
        >
            <!-- 👉 Password -->
            <VCol cols="12">
              <AppTextField
                v-model="formData.password"
                label="New Password"
                autocomplete="password"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                :rules="[requiredValidator, passwordValidator]"
                
              />
            </VCol>

            <!-- 👉 Password -->
            <VCol cols="12">
              <AppTextField
                v-model="formData.confirmPassword"
                label="Confirm Password"
                placeholder="············"
                :type="isConfirmPasswordVisible ? 'text' : 'password'"
                autocomplete="password"
                :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                :rules="[requiredValidator, confirmedValidator(formData.confirmPassword, formData.password)]"
                @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
              />
            </VCol>

            <!-- 👉 Register and Cancel -->
            <VCol
              cols="12"
              class="d-flex flex-wrap gap-4"
            >
              <VBtn
                color="secondary"
                variant="tonal"
                @click="onFormReset"
              >
                Cancel
              </VBtn>

              <VBtn 
              type="submit"
              >
                Change Password
              </VBtn>
            </VCol>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
