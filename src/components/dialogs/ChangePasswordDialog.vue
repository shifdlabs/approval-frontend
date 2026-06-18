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

watch(
  () => props.isDialogVisible,
  (isVisible) => {
    if (isVisible) {
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
    console.error(e)
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

const { t } = useI18n()
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 560"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <VCard class="bm-dialog">
      <div class="bmd-head">
        <div class="bmd-mark">
          <VIcon icon="tabler-lock" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>{{ t('changePassword.title').replace('{email}', props.changePassword?.email ?? '') }}</h2>
          <p>{{ t('changePassword.subtitle') }}</p>
        </div>
        <button class="bmd-close" type="button" @click="dialogModelValueUpdate(false)">
          <VIcon icon="tabler-x" size="18" />
        </button>
      </div>

      <VForm ref="refVForm" @submit.prevent="onFormSubmit">
        <div class="bmd-body">
          <VAlert v-if="!isAllInputtedValid" color="error" class="mb-2">
            {{ t('common.errorFormInput') }}
          </VAlert>

          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.password"
                :label="t('changePassword.newPassword')"
                autocomplete="password"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                :rules="[requiredValidator, passwordValidator]"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="formData.confirmPassword"
                :label="t('changePassword.confirmPassword')"
                placeholder="············"
                :type="isConfirmPasswordVisible ? 'text' : 'password'"
                autocomplete="password"
                :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                :rules="[requiredValidator, confirmedValidator(formData.confirmPassword, formData.password)]"
                @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
              />
            </VCol>
          </VRow>
        </div>

        <div class="bmd-foot">
          <button class="bmd-btn bmd-btn-ghost" type="button" @click="onFormReset">
            {{ t('changePassword.cancel') }}
          </button>
          <button class="bmd-btn bmd-btn-primary" type="submit">
            {{ t('changePassword.change') }}
          </button>
        </div>
      </VForm>
    </VCard>
  </VDialog>
</template>
