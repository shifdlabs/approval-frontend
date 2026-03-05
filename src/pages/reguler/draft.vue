<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const router = useRouter()

// Definisikan tipe data untuk response API
interface Author {
  FirstName: string;
}

interface DraftDocument {
  id: string;
  subject: string;
  body: string;
  type: number; // 0 = Internal, 1 = External
  priority: number; // 1 = High, 2 = Medium, 3 = Low
  updatedAt: string;
  author: Author;
}

interface ApiResponse {
  success: boolean;
  code: number;
  message: string;
  data: DraftDocument[];
}

const draftList = ref<DraftDocument[]>([]); // Data asli dari API
const formattedDraftList = ref<any[]>([]); // Data yang diformat untuk ditampilkan
const searchQuery = ref('');
const filterType = ref<string | null>(null);
const filterPriority = ref<string | null>(null);
const isFilterSectionVisible = ref(false);
const isLoading = ref(false);

const headers = [
  { title: 'SUBJECT', key: 'subject' },
  { title: 'BODY', key: 'body' },
  { title: 'TYPE', key: 'type' },
  { title: 'PRIORITY', key: 'priority' },
  { title: 'LAST UPDATE', key: 'lastUpdate' },
];

const fetchDraftDocuments = async () => {
  isLoading.value = true;

  const { execute, data, error } = useApi(
    'document/draft',
    { method: 'GET' },
    { immediate: false }
  );

  await execute();

  if (!error.value && (data.value as any)?.success) {
    const res = data.value as any;

    draftList.value = res.data; // Simpan data asli

    formattedDraftList.value = res.data.map((item: any) => ({
      id: item.id,
      subject: item.subject,
      body: item.body || 'No body provided',
      type: item.type === 0 ? 'Internal' : 'External',
      priority:
        item.priority === 1
          ? 'High'
          : item.priority === 2
          ? 'Medium'
          : 'Low',
      lastUpdate: new Date(item.updatedAt).toLocaleString(),
    }));
  } else if (error.value) {
    console.error('Failed to fetch draft documents:', error.value);
  }

  isLoading.value = false;
};

const filteredDraftList = computed(() => {
  return formattedDraftList.value.filter((item) => {
    const subjectMatch =
      !searchQuery.value ||
      item.subject.toLowerCase().includes(searchQuery.value.toLowerCase());
    const typeMatch = !filterType.value || item.type === filterType.value;
    const priorityMatch =
      !filterPriority.value || item.priority === filterPriority.value;
    return subjectMatch && typeMatch && priorityMatch;
  });
});

const onTapFilter = () => {
  filterType.value = null;
  filterPriority.value = null;
  isFilterSectionVisible.value = !isFilterSectionVisible.value;
};

onMounted(() => {
  fetchDraftDocuments();
});

function onTapRow(
        e: MouseEvent,
        payload: { item: DraftDocument; index: number; event: MouseEvent }
): void {
        const { item, index } = payload
      router.push('/document/' + item.id)
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
          :items="filteredDraftList"
          :items-per-page="10"
          @click:row="onTapRow"
        >
          <template #item.subject="{ item }">
            <VLabel>
              {{ item.subject }}
            </VLabel>
          </template>

          <template #item.body="{ item }">
            <VLabel style="max-width: 350px;" v-html="item.body"/>
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

          <template #item.lastUpdate="{ item }">
            <VLabel>
              {{ item.lastUpdate }}
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
</style>
