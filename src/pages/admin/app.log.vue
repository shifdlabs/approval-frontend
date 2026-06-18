<script setup lang="ts">
import { appLogController } from '@/controllers/admin/app-log-controller';
const {
  selectedLog,
  isDetailLogDialogVisible,
  isFilterSectionVisible,
  filteredDocument,
  searchQuery,
  filteredDate,
  filteredModule,
  filteredAction,
  moduleOptions,
  actionOptions,
  headers,
  onRowClicked,
  onTapFilter,
  exportLogs,
  formatDate,
} = appLogController();

const { t } = useI18n()
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <div class="d-flex justify-end flex-wrap gap-y-4 gap-x-6">
          <div class="d-flex align-center flex-wrap gap-3">
            <AppTextField
              v-model="searchQuery"
              :placeholder="t('appLog.searchUserName')"
              style="inline-size: 200px; width: 300px;"
            />
            <VBtn
              density="comfortable"
              icon=""
              class="rounded"
              @click="onTapFilter"
            >
              <VIcon :icon="isFilterSectionVisible ? 'tabler-filter-x' : 'tabler-filter-plus'" />
            </VBtn>
            <VBtn
              color="success"
              prepend-icon="tabler-file-spreadsheet"
              @click="exportLogs"
            >
              {{ t('appLog.export') }}
            </VBtn>
          </div>

          <VSpacer />
        </div>
      </VCardText>

      <VDivider />

      <div v-if="isFilterSectionVisible">
        <div class="d-flex justify-start flex-wrap gap-y-4 gap-x-6 pa-4">
          <VCol cols="12" md="4">
            <AppDateTimePicker
              v-model="filteredDate"
              :label="t('appLog.filterByDate')"
              placeholder="Select date"
              clearable
            />
          </VCol>
          <VCol cols="12" md="3">
            <VSelect
              v-model="filteredModule"
              :items="moduleOptions"
              :label="t('appLog.filterByModule')"
              clearable
            />
          </VCol>
          <VCol cols="12" md="3">
            <VSelect
              v-model="filteredAction"
              :items="actionOptions"
              :label="t('appLog.filterByAction')"
              clearable
            />
          </VCol>
        </div>
        <VDivider />
      </div>

      <div>
        <VDataTable
          :headers="headers"
          :items="filteredDocument"
          :items-per-page="10"
        >
          <template #item.userName="{ item }">
            <VLabel>
              {{ item.userName || '-' }}
            </VLabel>
          </template>

          <template #item.actionType="{ item }">
            <VLabel style="max-width: 300px;">
              {{ item.action }}
            </VLabel>
          </template>

          <template #item.module="{ item }">
            <VLabel>
              {{ item.module }}
            </VLabel>
          </template>

          <template #item.logDate="{ item }">
            <VLabel>
              {{ formatDate(item.logDate) }}
            </VLabel>
          </template>

          <template #item.action="{ item }">
            <IconBtn @click="onRowClicked(item)">
              <VIcon icon="tabler-eye" />
            </IconBtn>
          </template>
        </VDataTable>
      </div>
    </VCard>
  </div>

  <DetailAppLogDialog
    v-model:appLog="selectedLog"
    v-model:is-dialog-visible="isDetailLogDialogVisible"
  />
</template>
