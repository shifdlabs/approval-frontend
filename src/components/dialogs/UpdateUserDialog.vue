<script setup lang="ts">
import { User } from '@/models/users/users';
import { ref, watch } from 'vue';
import { VForm } from 'vuetify/components';

interface Props {
  user?: User;
  usersList: User[];
  isDialogVisible: boolean;
}

interface Emit {
  (e: 'update:usersList', value: User[]): void;
  (e: 'update:isDialogVisible', val: boolean): void;
  (e: 'update:isRefetchList', val: boolean): void;
}

const emit = defineEmits<Emit>();
const props = defineProps<Props>();

const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 1,
  access: true,
};

const formData = ref({ ...initialFormData });

// Watch the specific prop isDialogVisible
watch(
  () => props.isDialogVisible,
  (isVisible) => {
    if (isVisible) {
      // Reset formData every time the dialog becomes visible
      formData.value = { ...initialFormData };
      isAllInputtedValid.value = true;

      formData.value = {
        firstName: props.user?.firstName ?? '',
        lastName: props.user?.lastName ?? '',
        email: props.user?.email ?? '',
        phone: props.user?.phone ?? '',
        role: props.user?.role ?? 1,
        access: props.user?.access ?? false,
        confirmPassword: '',
        password: '',
      };
    }
  }
);

const refVForm = ref<VForm>();
const isErrorUniqueEmail = ref(false);
const isAllInputtedValid = ref(true);

const updateUser = async () => {
  try {
    const firstName = formData.value.firstName;
    const lastName = formData.value.lastName;
    const email = formData.value.email;
    const phone = formData.value.phone;
    const role = formData.value.role;
    const access = formData.value.access;

    const { data, error } = await useApi('/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: props.user?.id,
        firstName,
        lastName,
        email,
        phone,
        role,
        access,
      }),
    }).json();

    if (error.value) {
      console.log(error.value);
    }

    emit('update:isRefetchList', true);
    emit('update:isDialogVisible', false);
  } catch (e) {
    console.log(e);
    emit('update:isDialogVisible', false);
  }
};

const onFormSubmit = async () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      isErrorUniqueEmail.value = false;
      isAllInputtedValid.value = true;
      updateUser();
    } else {
      isAllInputtedValid.value = false;
    }
  });
};

const onFormReset = () => {
  emit('update:isDialogVisible', false);
};

const dialogModelValueUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val);
};
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
          Update User {{ formData.email }}
        </h4>

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
            <VCol cols="12">
              <AppTextField
                v-model="formData.firstName"
                label="First Name"
                placeholder="Enter your first name"
                :rules="[requiredValidator]"
              />
            </VCol>

            <!-- 👉 Last Name -->
            <VCol cols="12">
              <AppTextField
                v-model="formData.lastName"
                label="Last Name"
                placeholder="Enter your last name"
                :rules="[requiredValidator]"
              />
            </VCol>

            <!-- 👉 Email -->
            <VCol cols="12">
              <AppTextField
                v-model="formData.email"
                label="Email"
                type="email"
                placeholder="Enter your email address"
                :rules="[requiredValidator, emailValidator]"
              />
            </VCol>

            <!-- 👉 Phone number -->
            <VCol cols="12">
              <AppTextField
                v-model="formData.phone"
                label="Phone Number"
                type="number"
                placeholder="Enter your phone number"
                :rules="[requiredValidator]"
              />
            </VCol>

            <!-- 👉 Role -->
            <VCol cols="12">
              <div
                class="app-text-field flex-grow-1"
              >
                <VLabel
                  class="mb-1 text-body-2 text-wrap"
                  style="line-height: 15px;"
                  text="Role"
                />
                <VRadioGroup
                  v-model="formData.role"
                  inline
                >
                  <VRadio
                    label="Reguler"
                    :value=1
                  />
                  <VRadio
                    label="Admin"
                    :value=99
                  />
                </VRadioGroup>
              </div>
            </VCol>

            <!-- 👉 Access to system -->
            <VCol cols="12">
              <div
                class="app-text-field flex-grow-1"
              >
                <VLabel
                  class="mb-1 text-body-2 text-wrap"
                  style="line-height: 15px;"
                  text="Access to system"
                />
                <VRadioGroup
                  v-model="formData.access"
                  inline
                >
                  <VRadio
                    label="Active"
                    :value=true
                  />
                  <VRadio
                    label="Disabled"
                    :value=false
                  />
                </VRadioGroup>
              </div>
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
                Update
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
