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

watch(
  () => props.isDialogVisible,
  (isVisible) => {
    if (isVisible) {
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
    :width="$vuetify.display.smAndDown ? 'auto' : 560"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <VCard class="bm-dialog">
      <div class="bmd-head">
        <div class="bmd-mark">
          <VIcon icon="tabler-mail" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>{{ t('changeEmail.title') }}</h2>
          <p>{{ t('changeEmail.subtitle') }}</p>
        </div>
        <button class="bmd-close" type="button" @click="dialogModelValueUpdate(false)">
          <VIcon icon="tabler-x" size="18" />
        </button>
      </div>

      <VForm ref="refVForm" @submit.prevent="onFormSubmit">
        <div class="bmd-body">
          <VAlert v-if="isErrorUniqueEmail" color="error" class="mb-2">
            {{ t('common.emailAlreadyRegistered') }}
          </VAlert>
          <VAlert v-if="!isAllInputtedValid" color="error" class="mb-2">
            {{ t('common.errorFormInput') }}
          </VAlert>

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
          </VRow>
        </div>

        <div class="bmd-foot">
          <button class="bmd-btn bmd-btn-ghost" type="button" @click="onFormReset">
            {{ t('changeEmail.cancel') }}
          </button>
          <button class="bmd-btn bmd-btn-primary" type="submit">
            {{ t('changeEmail.change') }}
          </button>
        </div>
      </VForm>
    </VCard>
  </VDialog>
</template>
