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

const { t } = useI18n()

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
    return { color: 'success', text: t('common.active') }
  else
    return { color: 'error', text: t('common.disabled') }
}
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
          <VIcon icon="tabler-user-search" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>{{ t('detailUser.title') }}</h2>
          <p>{{ props.user?.email }}</p>
        </div>
        <button class="bmd-close" type="button" @click="dialogModelValueUpdate(false)">
          <VIcon icon="tabler-x" size="18" />
        </button>
      </div>

      <div class="bmd-body">
        <VRow>
          <VCol cols="6">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
              {{ t('detailUser.employeeId') }}
            </VLabel>
            <h6 class="text-h6" style="max-width: 200px;">
              {{ props.user?.id }}
            </h6>
          </VCol>
          <VCol cols="6">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
              {{ t('detailUser.email') }}
            </VLabel>
            <h6 class="text-h6">{{ props.user?.email }}</h6>
          </VCol>
        </VRow>

        <VRow>
          <VCol cols="6">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
              {{ t('detailUser.firstName') }}
            </VLabel>
            <h6 class="text-h6">{{ props.user?.firstName }}</h6>
          </VCol>
          <VCol cols="6">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
              {{ t('detailUser.lastName') }}
            </VLabel>
            <h6 class="text-h6">{{ props.user?.lastName }}</h6>
          </VCol>
        </VRow>

        <VRow>
          <VCol cols="6">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
              {{ t('detailUser.position') }}
            </VLabel>
            <h6 class="text-h6">{{ props.user?.position.name }}</h6>
          </VCol>
          <VCol cols="6">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
              {{ t('common.phone') }}
            </VLabel>
            <h6 class="text-h6">{{ props.user?.phone }}</h6>
          </VCol>
        </VRow>

        <VRow>
          <VCol cols="6">
            <div class="d-flex flex-column align-items-start">
              <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
                {{ t('common.role') }}
              </VLabel>
              <VChip :color="userRole(props.user?.role).color" size="small" style="max-width: 80px;">
                {{ userRole(props.user?.role).text }}
              </VChip>
            </div>
          </VCol>
          <VCol cols="6">
            <div class="d-flex flex-column align-items-start">
              <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
                {{ t('common.access') }}
              </VLabel>
              <VChip :color="accessType(props.user?.access).color" size="small" style="max-width: 80px;">
                {{ accessType(props.user?.access).text }}
              </VChip>
            </div>
          </VCol>
        </VRow>
      </div>

      <div class="bmd-foot">
        <button class="bmd-btn bmd-btn-primary" type="button" @click="dialogModelValueUpdate(false)">
          {{ t('common.close') }}
        </button>
      </div>
    </VCard>
  </VDialog>
</template>
