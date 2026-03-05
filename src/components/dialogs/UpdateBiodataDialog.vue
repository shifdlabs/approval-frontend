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

const formData = ref({ ...initialFormData });
const selectedPosition = ref<Position>()

// Watch the specific prop isDialogVisible
watch(
  () => props.isDialogVisible,
  (isVisible) => {
    if (isVisible) {
      // Reset formData every time the dialog becomes visible
      formData.value = { ...initialFormData }
      isAllInputtedValid.value = true

      const defaultPosition = props.position.find(pos => pos.id == props.user?.position.id);
      selectedPosition.value = defaultPosition

      formData.value = {
        firstName: props.user?.firstName ?? "",
        lastName: props.user?.lastName ?? "",
        phone: props.user?.phone ?? "",
        positionId: "",
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
      console.warn('User update failed or no success flag in response.')
      emit('update:isDialogVisible', false)
    }
  } catch (e) {
    console.log(e)
    emit('update:isDialogVisible', false)
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
            Edit Personal Information
        </h4>
        
        <p class="text-center mb-6">
            Updating personal information will be applied to all related data.
        </p>

        <VAlert v-if="isErrorUniqueEmail" color="error" class="mt-4">
          Inputted email already registered.
        </VAlert>

        <VAlert v-if="!isAllInputtedValid" color="error" class="mt-6 mb-6">
          Please follow the rules of the input form.
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
                label="First Name"
                placeholder="Enter your first name"
                :rules="[requiredValidator]"
              />
            </VCol>

            <!-- 👉 Last Name -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="formData.lastName"
                label="Last Name"
                placeholder="Enter your last name"
                :rules="[requiredValidator]"
              />
            </VCol>

            <!-- 👉 Phone number -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="formData.phone"
                label="Phone Number"
                type="number"
                placeholder="Enter your phone number"
                :rules="[requiredValidator]"
              />
            </VCol>

            <!-- 👉 Position -->
            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="selectedPosition"
                label="Job Position"
                placeholder="Please enter a job position"
                :items="props.position"
                item-title="name"
                item-value="id"
              />
            </VCol>
            
            <!-- 👉 Register and Cancel -->
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
                Cancel
              </VBtn>

              <VBtn 
              type="submit"
              >
                Update
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
