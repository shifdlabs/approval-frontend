<script setup lang="ts">
import { historiesController } from '@/controllers/admin/histories-controller';
const {
  filteredHistories,
  searchQuery,
  filterType,
  filterPriority,
  filterStatus,
  isFilterSectionVisible,
  headers,
  onTapFilter,
} = historiesController();
</script>

<template>
  <div>
    <VCard>
        <VCardText>
        <div class="d-flex justify-start flex-wrap gap-y-4 gap-x-6">
          <div class="d-flex align-center flex-wrap">
            <AppTextField
              v-model="searchQuery"
              placeholder="Search Subject"
              style="inline-size: 200px; width: 500px;"
              class="me-3"
              clearable
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
        </div>
      </VCardText>
      <VDivider />

      <div v-if="isFilterSectionVisible">
        <VCardText>
          <div class="d-flex justify-start flex-wrap gap-y-4 gap-x-6">
            <VSelect
              v-model="filterType"
              :items="['Internal', 'External']"
              label="Select Type"
              clearable
            />
            <VSelect
              v-model="filterPriority"
              :items="['High', 'Medium', 'Low']"
              label="Select Priority"
              clearable
            />
            <VSelect
              v-model="filterStatus"
              :items="['Approved', 'Rejected']"
              label="Select Status"
              clearable
            />
          </div>
        </VCardText>
        <VDivider />
      </div>

      <div>
        <VDataTable
          :headers="headers"
          :items="filteredHistories"
          :items-per-page="10"
        >
          <template #item.no="{ item, index }">
            <VLabel>
              {{ index + 1 }}
            </VLabel>
          </template>

          <template #item.subject="{ item }">
            <VLabel>
              {{ item.subject }}
            </VLabel>
          </template>

          <template #item.user="{ item }">
            <VLabel>
              {{ item.user }}
            </VLabel>
          </template>

          <template #item.type="{ item }">
            <VLabel>
              {{ item.type }}
            </VLabel>
          </template>

          <template #item.priority="{ item }">
            <VChip
              :color="item.priority === 'High' ? 'error' : item.priority === 'Medium' ? 'warning' : 'info'"
              size="small"
            >
              {{ item.priority }}
            </VChip>
          </template>

          <template #item.action="{ item }">
            <VChip
              :color="item.action === 'Approved' ? 'success' : 'error'"
              size="small"
            >
              {{ item.action }}
            </VChip>
          </template>

          <template #item.description="{ item }">
            <VLabel>
              {{ item.description }}
            </VLabel>
          </template>

          <template #item.updatedAt="{ item }">
            <VLabel>
              {{ new Date(item.updatedAt).toLocaleString() }}
            </VLabel>
          </template>
        </VDataTable>
      </div>
    </VCard>
  </div>
</template>

<style scoped>
.custom-size {
  width: 20rem; /* Adjust the size as needed */
}
</style>
