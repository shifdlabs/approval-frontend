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
            <VLabel style="max-width: 300px;" v-html="item.body"/>
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

const filteredType = ref(null)
const filteredPriority = ref(null)
const filteredStatus = ref(null)

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
          const priorityMatch =
            !filteredPriority.value ||
            document.priority == filteredPriority.value
          
          const typeMatch = !filteredType.value || document.type == filteredType.value
          const statusMatch = !filteredStatus.value || document.status == filteredStatus.value
          // Both conditions must be true:
          return nameMatch && priorityMatch && typeMatch && statusMatch
        })
      })

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
