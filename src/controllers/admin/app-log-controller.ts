import { AppLog } from '@/models/app-log/app.log'
import { Document } from '@/models/document/document'
import { computed, ref } from 'vue'

export function appLogController() {
    // ===> Initialization
onMounted(() => {
    fetchLogs()
})

const isDetailLogDialogVisible = ref(false)

const appLogs = ref<AppLog[]>([])
const selectedLog = ref<AppLog>()

const isFilterSectionVisible = ref(false)
const filteredDate = ref<string | null>(null);
const filteredDocument = computed(() => {
  return appLogs.value.filter(log => {
    const userId = log.userId.toLowerCase()
    const nameMatch =
      !searchQuery.value ||
      userId.includes(searchQuery.value.toLowerCase())

      // Extract the date part from log.logDate
    const logDate = log.logDate.split('T')[0];

    // Only try to split if filteredDate.value exists
    const selectedDate = filteredDate.value ? filteredDate.value.split('T')[0] : null;

    // Check if either no date is selected, or the log date matches the selected date
    const dateMatch = !selectedDate || logDate === selectedDate;
        // Both conditions must be true:
        return nameMatch && dateMatch;
      })
})

const headers = [
  { title: 'User ID', key: 'userId' },
  { title: 'Action Type', key: 'actionType' },
  { title: 'Module', key: 'module' },
  { title: 'LogDate', key: 'logDate' },
  { title: '', key: 'action' },
]

const searchQuery = ref('')

// ====> Filter Content
const onTapFilter = () => {
  filteredDate.value = null
  isFilterSectionVisible.value = !isFilterSectionVisible.value
}


// ==========> Initialize Index Data

const fetchLogs = async () => {
  try {
    const res = await useApi('/userlogs', {
      method: 'GET'
    })

    console.log(res.data.value)
    const value = res.data.value as { data: any };
    appLogs.value = value.data.map((document: any) => mapDocument(document));
  } catch (e) {
    console.log(e)
  }
}

function formatDate(input: string): string {
  const date = new Date(input);

  // Get each date component and pad with zero if needed
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  // Construct the formatted date string
  return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds}`;
}

const onRowClicked = (item: AppLog) => {
  console.log(`Tess ${item}`)
  selectedLog.value = item
  isDetailLogDialogVisible.value = true
}

// ===> User Data Response Mapper

// const mapPosition = (rawPosition: any): Position => {
//   return {
//     id: rawPosition.ID,     // mapping 'ID' from response to 'id'
//     name: rawPosition.Name  // mapping 'Name' from response to 'name'
//   };
// };

const mapDocument = (rawDocuments: any): Document => {
  return {
    ...rawDocuments,
    // override the position property with our mapped version
    // position: mapPosition(rawUser.position)
  };
};

return {
    appLogs,
    selectedLog,
    isDetailLogDialogVisible,
    isFilterSectionVisible,
    filteredDocument,
    searchQuery,
    filteredDate,
    headers,
    onRowClicked,
    onTapFilter
}
}
