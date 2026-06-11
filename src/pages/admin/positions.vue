<script setup lang="ts">
import { positionsController } from '@/controllers/admin/positions-controller';
const {
  filteredPositionsList,
  searchQuery,
  selected,
  confirmationDialogData,
  isCreatePositionDialogVisible,
  isConfirmationDialogVisible,
  isUpdatePositionDialogVisible,
  headers,
  editItem,
  showDeletePositionDialog,
  deleteItem,
  applyFilters,
  newPosition,
  isFormValid,
  formRules,
  closeCreatePositionDialog,
  submitNewPositionForm,
  submitEditPositionForm,
  selectedPositionName,
} = positionsController();

const { t } = useI18n()
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <div class="d-flex justify-end flex-wrap gap-y-4 gap-x-6">
          <div class="d-flex align-center flex-wrap">
            <AppTextField
              v-model="searchQuery"
              :placeholder="t('positions.search')"
              style="inline-size: 200px; width: 500px;"
              class="me-3"
              @input="applyFilters"
              clearable
            />
          </div>
          <VSpacer />
          <div class="d-flex align-center flex-wrap gap-4">
            <VBtn prepend-icon="tabler-plus" @click="isCreatePositionDialogVisible = true">
              {{ t('positions.addNew') }}
            </VBtn>
          </div>
        </div>
      </VCardText>
      <VDivider />

      <div>
        <VDataTable
          v-model="selected"
          :headers="headers"
          :items="filteredPositionsList"
          :items-per-page="10"
          show-select 
        >
          <template #item.id="{ item }">
            <VLabel>
              {{ item.id }}
            </VLabel>
          </template>

          <template #item.name="{ item }">
            <VLabel>
              {{ item.name }}
            </VLabel>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <IconBtn @click="showDeletePositionDialog(item)">
                <VIcon icon="tabler-trash" />
              </IconBtn>

              <IconBtn>
                <VIcon icon="tabler-dots-vertical" />
                <VMenu activator="parent">
                  <VList>
                    <VListItem
                      value="editPosition"
                      @click="editItem(item)"
                    >
                      Edit Position
                    </VListItem>
                  </VList>
                </VMenu>
              </IconBtn>
            </div>
          </template>
        </VDataTable>
      </div>
    </VCard>
  </div>

  <!-- 👉 Create position dialog -->
  <VDialog v-model="isCreatePositionDialogVisible" persistent :width="$vuetify.display.smAndDown ? 'auto' : 520">
    <VCard class="bm-dialog">
      <div class="bmd-head">
        <div class="bmd-mark">
          <VIcon icon="tabler-briefcase" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>{{ t('positions.addNewTitle') }}</h2>
          <p>{{ t('positions.addNewSubtitle') }}</p>
        </div>
        <button class="bmd-close" type="button" @click="closeCreatePositionDialog">
          <VIcon icon="tabler-x" size="18" />
        </button>
      </div>
      <VForm ref="refCreateForm" v-model="isFormValid">
        <div class="bmd-body">
          <AppTextField
            v-model="newPosition.name"
            :label="t('positions.name')"
            :placeholder="t('positions.namePh')"
            :rules="[formRules.required]"
          />
        </div>
        <div class="bmd-foot">
          <button class="bmd-btn bmd-btn-ghost" type="button" @click="closeCreatePositionDialog">
            {{ t('positions.cancel') }}
          </button>
          <button class="bmd-btn bmd-btn-primary" type="button" :disabled="!isFormValid" @click="submitNewPositionForm">
            {{ t('positions.add') }}
          </button>
        </div>
      </VForm>
    </VCard>
  </VDialog>

  <!-- 👉 Edit position info dialog -->
  <VDialog v-model="isUpdatePositionDialogVisible" persistent :width="$vuetify.display.smAndDown ? 'auto' : 520">
    <VCard class="bm-dialog">
      <div class="bmd-head">
        <div class="bmd-mark">
          <VIcon icon="tabler-pencil" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>{{ t('positions.editTitle') }}</h2>
          <p>{{ t('positions.editSubtitle') }}</p>
        </div>
        <button class="bmd-close" type="button" @click="isUpdatePositionDialogVisible = false">
          <VIcon icon="tabler-x" size="18" />
        </button>
      </div>
      <VForm ref="refEditForm" v-model="isFormValid">
        <div class="bmd-body">
          <AppTextField
            v-model="selectedPositionName"
            :label="t('positions.name')"
            :placeholder="t('positions.namePh')"
            :rules="[formRules.required]"
          />
        </div>
        <div class="bmd-foot">
          <button class="bmd-btn bmd-btn-ghost" type="button" @click="isUpdatePositionDialogVisible = false">
            {{ t('positions.cancel') }}
          </button>
          <button class="bmd-btn bmd-btn-primary" type="button" :disabled="!isFormValid" @click="submitEditPositionForm">
            {{ t('positions.save') }}
          </button>
        </div>
      </VForm>
    </VCard>
  </VDialog>

  <VDialog
    v-model="isConfirmationDialogVisible"
    persistent
    class="v-dialog-sm"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isConfirmationDialogVisible = !isConfirmationDialogVisible" />

    <!-- Dialog Content -->
    <VCard :title="confirmationDialogData.title">
      <VCardText>
        {{ confirmationDialogData.body }}
      </VCardText>

      <VCardText class="d-flex justify-end gap-3 flex-wrap">
        <VBtn
          color="secondary"
          variant="tonal"
          @click="isConfirmationDialogVisible = false"
        >
          Cancel
        </VBtn>
        <VBtn 
        color="error"
        v-if="confirmationDialogData.type == 1" @click="deleteItem">
          {{ confirmationDialogData.buttonTitle }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
