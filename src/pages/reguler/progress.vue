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

          <template #item.currentApprovalName="{ item }">
            <VLabel>
              {{ item.currentApprovalName }}
            </VLabel>
          </template>
        </VDataTable>
      </div>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { Document } from '@/models/document/document';
import { computed, onMounted, ref } from 'vue';

const searchQuery = ref('');
const filterType = ref<string | null>(null);
const filterPriority = ref<string | null>(null);
const isFilterSectionVisible = ref(false);
const router = useRouter()

const headers = [
  { title: 'SUBJECT', key: 'subject' },
  { title: 'BODY', key: 'body' },
  { title: 'TYPE', key: 'type' },
  { title: 'PRIORITY', key: 'priority' },
  { title: 'CURRENT APPROVAL', key: 'currentApprovalName' },
];

const documents = ref<Document[]>([])

const fetchDocuments = async () => {
        try {
          const res = await useApi('/document/inprogress', {
            method: 'GET'
          })
          console.log('Reza')
          console.log(res.data.value)
          const value = res.data.value as { data: any };
          documents.value = value.data.map((document: any) => mapDocument(document));
        } catch (e) {
          console.log(e)
        }
      }

      const filteredDocument = computed(() => {
        return documents.value.filter(document => {
          const subject = document.subject.toLowerCase()
          const nameMatch =
            !searchQuery.value ||
            subject.includes(searchQuery.value.toLowerCase())
          
          // Convert filter values to match document values
          let priorityValue = null
          if (filterPriority.value === 'High') priorityValue = 1
          else if (filterPriority.value === 'Medium') priorityValue = 2
          else if (filterPriority.value === 'Low') priorityValue = 3
          
          const priorityMatch =
            !filterPriority.value ||
            document.priority == priorityValue
          
          // Use documentType function for consistent type matching
          const typeMatch = !filterType.value || documentType(document.type) === filterType.value
          
          // Both conditions must be true:
          return nameMatch && priorityMatch && typeMatch
        })
      })

// Helper function to strip HTML tags and decode entities
const stripHtml = (html: string): string => {
  if (!html) return ''
  
  let text = html
  
  // Decode all possible HTML entities multiple times
  for (let iteration = 0; iteration < 5; iteration++) {
    let hasChanged = false
    
    // Manual entity replacement (case insensitive)
    const entityReplacements: Array<[RegExp, string]> = [
      [/&amp;/gi, '&'],
      [/&lt;/gi, '<'],
      [/&gt;/gi, '>'],
      [/&quot;/gi, '"'],
      [/&#0*34;/gi, '"'],
      [/&#x0*22;/gi, '"'],
      [/&#0*39;/gi, "'"],
      [/&apos;/gi, "'"],
      [/&#x0*27;/gi, "'"],
      [/&#0*47;/gi, '/'],
      [/&#x0*2F;/gi, '/'],
      [/&sol;/gi, '/'],
      [/&#0*92;/gi, '\\'],
      [/&#x0*5C;/gi, '\\'],
      [/&#0*124;/gi, '|'],
      [/&#x0*7C;/gi, '|'],
      [/&verbar;/gi, '|'],
      [/&#0*37;/gi, '%'],
      [/&#x0*25;/gi, '%'],
      [/&percnt;/gi, '%'],
      [/&nbsp;/gi, ' '],
    ]
    
    for (const [pattern, replacement] of entityReplacements) {
      const before = text
      text = text.replace(pattern, replacement as string)
      if (text !== before) hasChanged = true
    }
    
    // Generic numeric entities
    const beforeNumeric = text
    text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec)))
    text = text.replace(/&#x([0-9A-Fa-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    if (text !== beforeNumeric) hasChanged = true
    
    // DOM-based decoding
    const tmp = document.createElement('DIV')
    tmp.innerHTML = text
    const decoded = tmp.textContent || tmp.innerText || ''
    if (decoded !== text) hasChanged = true
    text = decoded
    
    // If nothing changed, we're done
    if (!hasChanged) break
  }
  
  // Remove any remaining < > brackets (for safety)
  text = text.replace(/[<>]/g, '')
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim()
  
  return text
}

const onTapFilter = () => {
  filterType.value = null;
  filterPriority.value = null;
  isFilterSectionVisible.value = !isFilterSectionVisible.value;
};

const priorityCard = (value: number | null) => {
    if (value === 1)
        return { color: 'error', text: 'High' }
    else if (value === 2)
        return { color: 'warning', text: 'Medium' }
    else
        return { color: 'primary', text: 'Low' }
    }
  const documentType = (value: string) => {
    if (value === '1')
        return "External"
    else 
        return "Internal"
    }

const mapDocument = (rawDocuments: any): Document => {
        return {
          ...rawDocuments,
          // override the position property with our mapped version
          // position: mapPosition(rawUser.position)
        };
      };

onMounted(() => {
  // fetchProgressDocuments();
  fetchDocuments()
});

function onTapRow(
        e: MouseEvent,
        payload: { item: Document; index: number; event: MouseEvent }
): void {
        const { item, index } = payload
        router.replace('/preview/' + item.id)
        console.log('row clicked:', item.id, 'at index', index)
        // …etc.
      }
</script>

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
