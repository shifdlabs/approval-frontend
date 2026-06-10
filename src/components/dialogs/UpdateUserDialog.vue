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

watch(
  () => props.isDialogVisible,
  (isVisible) => {
    if (isVisible) {
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

    const { error } = await useApi('/user', {
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
      isAllInputtedValid.value = false;
      return;
    }

    emit('update:isRefetchList', true);
    emit('update:isDialogVisible', false);
  } catch (e) {
    console.log(e);
    isAllInputtedValid.value = false;
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

const { t } = useI18n()
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 620"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <VCard class="bm-dialog">
      <div class="bmd-head">
        <div class="bmd-mark">
          <VIcon icon="tabler-user-edit" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>{{ t('users.update.title').replace('{email}', formData.email) }}</h2>
          <p>{{ t('users.update.subtitle') }}</p>
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
                v-model="formData.email"
                :label="t('common.email')"
                type="email"
                :placeholder="t('common.emailPh')"
                :rules="[requiredValidator, emailValidator]"
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
              <div class="app-text-field flex-grow-1">
                <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;" :text="t('common.role')" />
                <VRadioGroup v-model="formData.role" inline>
                  <VRadio label="Reguler" :value="1" />
                  <VRadio label="Admin" :value="99" />
                </VRadioGroup>
              </div>
            </VCol>
            <VCol cols="12" md="6">
              <div class="app-text-field flex-grow-1">
                <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;" :text="t('common.access')" />
                <VRadioGroup v-model="formData.access" inline>
                  <VRadio :label="t('common.active')" :value="true" />
                  <VRadio :label="t('common.disabled')" :value="false" />
                </VRadioGroup>
              </div>
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
