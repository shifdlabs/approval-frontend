<script lang="ts" setup>
import { User } from '@/models/users/users';

interface Props {
  user?: User,
  isUpdateProfileDialogVisible: boolean
  isChangeEmailDialogVisible: boolean
  isDeleteAccountDialogVisible: boolean
}

interface Emit {
  (e: 'update:isUpdateProfileDialogVisible', val: boolean): void
  (e: 'update:isChangeEmailDialogVisible', val: boolean): void
  (e: 'update:isDeleteAccountDialogVisible', val: boolean): void
}

const emit = defineEmits<Emit>()
const props = defineProps<Props>()

const avatarStyle = computed(() => {
  return { 
    backgroundColor: "#C7C2F9", 
    border: "1px solid emptyImageBox", 
    borderRadius: "50%",
    width: "100px",
    height: "100px",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };
});

const showUpdateProfileDialog = () => {
  emit('update:isUpdateProfileDialogVisible', true)
}

const showChangeEmailDialog = () => {
  emit('update:isChangeEmailDialogVisible', true)
}

const showDeleteAccountDialog = () => {
  emit('update:isDeleteAccountDialogVisible', true)
}

const userConfirmed = ref(false)

function getInitials(): string {
    let initials = "";
    
    if (props.user?.firstName) initials += props.user?.firstName.charAt(0).toUpperCase();
    if (props.user?.lastName) initials += props.user?.lastName.charAt(0).toUpperCase();
    
    return initials;
}

</script>

<template>
  <VCardText>
    <VRow>
        <VCol cols="12">
          <div class="d-flex align-center flex-wrap">
              <div :style="avatarStyle">
                <VLabel style="font-size: 40px; font-weight: bold; color: black; height: 100px;">{{ getInitials() }}</VLabel>
              </div>

            <VRow style="flex-direction: column;" class="ml-5">
              <VLabel style="font-size: 25px; color: black; font-weight: 500; margin-bottom: 6px;">
                {{ props.user?.firstName }} {{ props.user?.lastName }}
              </VLabel>
              <VLabel style="font-size: 20px; font-weight: lighter;color: #6D6B77;">
                {{ props.user?.position.name }}
              </VLabel>
            </VRow>
          </div>
        <VSpacer></VSpacer>
        </VCol>

        <VDivider style="margin-top: 20px; margin-bottom: 20px;"/>

        <VCol class="d-flex flex-wrap gap-5">
          <VLabel style="font-size: 20px; color: black;">
              Personal Information
            </VLabel>
            <VSpacer></VSpacer>
            <VBtn color="primary" @click="showUpdateProfileDialog">
              Edit
            </VBtn>
        </VCol>

        <VCol cols="12" class="d-flex flex-wrap gap-5">
        <div class="info-box">
          <div class="label">First Name</div>
          <div class="value">{{ props.user?.firstName }}</div>
        </div>

        <div class="info-box">
          <div class="label">Last Name</div>
          <div class="value">{{ props.user?.lastName }}</div>
        </div>
      </VCol>

      <VCol cols="12" class="d-flex flex-wrap gap-5">
        <div class="info-box">
          <div class="label">Phone Number</div>
          <div class="value">{{ props.user?.phone }}</div>
        </div>

        <div class="info-box">
          <div class="label">Job Position</div>
          <div class="value">{{ props.user?.position.name }}</div>
        </div>
      </VCol>

      <VDivider style="margin-top: 20px; margin-bottom: 20px;"/>

      <VCol class="d-flex flex-wrap gap-5">
        <VLabel style="font-size: 20px; color: black;">
          Registered Email
        </VLabel>
      </VCol>

      <VCol cols="12">
        <div class="label">Email</div>
        <div class="value">{{ props.user?.email }}</div>
      </VCol>

      <VCol cols="12">
        <VBtn color="primary" @click="showChangeEmailDialog">
          Change Email
        </VBtn>
      </VCol>

      <VDivider style="margin-top: 20px; margin-bottom: 20px;"/>

      <VCol cols="12">
        <VLabel style="font-size: 20px; color: #444050;">
        Delete Account
      </VLabel>
      </VCol>

      <VCol cols="12">
        <VLabel style="font-size: 15px; color: #6D6B77;">
          By deactivating your account, your profile and information will be temporarily hidden, and you can reactivate it anytime in the future.
        </VLabel>
      </VCol>

      <VCol cols="12">
        <VCheckbox
         v-model="userConfirmed"
         label="I confirm that I want to deactivate my account"
         />
      </VCol>

      <VCol cols="12">
        <VBtn color="error" :disabled="!userConfirmed" @click="showDeleteAccountDialog">
          Deactivate Account
        </VBtn>
      </VCol>
    </VRow>
  </VCardText>
</template>
  
<style scoped>
.info-box {
  min-width: 200px; /* Adjust for consistent width */
  flex: 1; /* Makes items flexible */
}

.label {
  font-size: 14px;
  color: #6D6B77;
  margin-bottom: 4px;
}

.value {
  font-size: 20px;
  color: #444050;
}
</style>
