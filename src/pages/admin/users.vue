<script setup lang="ts">
import { usersController } from '@/controllers/admin/users-controller';
import { ref } from 'vue';
 
const {
  usersList,
  selected,
  positions,
  isRefetchList,
  changeUserPassword,
  selectedUser,
  confirmationDialogData,
  accessTypeValue,
  roleTypeValue,
  searchQuery,
  filteredPosition,
  filteredAccess,
  filteredRole,
  filteredUsers,
  isCreateUserDialogVisible,
  isChangePasswordDialogVisible,
  isConfirmationDialogVisible,
  isDetailUserDialogVisible,
  isUpdateUserDialogVisible,
  isFilterSectionVisible,
  fetchUsers,
  refetchList,
  userRole,
  accessType,
  onRowClicked,
  onTapFilter,
  editItem,
  changePassword,
  showDeleteUserDialog,
  showDeleteMultipleUserDialog,
  deleteItem,
  deleteMultipleUsers,
  showChangeRoleDialog,
  changeRole,
  showChangeAcceessDialog,
  changeAccess,
  showUnlockUserDialog,
  unlockUser,
} = usersController();

const { t } = useI18n()

const headers = computed(() => [
  { title: 'ID', key: 'id' },
  { title: t('common.firstName') + ' & ' + t('common.lastName'), key: 'name' },
  { title: t('common.email'), key: 'email' },
  { title: t('common.jobPosition'), key: 'position' },
  { title: t('common.role'), key: 'role' },
  { title: t('common.access'), key: 'access' },
  { title: t('common.actions'), key: 'actions' },
])

const isImportUsersDialogVisible = ref(false);

