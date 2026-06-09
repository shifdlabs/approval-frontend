<script setup lang="ts">
import { VNodeRenderer } from '@layouts/components/VNodeRenderer';
import { themeConfig } from '@themeConfig';
import { VForm } from 'vuetify/components';

import { loginController } from '@/controllers/login-controller';

const {
  isPasswordVisible,
  refVForm,
  isLoginError,
  loginErrorMessage,
  isAccountInactive,
  isInProgress,
  credentials,
  onSubmit,
} = loginController();
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative my-sm-16">

      <!-- 👉 Auth Card -->
      <VCard
        class="auth-card"
        max-width="460"
        :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-0'"
      >
        <VCardItem class="justify-center">
          <VCardTitle>
            <RouterLink to="/">
              <div class="app-logo">
                <VNodeRenderer :nodes="themeConfig.app.logo" />
              </div>
            </RouterLink>
          </VCardTitle>
        </VCardItem>

        <VCardText class="text-center">
          <h4 class="text-h4 mb-1">
            {{ $t('auth.loginTitle') }} <span class="text-capitalize">{{ themeConfig.app.title }}</span>
          </h4>
          <p class="mb-0">
            {{ $t('auth.loginSubtitle') }}
          </p>

          <VAlert v-if="isLoginError" color="error" class="mt-4">
            {{ loginErrorMessage || $t('auth.wrongCredentials') }}
          </VAlert>

          <VAlert v-if="isAccountInactive" color="error" class="mt-4">
            {{ loginErrorMessage || $t('auth.accountDisabled') }}
          </VAlert>
        </VCardText>

        <VCardText>
          <VForm
          ref="refVForm"
          @submit.prevent="onSubmit">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.email"
                  :label="$t('auth.email')"
                  type="email"
                  :placeholder="$t('auth.emailPh')"
                  :rules="[requiredValidator, emailValidator]"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.password"
                  :label="$t('auth.password')"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  :rules="[requiredValidator]"
                />

                <!-- login button -->
                <VBtn
                  block
                  type="submit"
                  :disabled="isInProgress"
                  class="mt-6"
                >
                  {{ $t('auth.loginBtn') }}
                </VBtn>
              </VCol>

            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>

    <!-- Loading Overlay -->
    <VDialog
      v-model="isInProgress"
      persistent
      width="300"
    >
      <VCard color="primary">
        <VCardText class="text-center pa-6">
          <VProgressCircular
            indeterminate
            color="white"
            size="50"
            class="mb-4"
          />
          <div class="text-white text-h6">{{ $t('auth.loggingIn') }}</div>
          <div class="text-white text-body-2 mt-2">{{ $t('common.pleaseWait') }}</div>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
  
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
.app-logo {
  display: inline-flex;
  justify-content: center;
  align-items: center;

  svg,
  img {
    width: 80px;  /* increase as needed */
    height: 80px; /* maintain aspect ratio */
  }
}
</style>
<!-- 
if (data.role == "admin") {
  console.log("!Masuk", data.userAbilityRules)
  
  useAbility().update(data.userAbilityRules)
  useCookie('userAbilityRules').value = data.userAbilityRules
} -->
