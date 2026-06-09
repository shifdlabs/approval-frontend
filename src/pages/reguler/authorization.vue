<script setup lang="ts">
import { authorizationController } from '@/controllers/reguler/authorization-controller';

const {
  selected,
  searchQuery,
  filteredType,
  filteredPriority,
  filteredStatus,
  filteredDocument,
  isFilterSectionVisible,
  documentTypeValue,
  priorityValue,
  statusValue,
  documentType,
  priorityCard,
  statusCard,
  stripHtml,
  decodeHtml,
  onTapFilter,
  onTapRow
} = authorizationController()

const { t } = useI18n()

const headers = computed(() => [
  { title: t('common.subject'), key: 'subject' },
  { title: t('common.body'), key: 'body' },
  { title: t('common.type'), key: 'type' },
  { title: t('common.priority'), key: 'priority' },
  { title: t('common.status'), key: 'status' },
  { title: t('common.updatedAt'), key: 'updatedAt' },
])
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <div class="d-flex justify-end flex-wrap gap-y-4 gap-x-6">
          <div class="d-flex align-center flex-wrap">
            <AppTextField
              v-model="searchQuery"
              :placeholder="t('authorization.search')"
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
            
          <VSpacer />
        </div>
      </VCardText>

      <VDivider />

      <div v-if="isFilterSectionVisible">
        <VCardText>
        <div class="d-flex justify-end flex-wrap gap-y-4 gap-x-6">
          <AppSelect
            v-model="filteredType"
            :label="t('authorization.documentType')"
            :placeholder="t('authorization.selectType')"
            :items="documentTypeValue"
            item-title="title"
            item-value="value"
            clearable
          />

          <AppSelect
            v-model="filteredPriority"
            :label="t('authorization.priority')"
            :placeholder="t('authorization.selectPriority')"
            :items="priorityValue"
            item-title="title"
            item-value="value"
            clearable
          />

          <AppSelect
            v-model="filteredStatus"
            :label="t('authorization.status')"
            :placeholder="t('authorization.selectStatus')"
            :items="statusValue"
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
          :items="filteredDocument"
          :items-per-page="10"
          @click:row="onTapRow"
        >
          <template #item.subject="{ item }">
            <RouterLink
            :to="{ name: 'preview-id', params: { id: '1212' } }"
            class="font-weight-medium text-link">
            <VLabel>
                {{ stripHtml(item.subject) }}
            </VLabel>
            </RouterLink>
          </template>

          <template #item.body="{ item }">
            <VLabel style="max-width: 300px;">
              {{ stripHtml(item.body) }}
            </VLabel>
          </template>

          <template #item.type="{ item }">
            <VLabel>
                {{ documentType(item.type) }}
            </VLabel>
          </template>
          
          <!-- Type -->
          <template #item.priority="{ item }">
            <VChip
              :color="priorityCard(item.priority).color"
              size="small"
            >
              {{ priorityCard(item.priority).text }}
            </VChip>
          </template>

          <!-- Access -->
          <template #item.status="{ item }">
            <VChip
              :color="statusCard(item.status).color"
              size="small"
            >
              {{ statusCard(item.status).text }}
            </VChip>
          </template>

          <template #item.updatedAt="{ item }">
            <VLabel>
                {{ formatDate(item.updatedAt)  }}
            </VLabel>
          </template>

        </VDataTable>
      </div>
    </VCard>
  </div>
</template>
  