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

const documentType = (value: string) => {
  if (value === '1')
    return "External"
  else 
    return "Internal"
}

const filteredCompleteList = computed(() => {
  return documents.value.filter((item) => {
    const subjectMatch =
      !searchQuery.value ||
      item.subject.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // Use documentType function for consistent type matching
    const typeMatch = !filterType.value || documentType(item.type) === filterType.value
    
    // Convert filter status to match document status values
    let statusMatch = true;
    if (filterStatus.value) {
      const statusValue = filterStatus.value === 'Finish' ? 2 : 3;
      statusMatch = item.status === statusValue;
    }
    
    return subjectMatch && typeMatch && statusMatch;
  });
});

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
            <VLabel>{{ stripHtml(item.subject) }}</VLabel>
          </template>

          <template #item.body="{ item }">
            <VLabel style="max-width: 300px;">
              {{ stripHtml(item.body) }}
            </VLabel>
          </template>

          <template #item.type="{ item }">
            <VLabel>{{ documentType(item.type) }}</VLabel>
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
