import { computed, onMounted, ref } from 'vue';
export function historiesController() {

const historiesList = ref([
  { no: 1, subject: 'Classical Latin literature from', user: 'Jordan Stevenson', action: 'Approved', description: 'Good Job!', updatedAt: '2025-01-25T02:30:00', type: 'Type 1', priority: 'High', status: 'Approved' },
  { no: 2, subject: 'Lorem Ipsum is simply', user: 'lamberjack@test.com', action: 'Approved', description: 'Great!', updatedAt: '2025-01-25T02:30:00', type: 'Type 2', priority: 'Medium', status: 'Approved' },
  { no: 3, subject: 'The cites of the word in classical', user: 'robinson@test.com', action: 'Rejected', description: 'Please fix the subject', updatedAt: '2025-01-25T02:30:00', type: 'Type 3', priority: 'Low', status: 'Rejected' },
  { no: 4, subject: 'This book is a treatise on the', user: 'lewishamilton@test.com', action: 'Rejected', description: 'Please fix the body', updatedAt: '2025-01-25T02:30:00', type: 'Type 1', priority: 'High', status: 'Rejected' },
  { no: 5, subject: 'Lorem Ipsum is simply', user: 'richrich@test.com', action: 'Approved', description: 'Nice', updatedAt: '2025-01-25T02:30:00', type: 'Type 2', priority: 'Medium', status: 'Approved' },
  { no: 6, subject: 'This book is a treatise on the', user: 'steve_jhon@test.com', action: 'Approved', description: 'Looking Forward it done!', updatedAt: '2025-01-25T02:30:00', type: 'Type 3', priority: 'Low', status: 'Approved' },
  { no: 7, subject: 'Lorem Ipsum is simply', user: 'betterny@test.com', action: 'Approved', description: 'Thank you', updatedAt: '2025-01-25T02:30:00', type: 'Type 1', priority: 'High', status: 'Approved' },
  { no: 8, subject: 'This book is a treatise on the', user: 'jeff@test.com', action: 'Approved', description: 'Thank you so much!', updatedAt: '2025-01-25T02:30:00', type: 'Type 2', priority: 'Medium', status: 'Approved' },
]);
const isRefetchList = ref(false);
const selectedHistory = ref(null);
const searchQuery = ref('');
const filterType = ref<string | null>('');
const filterPriority = ref<string | null>('');
const filterStatus = ref<string | null>('');
const isFilterSectionVisible = ref(false);
const selected = ref([]); // Add this line

const headers = [
  { title: 'NO', key: 'no' },
  { title: 'SUBJECT', key: 'subject' },
  { title: 'USER', key: 'user' },
  { title: 'ACTION', key: 'action' },
  { title: 'DESCRIPTION', key: 'description' },
  { title: 'UPDATED AT', key: 'updatedAt' },
];

const applyFilters = () => {
  // Implement filter logic here
};

const filteredHistories = computed(() => {
  return historiesList.value.filter(history => {
    const subjectMatch = !searchQuery.value || history.subject.toLowerCase().includes(searchQuery.value.toLowerCase());
    const typeMatch = !filterType.value || history.type === filterType.value;
    const priorityMatch = !filterPriority.value || history.priority === filterPriority.value;
    const statusMatch = !filterStatus.value || history.status === filterStatus.value;
    return subjectMatch && typeMatch && priorityMatch && statusMatch;
  });
});

const onTapFilter = () => {
  filterType.value = null;
  filterPriority.value = null;
  filterStatus.value = null;
  isFilterSectionVisible.value = !isFilterSectionVisible.value;
};

onMounted(() => {
  // Fetch data if needed
});

return {
    historiesList,
    filteredHistories,
    isRefetchList,
    selectedHistory,
    searchQuery,
    filterType,
    filterPriority,
    filterStatus,
    isFilterSectionVisible,
    selected,
    headers,
    applyFilters,
    onTapFilter
}
}
