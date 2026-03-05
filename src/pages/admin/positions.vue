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
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <div class="d-flex justify-end flex-wrap gap-y-4 gap-x-6">
          <div class="d-flex align-center flex-wrap">
            <AppTextField
              v-model="searchQuery"
              placeholder="Search Job Position"
              style="inline-size: 200px; width: 500px;"
              class="me-3"
              @input="applyFilters"
              clearable
            />
          </div>
          <VSpacer />
          <div class="d-flex align-center flex-wrap gap-4">
            <VBtn prepend-icon="tabler-plus" @click="isCreatePositionDialogVisible = true">
              Add Job Position
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
  <VDialog v-model="isCreatePositionDialogVisible" persistent class="v-dialog-sm">
    <VCard>
      <VCardTitle>
        Add New Position
      </VCardTitle>
      <VCardText>
        <VForm ref="form" v-model="isFormValid">
          <VTextField
            v-model="newPosition.name"
            label="Position Name"
            :rules="[formRules.required]"
            required
          />
        </VForm>
      </VCardText>
      <VCardActions class="d-flex justify-end gap-3 flex-wrap">
        <VBtn color="secondary" variant="tonal" @click="closeCreatePositionDialog">
          Cancel
        </VBtn>
        <VBtn color="primary" :disabled="!isFormValid" @click="submitNewPositionForm">
          Add
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- 👉 Edit position info dialog -->
  <VDialog v-model="isUpdatePositionDialogVisible" persistent class="v-dialog-sm">
    <VCard>
      <VCardTitle>
        Edit Position
      </VCardTitle>
      <VCardText>
        <VForm ref="form" v-model="isFormValid">
          <VTextField
            v-model="selectedPositionName"
            label="Position Name"
            :rules="[formRules.required]"
            required
          />
        </VForm>
      </VCardText>
      <VCardActions class="d-flex justify-end gap-3 flex-wrap">
        <VBtn color="secondary" variant="tonal" @click="isUpdatePositionDialogVisible = false">
          Cancel
        </VBtn>
        <VBtn color="primary" :disabled="!isFormValid" @click="submitEditPositionForm">
          Save
        </VBtn>
      </VCardActions>
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

<style scoped>
.custom-size {
  width: 20rem; /* Adjust the size as needed */
}
.mt-4 {
  margin-top: 1rem;
}
.purple-btn {
  background-color: #7367F0;
  color: white;
}
.ml-auto {
  margin-left: auto;
}
</style>
