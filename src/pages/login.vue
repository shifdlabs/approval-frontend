<script setup lang="ts">
import { VNodeRenderer } from '@layouts/components/VNodeRenderer';
import { themeConfig } from '@themeConfig';
import { VForm } from 'vuetify/components';

import { loginController } from '@/controllers/login-controller';

const {
  isPasswordVisible,
  refVForm,
  isLoginError,
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
            Welcome to <span class="text-capitalize">Shifd {{ themeConfig.app.title }}</span>
          </h4>
          <p class="mb-0">
            Please sign-in to your account
          </p>

          <VAlert v-if="isLoginError" color="error" class="mt-4">
            The email or password you entered is incorrect.
          </VAlert>

          <VAlert v-if="isAccountInactive" color="error" class="mt-4">
            The account has deleted, contact to your admin.
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
                  label="Email"
                  type="email"
                  placeholder="johndoe@email.com"
                  :rules="[requiredValidator, emailValidator]"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.password"
                  label="Password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  :rules="[requiredValidator]"
                />

                <!-- remember me checkbox -->
                <div class="d-flex align-center justify-space-between flex-wrap my-6">
                  <VCheckbox
                    v-model="credentials.remember"
                    label="Remember me"
                  />

                  <RouterLink
                    class="text-primary" :to="{ }"
                  >
                    Forgot Password?
                  </RouterLink>
                </div>

                <!-- login button -->
                <VBtn
                  block
                  type="submit"
                  :disabled="isInProgress"
                >
                  Login
                </VBtn>
              </VCol>

              <!-- create account -->
              <VCol
                cols="12"
                class="text-body-1 text-center"
              >
                <span class="d-inline-block">
                  Didn't have an account?
                </span>
                <!-- <RouterLink
                  class="text-primary ms-1 d-inline-block text-body-1"
                  :to="{ name:'register' }"
                >
                  Register
                </RouterLink> -->
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
          <div class="text-white text-h6">Logging in...</div>
          <div class="text-white text-body-2 mt-2">Please wait</div>
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
