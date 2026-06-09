<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const router = useRouter()

// Function to strip HTML tags and decode entities
const stripHtml = (html: string): string => {
  if (!html) return ''
  
  let text = html
  
  // Decode numeric entities (e.g., &#39; &#x27;)
  text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
  text = text.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
  
  // Manual entity replacement multiple times for nested encoding
  for (let iteration = 0; iteration < 5; iteration++) {
    let hasChanged = false
    
    const entityReplacements: Array<[RegExp, string]> = [
      [/&amp;/gi, '&'],
      [/&lt;/gi, '<'],
      [/&gt;/gi, '>'],
      [/&quot;/gi, '"'],
      [/&#0*39;/gi, "'"],
      [/&apos;/gi, "'"],
      [/&#x0*27;/gi, "'"],
      [/&nbsp;/gi, ' '],
    ]
    
    for (const [pattern, replacement] of entityReplacements) {
      const before = text
      text = text.replace(pattern, replacement as string)
      if (text !== before) hasChanged = true
    }
    
    if (!hasChanged) break
  }
  
  // Remove HTML tags
  const tmp = document.createElement('div')
  tmp.innerHTML = text
  return tmp.textContent || tmp.innerText || ''
}

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

const { t } = useI18n()

const headers = computed(() => [
  { title: t('draft.columns.subject'), key: 'subject' },
  { title: t('draft.columns.body'), key: 'body' },
  { title: t('draft.columns.type'), key: 'type' },
  { title: t('draft.columns.priority'), key: 'priority' },
  { title: t('draft.columns.lastUpdate'), key: 'lastUpdate' },
]);

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
  window.location.href = `/preview/${item.id}`
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
              :placeholder="t('draft.search')"
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

      <!-- Filter Options -->
      <div v-if="isFilterSectionVisible">
        <VCardText>
          <div class="d-flex justify-start flex-wrap gap-y-4 gap-x-6">
            <VSelect
              v-model="filterType"
              :items="['Internal', 'External']"
              :label="t('draft.selectType')"
              clearable
            />
            <VSelect
              v-model="filterPriority"
              :items="['High', 'Medium', 'Low']"
              :label="t('draft.selectPriority')"
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
              {{ stripHtml(item.subject) }}
            </VLabel>
          </template>

          <template #item.body="{ item }">
            <VLabel style="max-width: 350px;">
              {{ stripHtml(item.body) }}
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
