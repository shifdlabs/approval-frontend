<script setup lang="ts">
import { ref, watch } from 'vue'
import { VForm } from 'vuetify/components'

interface Props {
  isDialogVisible: boolean
}

interface Emit {
  (e: 'update:isDialogVisible', val: boolean): void
  (e: 'update:isRefetch', val: boolean): void
}

const emit = defineEmits<Emit>()
const props = defineProps<Props>()

const initialFormData = {
  email: '',
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
    }
  }
)

const refVForm = ref<VForm>()
const isErrorUniqueEmail = ref(false)
const isAllInputtedValid = ref(true)

const updateUser = async () => {
  try {
    const email = formData.value.email

    const { data } = await useApi('/user/email', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newEmail: email,
      }),
    }).json<{ success: boolean }>()

    if (data.value?.success) {
      emit('update:isRefetch', true)
      emit('update:isDialogVisible', false)
    } else {
      isAllInputtedValid.value = false
    }
  } catch (e) {
    console.log(e)
    isAllInputtedValid.value = false
  }
}

const onFormSubmit = async () => {
  refVForm.value?.validate()
    .then(({ valid: isValid }) => {
      if (isValid) {
        isErrorUniqueEmail.value = false
        isAllInputtedValid.value = true
        updateUser()
      } else {
        isAllInputtedValid.value = false
      }
    })
}

const onFormReset = () => {
  emit('update:isDialogVisible', false)
}

const dialogModelValueUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val)
}

const { t } = useI18n()
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
          {{ t('changeEmail.title') }}
        </h4>

        <VAlert v-if="isErrorUniqueEmail" color="error" class="mt-4">
          {{ t('common.emailAlreadyRegistered') }}
        </VAlert>

        <VAlert v-if="!isAllInputtedValid" color="error" class="mt-6 mb-6">
          {{ t('common.errorFormInput') }}
        </VAlert>

        <!-- 👉 Form -->
        <VForm
          class="mt-7"
          ref="refVForm"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <VCol cols="12" md="6">
              <AppTextField
                v-model="formData.email"
                :label="t('changeEmail.newEmail')"
                type="email"
                :placeholder="t('changeEmail.newEmailPh')"
                :rules="[requiredValidator, emailValidator]"
              />
            </VCol>

            <VCol cols="12" md="6" class="pl-5">
              <VRow>
                <p style="font-size: 15px; font-weight: 500;">{{ t('changeEmail.requirement') }}</p>
                <p>{{ t('changeEmail.rule1') }}</p>
                <p>{{ t('changeEmail.rule2') }}</p>
              </VRow>
            </VCol>

            <!-- 👉 Cancel and Change -->
            <VCol
              cols="12"
              class="d-flex flex-wrap gap-4"
            >
              <VSpacer/>
              <VBtn
                color="primary"
                variant="outlined"
                @click="onFormReset"
              >
                {{ t('changeEmail.cancel') }}
              </VBtn>

              <VBtn
              type="submit"
              >
                {{ t('changeEmail.change') }}
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
