<script setup lang="ts">
import { useBookmarkController } from '@/controllers/reguler/bookmark-controller'
import { computed, onMounted, ref, watch } from 'vue'

const { bookmarkList, isLoading, fetchBookmarks } = useBookmarkController()

const searchValue = ref('')

const isFilterSectionVisible = ref(false)
const startDate = ref<string | null>(null)
const endDate = ref<string | null>(null)
const appliedStartDate = ref<string | null>(null)
const appliedEndDate = ref<string | null>(null)

const starredMessages = ref<string[]>([])
const userId = useCookie('userId').value

// Langsung update filter saat tanggal berubah
watch([startDate, endDate], () => {
  appliedStartDate.value = startDate.value
  appliedEndDate.value = endDate.value
})

const toggleStar = async (documentId: string) => {
  if (!userId) return

  if (starredMessages.value.includes(documentId)) {
    // Optimistically remove from UI
    starredMessages.value = starredMessages.value.filter(starId => starId !== documentId)

    const { error, data } = await useApi('bookmark/remove', {
      method: 'POST',
      body: JSON.stringify({ userId, documentId }),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (error.value || !(data.value as any).success) {
      // Revert on failure
      starredMessages.value.push(documentId)
    }

    // Optionally remove from bookmarkList here if needed
  }
}

const filteredBookmarks = computed(() => {
  let result = bookmarkList.value
  // Live search by subject/body
  if (searchValue.value) {
    result = result.filter(item =>
      (item.subject || '').toLowerCase().includes(searchValue.value.toLowerCase()) ||
      (item.body || '').toLowerCase().includes(searchValue.value.toLowerCase())
    )
  }
  // Filter by start date (receivedAt >= startDate)
  if (appliedStartDate.value) {
    result = result.filter(item => {
      if (!item.receiveAt) return false
      return appliedStartDate.value && item.receiveAt.slice(0, 10) >= appliedStartDate.value
    })
  }
  // Filter by end date (receivedAt <= endDate)
  if (appliedEndDate.value) {
    result = result.filter(item => {
      if (!item.receiveAt) return false
      return appliedEndDate.value && item.receiveAt.slice(0, 10) <= appliedEndDate.value
    })
  }
  return result
})

const onTapFilter = () => {
  isFilterSectionVisible.value = !isFilterSectionVisible.value
}

onMounted(async () => {
  await fetchBookmarks()
  starredMessages.value = bookmarkList.value.map(item => item.id)
})
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <div class="d-flex justify-start flex-wrap gap-y-4 gap-x-6">
          <div class="d-flex align-center flex-wrap">
            <AppTextField
              v-model="searchValue"
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

      <!-- Filter Section muncul di bawah search bar -->
      <div v-if="isFilterSectionVisible">
        <VCardText>
        <div class="d-flex flex-row gap-4 w-100">
            <div class="flex-grow-1">
              <AppDateTimePicker
                v-model="startDate"
                label="Start Date"
                placeholder="Select start date"
                :config="{ dateFormat: 'F j, Y' }"
                clearable
              />
            </div>
            <div class="flex-grow-1">
              <AppDateTimePicker
                v-model="endDate"
                label="End Date"
                placeholder="Select end date"
                :config="{ dateFormat: 'F j, Y' }"
                clearable
              />
            </div>
          </div>
        </VCardText>
        <VDivider />
      </div>

      <VCardText>
        <div v-if="isLoading" class="text-center">
          <VProgressCircular indeterminate color="primary" />
        </div>
        <div v-else>
          <VDataTable
            :headers="[
              { title: 'Subject', value: 'subject' },
              { title: 'Body', value: 'body' },
              { title: 'Received At', value: 'receiveAt' },
              { title: '', value: 'star' },
            ]"
            :items="filteredBookmarks"
            :items-per-page="10"
          >
            <template #item.receiveAt="{ item }">
              {{ new Date(item.receiveAt).toLocaleString() }}
            </template>
            <template #item.star="{ item }">
              <VIcon
                @click="toggleStar(item.id)"
                class="cursor-pointer"
                :color="starredMessages.includes(item.id) ? 'yellow' : 'gray'"
              >
                {{ starredMessages.includes(item.id) ? 'tabler-star-filled' : 'tabler-star' }}
              </VIcon>
            </template>
          </VDataTable>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
.rounded-circle {
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