const handleImportComplete = async () => {
  console.log('Import completed, refreshing user list...');
  await fetchUsers();
  isRefetchList.value = false;
};
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <div class="d-flex justify-end flex-wrap gap-y-4 gap-x-6">
          <div class="d-flex align-center flex-wrap">
            <AppTextField
              v-model="searchQuery"
              :placeholder="t('users.search')"
              style="inline-size: 200px; width: 500px;"
              class="me-3"
              :maxlength="100"
            />
            <VBtn
             
              density="comfortable"
              icon=""
              class="rounded"
              @click="onTapFilter"
            >
            <VIcon :icon="isFilterSectionVisible ? 'tabler-filter-x' : 'tabler-filter-plus'">
            </VIcon>
          </VBtn>
          </div>
 
          <VSpacer />
          <div class="d-flex align-center flex-wrap gap-4">
            <VBtn prepend-icon="tabler-plus" @click="isCreateUserDialogVisible = true">
              {{ t('users.addNew') }}
            </VBtn>

            <VBtn prepend-icon="tabler-file-import" @click="isImportUsersDialogVisible = true">
              {{ t('users.importBtn') }}
            </VBtn>

            <VBtn v-if="selected.length > 0" color="error" prepend-icon="tabler-trash" @click="showDeleteMultipleUserDialog">
              {{ t('users.deleteSelected') }}
            </VBtn>
          </div>
        </div>
      </VCardText>

      <VDivider />
 
      <div v-if="isFilterSectionVisible">
        <VCardText>
        <div class="d-flex justify-end flex-wrap gap-y-4 gap-x-6">
          <AppSelect
            v-model="filteredPosition"
            :label="t('users.filters.jobPosition')"
            :placeholder="t('users.filters.selectPosition')"
            :items="positions"
            item-title="name"
            item-value="id"
            clearable
          />

          <AppSelect
            v-model="filteredRole"
            :label="t('users.filters.userType')"
            :placeholder="t('users.filters.selectType')"
            :items="roleTypeValue"
            item-title="title"
            item-value="value"
            clearable
          />

          <AppSelect
            v-model="filteredAccess"
            :label="t('users.filters.access')"
            :placeholder="t('users.filters.selectAccess')"
            :items="accessTypeValue"
            item-title="title"
            item-value="value"
            clearable
          />
        </div>
        </VCardText>
 
        <VDivider />
      </div>
 
      <div>
        <VDataTable
          v-model="selected"
          :headers="headers"
          :items="filteredUsers"
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
              {{ `${item.firstName} ${item.lastName}`  }}
          </VLabel>
        </template>
 
        <template #item.email="{ item }">
          <VLabel>
              {{ item.email }}
          </VLabel>
        </template>
 
        <template #item.position="{ item }">
          <VLabel>
              {{ item.position?.name || '-' }}
          </VLabel>
        </template>
 
        <!-- Type -->
        <template #item.role="{ item }">
          <VChip
            :color="userRole(item.role).color"
            size="small"
          >
            {{ userRole(item.role).text }}
          </VChip>
        </template>
 
        <!-- Access -->
        <template #item.access="{ item }">
          <VChip
            :color="accessType(item.access).color"
            size="small"
          >
            {{ accessType(item.access).text }}
          </VChip>
        </template>
 
          <!-- Actions -->
          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <IconBtn @click="showDeleteUserDialog(item)">
                <VIcon icon="tabler-trash" />
              </IconBtn>
 
              <IconBtn @click="onRowClicked(item)">
                <VIcon icon="tabler-eye" />
              </IconBtn>
 
              <IconBtn>
                <VIcon icon="tabler-dots-vertical" />
                <VMenu activator="parent">
                  <VList>
                    <VListItem
                      value="editUser"
                      @click="editItem(item)"
                    >
                      {{ t('users.actions.edit') }}
                    </VListItem>

                    <VListItem
                      value="changePassword"
                      @click="changePassword(item)"
                    >
                      {{ t('users.actions.changePassword') }}
                    </VListItem>

                    <VListItem
                      value="changeRole"
                      @click="showChangeRoleDialog(item)"
                    >
                      <div v-if="item.role == 99">
                        {{ t('users.actions.setReguler') }}
                      </div>
                      <div v-else>
                        {{ t('users.actions.setAdmin') }}
                      </div>
                    </VListItem>

                    <VListItem
                      value="changeAccess"
                      @click="showChangeAcceessDialog(item)"
                    >
                      <div v-if="item.access == true">
                        {{ t('users.actions.disable') }}
                      </div>
                      <div v-else>
                        {{ t('users.actions.enable') }}
                      </div>
                    </VListItem>

                    <VListItem
                      value="unlockUser"
                      @click="showUnlockUserDialog(item)"
                    >
                      <VIcon start icon="tabler-lock-open" size="20" />
                      {{ t('users.actions.unlock') }}
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
 
  <!-- 👉 Edit user info dialog -->
  <CreateUserDialog
    v-model:user-list="usersList"
    v-model:position="positions"
    v-model:is-dialog-visible="isCreateUserDialogVisible"
    v-model:is-refetch-list="isRefetchList"
    @update:is-refetch-list="refetchList"
  />
 
  <UpdateUserDialog
    v-model:user="selectedUser"
    v-model:users-list="usersList"
    v-model:position="positions"
    v-model:is-dialog-visible="isUpdateUserDialogVisible"
    v-model:is-refetch-list="isRefetchList"
    @update:is-refetch-list="refetchList"
  />
 
  <ChangePasswordDialog
    v-model:change-Password="changeUserPassword"
    v-model:is-dialog-visible="isChangePasswordDialogVisible"
  />
 
  <DetailUserDialog
    v-model:user="selectedUser"
    v-model:is-dialog-visible="isDetailUserDialogVisible"
  />

  <ImportUsersDialog
    v-model:is-dialog-visible="isImportUsersDialogVisible"
    v-model:is-refetch-list="isRefetchList"
    :positions="positions"
    @update:is-refetch-list="handleImportComplete"
  />
 
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
        <VBtn v-if="confirmationDialogData.type == 1" @click="changeRole">
          {{ confirmationDialogData.buttonTitle }}
        </VBtn>
 
        <VBtn v-if="confirmationDialogData.type == 2" @click="changeAccess">
          {{ confirmationDialogData.buttonTitle }}
        </VBtn>
 
        <VBtn 
        color="error"
        v-if="confirmationDialogData.type == 3" @click="deleteItem">
          {{ confirmationDialogData.buttonTitle }}
        </VBtn>
 
        <VBtn 
        color="error"
        v-if="confirmationDialogData.type == 4" @click="deleteMultipleUsers">
          {{ confirmationDialogData.buttonTitle }}
        </VBtn>

        <VBtn 
        color="success"
        v-if="confirmationDialogData.type == 5" @click="unlockUser">
          {{ confirmationDialogData.buttonTitle }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
