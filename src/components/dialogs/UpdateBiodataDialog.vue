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

// Watch the specific prop isDialogVisible
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
    :width="$vuetify.display.smAndDown ? 'auto' : 700"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-sm-10 pa-2">
      <VCardText>
        <!-- 👉 Title -->
        <h4 class="text-h4 text-center mb-2">
          {{ t('settings.updatePersonal') }}
        </h4>

        <p class="text-center mb-6">
          {{ t('settings.updatePersonalSub') }}
        </p>

        <VAlert v-if="isErrorUniqueEmail" color="error" class="mt-4">
          {{ t('common.emailAlreadyRegistered') }}
        </VAlert>

        <VAlert v-if="!isAllInputtedValid" color="error" class="mt-6 mb-6">
          {{ t('common.errorFormInput') }}
        </VAlert>

        <!-- 👉 Form -->
        <VForm
          class="mt-0"
          ref="refVForm"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- 👉 First Name -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="formData.firstName"
                :label="t('common.firstName')"
                :placeholder="t('common.firstNamePh')"
                :rules="[requiredValidator, maxLengthValidator(100)]"
              />
            </VCol>

            <!-- 👉 Last Name -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="formData.lastName"
                :label="t('common.lastName')"
                :placeholder="t('common.lastNamePh')"
                :rules="[requiredValidator, maxLengthValidator(100)]"
              />
            </VCol>

            <!-- 👉 Phone number -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="formData.phone"
                :label="t('common.phone')"
                type="tel"
                :placeholder="t('common.phonePh')"
                :rules="[requiredValidator, phoneValidator]"
              />
            </VCol>

            <!-- 👉 Position -->
            <VCol
              cols="12"
              md="6"
            >
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

            <!-- 👉 Cancel and Update -->
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
                {{ t('common.cancel') }}
              </VBtn>

              <VBtn
              type="submit"
              >
                {{ t('common.update') }}
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
