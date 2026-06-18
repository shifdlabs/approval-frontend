<script setup lang="ts">
import { delegationController } from '@/controllers/reguler/delegation-controller'

const {
  delegationList,
  selectedDelegation,
  isCreateDialogVisible,
  isUpdateDialogVisible,
  isDeleteDialogVisible,
  isLoading,
  isSubmitting,
  errorMessage,
  newDelegation,
  editDelegation,
  headers,
  openCreateDialog,
  openEditDialog,
  openDeleteDialog,
  submitCreate,
  submitUpdate,
  confirmDelete,
  formatDate,
  userItems,
} = delegationController()

const { t } = useI18n()

const refCreateForm = ref()
const refEditForm = ref()

const addOneDayTo = (dateStr: string): string => {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + 1)
  return d.toISOString().substring(0, 10)
}

const minEndDateCreate = computed(() =>
  newDelegation.value.start_date ? addOneDayTo(newDelegation.value.start_date) : ''
)

const minEndDateEdit = computed(() =>
  editDelegation.value.start_date ? addOneDayTo(editDelegation.value.start_date) : ''
)

// Reset end_date when start_date changes and end_date is no longer valid
watch(() => newDelegation.value.start_date, (newStart) => {
  if (newStart && newDelegation.value.end_date && newDelegation.value.end_date <= newStart) {
    newDelegation.value.end_date = ''
  }
})

