<script setup lang="ts">
import { User } from '@/models/users/users';

interface Props {
  user?: User,
  isDialogVisible: boolean
}

interface Emit {
  (e: 'update:isDialogVisible', val: boolean): void
}

const emit = defineEmits<Emit>()
const props = defineProps<Props>()

const dialogModelValueUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val)
}

const userRole = (value?: number) => {
  if (value === 1)
    return { color: 'secondary', text: 'Reguler' }
  else if (value === 99)
    return { color: 'primary', text: 'Admin' }
  else
    return { color: 'info', text: '-' }
}

const accessType = (hasAccess?: boolean) => {
  if (hasAccess)
    return { color: 'success', text: 'Active' }
  else
    return { color: 'error', text: 'Disabled' }
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
          Detail User
        </h4>

        <!-- 👉 Form -->
        <VRow>
        <VCol cols="6">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
            Employee ID
            </VLabel>
            <h6 class="text-h6" style="max-width: 200px;">
            {{ props.user?.id }}
            </h6>
        </VCol>

        <VCol cols="6">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
            Email
            </VLabel>
            <h6 class="text-h6">
            {{ props.user?.email }}
            </h6>
        </VCol>
        </VRow>

        <VRow>
        <VCol cols="6">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
            First Name
            </VLabel>
            <h6 class="text-h6">
            {{ props.user?.firstName }}
            </h6>
        </VCol>

        <VCol cols="6">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
            Last Name
            </VLabel>
            <h6 class="text-h6">
            {{ props.user?.lastName }}
            </h6>
        </VCol>
        </VRow>

        <VRow>
        <VCol cols="6">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
            Position
            </VLabel>
            <h6 class="text-h6">
            {{ props.user?.position.name }}
            </h6>
        </VCol>

        <VCol cols="6">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
            Phone Number
            </VLabel>
            <h6 class="text-h6">
            {{ props.user?.phone }}
            </h6>
        </VCol>
        </VRow>

        <VRow>
        <VCol cols="6">
            <div class="d-flex flex-column align-items-start">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
            User Role
            </VLabel>
            <VChip
            :color="userRole(props.user?.role).color"
            size="small"
            style="max-width: 80px;"
            >
            {{ userRole(props.user?.role).text }}
            </VChip>
            </div>
        </VCol>
        <VCol cols="6">
            <div class="d-flex flex-column align-items-start">
                <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
                Access
                </VLabel>
                <VChip
                :color="accessType(props.user?.access).color"
                size="small"
                style="max-width: 80px;"
                >
                {{ accessType(props.user?.access).text }}
                </VChip>
            </div>
        </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VDialog>
</template>
