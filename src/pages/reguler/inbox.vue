<script setup lang="ts">
import { useRecipientController } from '@/controllers/reguler/recipient-controller';
import { computed, onMounted, ref, watch } from 'vue';

const { inboxList, isLoading, fetchInbox } = useRecipientController();

const searchValue = ref('');
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const isFilterSectionVisible = ref(false);
const starredMessages = ref<string[]>([]);
const userId = useCookie('userId').value;

// Simpan filter yang akan dipakai saat tanggal berubah
const appliedStartDate = ref<string | null>(null);
const appliedEndDate = ref<string | null>(null);

// Watcher agar filter langsung jalan saat tanggal berubah
watch([startDate, endDate], () => {
  appliedStartDate.value = startDate.value;
  appliedEndDate.value = endDate.value;
});

const checkBookmarkStatus = async (documentId: string) => {
  try {
    const { execute, data, error } = useApi(
      'bookmark/status',
      {
        method: 'POST',
        body: JSON.stringify({ userId, documentId }),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // harus di RequestInit
      },
      { immediate: false }
    )

    await execute()

    if (error.value) {
      console.error(`Error checking bookmark status for document ${documentId}:`, error.value)
      return
    }

    const res = data.value as any

    if (res?.Success && res?.Data?.isBookmarked) {
      starredMessages.value.push(documentId)
    }

  } catch (e) {
    console.error(`Unexpected exception during bookmark check for document ${documentId}:`, e)
  }
}

const toggleStar = async (documentId: string) => {
  if (!userId) return;

  const isStarred = starredMessages.value.includes(documentId);
  const endpoint = isStarred ? 'bookmark/remove' : 'bookmark/add';

  // Optimistically update UI
  if (isStarred) {
    starredMessages.value = starredMessages.value.filter(starId => starId !== documentId);
  } else {
    starredMessages.value.push(documentId);
  }

  const { execute, data, error } = useApi(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify({ userId, documentId }),
      headers: { 'Content-Type': 'application/json' },
    },
    { immediate: false }
  );

  await execute();

  if (error.value || !(data.value as any)?.success) {
    // Revert the UI update if failed
    if (isStarred) {
      starredMessages.value.push(documentId);
    } else {
      starredMessages.value = starredMessages.value.filter(starId => starId !== documentId);
    }
  }
};

const filteredInbox = computed(() => {
  let result = inboxList.value;
  // Live search by subject
  if (searchValue.value) {
    result = result.filter(item =>
      item.subject?.toLowerCase().includes(searchValue.value.toLowerCase())
    );
  }
  // Filter by start date (updatedAt >= startDate)
  if (appliedStartDate.value) {
    result = result.filter(item => {
      if (!item.updatedAt) return false;
      return appliedStartDate.value && item.updatedAt.slice(0, 10) >= appliedStartDate.value;
    });
  }
  // Filter by end date (updatedAt <= endDate)
  if (appliedEndDate.value) {
    result = result.filter(item => {
      if (!item.updatedAt) return false;
      return appliedEndDate.value && item.updatedAt.slice(0, 10) <= appliedEndDate.value;
    });
  }
  return result;
});

const onTapFilter = () => {
  isFilterSectionVisible.value = !isFilterSectionVisible.value;
};

onMounted(async () => {
  await fetchInbox();
  for (const item of inboxList.value) {
    await checkBookmarkStatus(item.id);
  }
});
</script>

<template>
  <div>
    <VCard>
      <!-- Search and Filter Section -->
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
              // { title: 'Priority', value: 'priority' },
              { title: 'Received At', value: 'receiveAt' },
              // { title: 'Updated At', value: 'updatedAt' },
              { title: '', value: 'star' },
            ]"
            :items="filteredInbox"
            :items-per-page="10"
          >
            <template #item.receiveAt="{ item }">
              {{ new Date(item.receiveAt).toLocaleString() }}
            </template>
            <template #item.updatedAt="{ item }">
              {{ item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-' }}
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
