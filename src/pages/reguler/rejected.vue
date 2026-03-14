<script setup lang="ts">
import { Document, LastRejector } from '@/models/document/document';
import { computed, onMounted, ref } from 'vue';

const router = useRouter()

const documents = ref<Document[]>([])
const searchQuery = ref('');
const isFilterSectionVisible = ref(false);
const isLoading = ref(false);
const filterPriority = ref<string | null>(null);
const filterType = ref<string | null>(null);

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

const headers = [
  { title: 'SUBJECT', key: 'subject' },
  { title: 'BODY', key: 'body' },
  { title: 'TYPE', key: 'type' },
  { title: 'PRIORITY', key: 'priority' },
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

const documentType = (value: string) => {
  if (value === '1')
    return "External"
  else 
    return "Internal"
}

const priorityCard = (value: number | null) => {
  if (value === 1)
    return { color: 'error', text: 'High' }
  else if (value === 2)
    return { color: 'warning', text: 'Medium' }
  else if (value === 3)
    return { color: 'info', text: 'Low' }
  else
    return { color: 'primary', text: 'Low' }
}

const filteredDocument = computed(() => {
  return documents.value.filter(document => {
    const subject = document.subject.toLowerCase()
    const subjectMatch =
      !searchQuery.value ||
      subject.includes(searchQuery.value.toLowerCase())

    // Use documentType function for consistent type matching
    const typeMatch = !filterType.value || documentType(document.type) === filterType.value
    
    // Priority filter
    let priorityMatch = true;
    if (filterPriority.value) {
      const priorityValue = filterPriority.value === 'High' ? 1 : filterPriority.value === 'Medium' ? 2 : 3;
      priorityMatch = document.priority === priorityValue;
    }

    return subjectMatch && typeMatch && priorityMatch
  })
})
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
              {{ stripHtml(item.subject) }}
            </VLabel>
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

          <template #item.priority="{ item }">
            <VChip
              :color="priorityCard(item.priority).color"
              size="small"
            >
              {{ priorityCard(item.priority).text }}
            </VChip>
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
