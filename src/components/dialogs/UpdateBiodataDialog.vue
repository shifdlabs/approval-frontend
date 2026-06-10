<script setup lang="ts">
import { Position } from '@/models/positions/position'
import { User } from '@/models/users/users'
import { ref, watch } from 'vue'
import { VForm } from 'vuetify/components'

interface Props {
  user?: User,
  position: Position[]
  isDialogVisible: boolean
}

interface Emit {
  (e: 'update:usersList', value: User[]): void
  (e: 'update:isDialogVisible', val: boolean): void
  (e: 'update:isRefetch', val: boolean): void
}

const emit = defineEmits<Emit>()
const props = defineProps<Props>()

const initialFormData = {
  firstName: '',
  lastName: '',
  phone: '',
  positionId: '',
};

const formData = ref({ ...initialFormData })

watch(
  () => props.isDialogVisible,
  (isVisible) => {
    if (isVisible) {
      formData.value = { ...initialFormData }
      isAllInputtedValid.value = true

      formData.value = {
        firstName: props.user?.firstName ?? "",
        lastName: props.user?.lastName ?? "",
        phone: props.user?.phone ?? "",
        positionId: props.user?.position?.id ?? "",
      }
    }
  }
)

const refVForm = ref<VForm>()
const isErrorUniqueEmail = ref(false)
const isAllInputtedValid = ref(true)

const updateUser = async () => {
  try {
    const firstName = formData.value.firstName
    const lastName = formData.value.lastName
    const positionId = formData.value.positionId
    const phone = formData.value.phone

    const { data } = await useApi('/user/biodata', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        lastName,
        positionID: positionId,
        phone,
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
          <VIcon icon="tabler-user-edit" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>{{ t('settings.updatePersonal') }}</h2>
          <p>{{ t('settings.updatePersonalSub') }}</p>
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
                v-model="formData.firstName"
                :label="t('common.firstName')"
                :placeholder="t('common.firstNamePh')"
                :rules="[requiredValidator, maxLengthValidator(100)]"
              />
            </VCol>
            <VCol cols="12" md="6">
              <AppTextField
                v-model="formData.lastName"
                :label="t('common.lastName')"
                :placeholder="t('common.lastNamePh')"
                :rules="[requiredValidator, maxLengthValidator(100)]"
              />
            </VCol>
            <VCol cols="12" md="6">
              <AppTextField
                v-model="formData.phone"
                :label="t('common.phone')"
                type="tel"
                :placeholder="t('common.phonePh')"
                :rules="[requiredValidator, phoneValidator]"
              />
            </VCol>
            <VCol cols="12" md="6">
              <AppSelect
                v-model="formData.positionId"
                :label="t('common.jobPosition')"
                :placeholder="t('common.jobPositionPh')"
                :items="props.position"
                item-title="name"
                item-value="id"
                clearable
              />
            </VCol>
          </VRow>
        </div>

        <div class="bmd-foot">
          <button class="bmd-btn bmd-btn-ghost" type="button" @click="onFormReset">
            {{ t('common.cancel') }}
          </button>
          <button class="bmd-btn bmd-btn-primary" type="submit">
            {{ t('common.update') }}
          </button>
        </div>
      </VForm>
    </VCard>
  </VDialog>
</template>