watch(() => editDelegation.value.start_date, (newStart) => {
  if (newStart && editDelegation.value.end_date && editDelegation.value.end_date <= newStart) {
    editDelegation.value.end_date = ''
  }
})
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <div class="d-flex justify-space-between align-center flex-wrap gap-4">
          <div>
            <h2 class="text-h6 font-weight-semibold">{{ t('delegation.title') }}</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ t('delegation.subtitle') }}</p>
          </div>
          <VBtn prepend-icon="tabler-plus" @click="openCreateDialog">
            {{ t('delegation.addNew') }}
          </VBtn>
        </div>
      </VCardText>
      <VDivider />

      <VDataTable
        :headers="headers"
        :items="delegationList"
        :loading="isLoading"
        :items-per-page="10"
      >
        <template #item.delegate="{ item }">
          <div v-if="item.delegate">
            <span class="font-weight-medium">{{ item.delegate.first_name }} {{ item.delegate.last_name }}</span>
            <div class="text-caption text-medium-emphasis">{{ item.delegate.email }}</div>
          </div>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <template #item.start_date="{ item }">
          {{ formatDate(item.start_date) }}
        </template>

        <template #item.end_date="{ item }">
          {{ formatDate(item.end_date) }}
        </template>

        <template #item.is_active="{ item }">
          <VChip
            :color="item.is_active ? 'success' : 'default'"
            size="small"
            label
          >
            {{ item.is_active ? t('delegation.active') : t('delegation.inactive') }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn @click="openEditDialog(item)" :disabled="isSubmitting">
              <VIcon icon="tabler-pencil" />
            </IconBtn>
            <IconBtn @click="openDeleteDialog(item)" :disabled="isSubmitting">
              <VIcon icon="tabler-trash" color="error" />
            </IconBtn>
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            {{ t('delegation.noDelegations') }}
          </div>
        </template>
      </VDataTable>
    </VCard>
  </div>

  <!-- Create Dialog -->
  <VDialog v-model="isCreateDialogVisible" persistent :width="$vuetify.display.smAndDown ? 'auto' : 520">
    <VCard class="bm-dialog">
      <div class="bmd-head">
        <div class="bmd-mark">
          <VIcon icon="tabler-user-share" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>{{ t('delegation.addNewTitle') }}</h2>
          <p>{{ t('delegation.addNewSubtitle') }}</p>
        </div>
        <button class="bmd-close" type="button" @click="isCreateDialogVisible = false">
          <VIcon icon="tabler-x" size="18" />
        </button>
      </div>

      <VForm ref="refCreateForm">
        <div class="bmd-body">
          <VAutocomplete
            v-model="newDelegation.delegate_id"
            :label="t('delegation.delegate')"
            :placeholder="t('delegation.delegatePh')"
            :items="userItems()"
            item-title="title"
            item-value="value"
            :rules="[requiredValidator]"
            clearable
            class="mb-4"
          />
          <AppTextField
            v-model="newDelegation.start_date"
            :label="t('delegation.startDate')"
            :placeholder="t('delegation.startDatePh')"
            type="date"
            :rules="[requiredValidator]"
            class="mb-4"
          />
          <AppTextField
            v-show="!!newDelegation.start_date"
            v-model="newDelegation.end_date"
            :label="t('delegation.endDate')"
            :placeholder="t('delegation.endDatePh')"
            type="date"
            :min="minEndDateCreate"
            :rules="[requiredValidator]"
          />
          <VAlert v-if="errorMessage" type="error" class="mt-4" density="compact">
            {{ errorMessage }}
          </VAlert>
        </div>
        <div class="bmd-foot">
          <button class="bmd-btn bmd-btn-ghost" type="button" @click="isCreateDialogVisible = false">
            {{ t('delegation.cancelBtn') }}
          </button>
          <button
            class="bmd-btn bmd-btn-primary"
            type="button"
            :disabled="isSubmitting"
            @click="submitCreate(refCreateForm)"
          >
            {{ isSubmitting ? t('common.saving') : t('delegation.saveBtn') }}
          </button>
        </div>
      </VForm>
    </VCard>
  </VDialog>

  <!-- Edit Dialog -->
  <VDialog v-model="isUpdateDialogVisible" persistent :width="$vuetify.display.smAndDown ? 'auto' : 520">
    <VCard class="bm-dialog">
      <div class="bmd-head">
        <div class="bmd-mark">
          <VIcon icon="tabler-pencil" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>{{ t('delegation.editTitle') }}</h2>
          <p>{{ t('delegation.editSubtitle') }}</p>
        </div>
        <button class="bmd-close" type="button" @click="isUpdateDialogVisible = false">
          <VIcon icon="tabler-x" size="18" />
        </button>
      </div>

      <VForm ref="refEditForm">
        <div class="bmd-body">
          <VAutocomplete
            v-model="editDelegation.delegate_id"
            :label="t('delegation.delegate')"
            :placeholder="t('delegation.delegatePh')"
            :items="userItems()"
            item-title="title"
            item-value="value"
            :rules="[requiredValidator]"
            clearable
            class="mb-4"
          />
          <AppTextField
            v-model="editDelegation.start_date"
            :label="t('delegation.startDate')"
            :placeholder="t('delegation.startDatePh')"
            type="date"
            :rules="[requiredValidator]"
            class="mb-4"
          />
          <AppTextField
            v-show="!!editDelegation.start_date"
            v-model="editDelegation.end_date"
            :label="t('delegation.endDate')"
            :placeholder="t('delegation.endDatePh')"
            type="date"
            :min="minEndDateEdit"
            :rules="[requiredValidator]"
          />
          <VAlert v-if="errorMessage" type="error" class="mt-4" density="compact">
            {{ errorMessage }}
          </VAlert>
        </div>
        <div class="bmd-foot">
          <button class="bmd-btn bmd-btn-ghost" type="button" @click="isUpdateDialogVisible = false">
            {{ t('delegation.cancelBtn') }}
          </button>
          <button
            class="bmd-btn bmd-btn-primary"
            type="button"
            :disabled="isSubmitting"
            @click="submitUpdate(refEditForm)"
          >
            {{ isSubmitting ? t('common.saving') : t('delegation.saveBtn') }}
          </button>
        </div>
      </VForm>
    </VCard>
  </VDialog>

  <!-- Delete Confirmation Dialog -->
  <VDialog v-model="isDeleteDialogVisible" persistent class="v-dialog-sm">
    <DialogCloseBtn @click="isDeleteDialogVisible = false" />
    <VCard :title="t('delegation.deleteTitle')">
      <VCardText>
        {{ t('delegation.deleteBody') }}
        <div v-if="selectedDelegation?.delegate" class="mt-2 font-weight-medium">
          {{ selectedDelegation.delegate.first_name }} {{ selectedDelegation.delegate.last_name }}
          ({{ formatDate(selectedDelegation.start_date) }} – {{ formatDate(selectedDelegation.end_date) }})
        </div>
      </VCardText>
      <VCardText class="d-flex justify-end gap-3 flex-wrap">
        <VBtn color="secondary" variant="tonal" @click="isDeleteDialogVisible = false">
          {{ t('delegation.cancelBtn') }}
        </VBtn>
        <VBtn color="error" :loading="isSubmitting" @click="confirmDelete">
          {{ t('delegation.deleteBtn') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
