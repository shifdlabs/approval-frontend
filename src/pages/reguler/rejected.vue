<script setup lang="ts">
import { Document, LastRejector } from '@/models/document/document';
import { computed, onMounted, ref } from 'vue';

const router = useRouter()

const documents = ref<Document[]>([])
const searchQuery = ref('');
const isFilterSectionVisible = ref(false);
const isLoading = ref(false);
const filterPriority = ref<string | null>(null); // Define filterPriority
const filterType = ref<string | null>(null); // Define filterType

const headers = [
  { title: 'SUBJECT', key: 'subject' },
  { title: 'BODY', key: 'body' },
  { title: 'REJECTED BY', key: 'lastRejector' },
  { title: 'REASON', key: 'reason' },
];

const fetchRejectedHistories = async () => {
  isLoading.value = true;

  const { execute, data, error } = useApi(
    '/document/rejected',
    {
      method: 'GET',
    },
    { immediate: false }
  );

  await execute();

  if (!error.value && (data.value as any)?.success) {
    const value = (data.value as any).data;
    documents.value = value.map((document: any) => mapDocument(document));
  } else if (error.value) {
    console.error('Failed to fetch rejected histories:', error.value);
  }

  isLoading.value = false;
};

const mapLastRejector = (rawRejector: any): LastRejector => {
  return {
    name: rawRejector?.name ?? '',
    reason: rawRejector?.reason ?? ''
  };
};

const mapDocument = (rawDocuments: any): Document => {
        return {
          ...rawDocuments,
          lastRejector: mapLastRejector(rawDocuments.lastRejector),
        };
      };

const onTapFilter = () => {
  isFilterSectionVisible.value = !isFilterSectionVisible.value;
};

function onTapRow(
        e: MouseEvent,
        payload: { item: Document; index: number; event: MouseEvent }
): void {
        const { item, index } = payload
        router.replace('/preview/' + item.id)
      }

onMounted(() => {
  fetchRejectedHistories();
});

const filteredDocument = computed(() => {
        return documents.value.filter(document => {
          const subject = document.subject.toLowerCase()
          const nameMatch =
            !searchQuery.value ||
            subject.includes(searchQuery.value.toLowerCase())

          return nameMatch
        })
      })

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ''); // remove all HTML tags
}
</script>

<template>
  <div>
    <VCard>
      <!-- Search and Filter Section -->
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

      <!-- Filter Options -->
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
          </div>
        </VCardText>
        <VDivider />
      </div>

      <!-- Data Table -->
      <div>
        <VDataTable
          :headers="headers"
          :items="filteredDocument"
          :items-per-page="10"
          @click:row="onTapRow"
        >
          <template #item.subject="{ item }">
            <VLabel>
              {{ item.subject }}
            </VLabel>
          </template>

          <template #item.body="{ item }">
            <VLabel class="body-cell" v-html="stripHtml(item.body)"/>
          </template>

          <template #item.lastRejector="{ item }">
            <VLabel>
              {{ item.lastRejector?.name }}
            </VLabel>
          </template>

          <template #item.reason="{ item }">
            <VLabel>
              {{ item.lastRejector?.reason }}
            </VLabel>
          </template>
        </VDataTable>
      </div>
    </VCard>
  </div>
</template>

<style scoped>
/* Tambahkan styling untuk memastikan tombol filter berbentuk icon */
.rounded-circle {
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.body-cell {
  max-width: 300px;
  max-height: 30px;
  overflow: hidden;
  display: block;
  white-space: normal;
  text-overflow: unset;
}
</style>
