<script setup lang="ts">
import { Document } from '@/models/document/document';
import { computed, onMounted, ref } from 'vue';

const router = useRouter()
const documents = ref<Document[]>([])
const formattedCompleteList = ref<any[]>([]);
const searchQuery = ref('');
const filterType = ref<string | null>(null);
const filterStatus = ref<string | null>(null);
const isFilterSectionVisible = ref(false);

const headers = [
  { title: 'SUBJECT', key: 'subject' },
  { title: 'BODY', key: 'body' },
  { title: 'TYPE', key: 'type' },
  { title: 'PRIORITY', key: 'priority' },
  { title: 'STATUS', key: 'status' },
  { title: 'COMPLETED AT', key: 'completedAt' },
];

      const fetchDocuments = async () => {
        try {
          const res = await useApi('/document/complete', {
            method: 'GET'
          })
      
          console.log(res.data.value)
          const value = res.data.value as { data: any };
          documents.value = value.data.map((document: any) => mapDocument(document));
        } catch (e) {
          console.log(e)
        }
      }

const filteredCompleteList = computed(() => {
  return documents.value.filter((item) => {
    const subjectMatch =
      !searchQuery.value ||
      item.subject.toLowerCase().includes(searchQuery.value.toLowerCase());
    const typeMatch = !filterType.value || item.type === filterType.value;
    const statusMatch = !filterStatus.value || `${item.status}` === filterStatus.value;
    return subjectMatch && typeMatch && statusMatch;
  });
});

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ''); // remove all HTML tags
}

const onTapFilter = () => {
  filterType.value = null;
  filterStatus.value = null;
  isFilterSectionVisible.value = !isFilterSectionVisible.value;
};

// Warna priority dan teks sesuai Figma
const priorityBgColor = (priority: number | null) => {
  if (priority == 1) return 'error';
  if (priority == 2) return 'warning';
  if (priority == 3) return 'secondary';
  return 'default';
};
const priorityTextColor = (priority: number | null) => {
  if (priority == 1) return 'High';
  if (priority == 2) return 'Medium';
  if (priority == 3) return 'Low';
  return '-';
};

const statusCard = (value: number | null) => {
    if (value === 1)
        return { color: 'warning', text: 'In Progress' }
    else if (value === 2)
        return { color: 'success', text: 'Finished' }
    else if (value === 3)
        return { color: 'secondary', text: 'Cancelled' }
    else if (value === 99)
        return { color: 'error', text: 'Rejected' }
    else
        return { color: 'info', text: '-' }
}

function onTapRow(
        e: MouseEvent,
        payload: { item: Document; index: number; event: MouseEvent }
      ): void {
        const { item, index } = payload
        router.replace('/preview/' + item.id)
        console.log('row clicked:', item.id, 'at index', index)
        // …etc.
      }

onMounted(() => {
  fetchDocuments();
});
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
              v-model="filterStatus"
              :items="['Finish', 'Canceled']"
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
          :items="filteredCompleteList"
          :items-per-page="10"
          @click:row="onTapRow"
        >
          <template #item.subject="{ item }">
            <VLabel>{{ item.subject }}</VLabel>
          </template>

          <template #item.body="{ item }">
            <VLabel style="max-width: 300px;" v-html="stripHtml(item.body)">
            </VLabel>
          </template>

          <template #item.type="{ item }">
            <VLabel>{{ item.type == '1' ? 'Internal' : 'External' }}</VLabel>
          </template>

          <template #item.priority="{ item }">
            <VChip :color="priorityBgColor(item.priority)">
              {{ priorityTextColor(item.priority) }}
            </VChip>
          </template>

          <template #item.status="{ item }">
            <VChip variant="elevated" :color="statusCard(item.status).color">
              {{ statusCard(item.status).text }}
            </VChip>
          </template>

          <template #item.completedAt="{ item }">
            <VLabel>{{ formatDate(item.updatedAt)  }}</VLabel>
          </template>
        </VDataTable>
      </div>
    </VCard>
  </div>
</template>

<style scoped>
.priority-chip {
  min-width: 70px;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.5px;
  border: none !important;
}
.finish-btn {
  background-color: #28C76F !important;
  color: #fff !important;
  opacity: 1 !important;
  pointer-events: none !important;
}
.text-black {
  color: black;
}
</style>
