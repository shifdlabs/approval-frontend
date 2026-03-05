<script setup lang="ts">
import { appLogController } from '@/controllers/admin/app-log-controller';
const {
  selectedLog,
  isDetailLogDialogVisible,
  isFilterSectionVisible,
  filteredDocument,
  searchQuery,
  filteredDate,
  headers,
  onRowClicked,
  onTapFilter,
} = appLogController();
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <div class="d-flex justify-end flex-wrap gap-y-4 gap-x-6">
          <div class="d-flex align-center flex-wrap">
            <AppTextField
              v-model="searchQuery"
              placeholder="Search User ID"
              style="inline-size: 200px; width: 500px;"
              class="me-3"
            />
            <VBtn
              color="#E0E0E0"
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
        </div>
      </VCardText>

      <VDivider />

      <div v-if="isFilterSectionVisible">
        <div class="d-flex justify-start flex-wrap gap-y-4 gap-x-6">
            <VCol cols="12" md="6">
                <AppDateTimePicker
                v-model="filteredDate"
                label="Filter By Date"
                placeholder="Select date"
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
        
        <template #item.userId="{ item }">
          <VLabel>
              {{ item.userId  }}
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
  