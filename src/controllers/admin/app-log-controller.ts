import { AppLog } from '@/models/app-log/app.log'
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
const filteredDate = ref<string | null>(null)
const filteredModule = ref<string | null>(null)
const filteredAction = ref<string | null>(null)
const searchQuery = ref('')

const moduleOptions = computed(() => {
  const modules = [...new Set(appLogs.value.map(l => l.module).filter(Boolean))]
  return modules.sort()
})

const actionOptions = computed(() => {
  const actions = [...new Set(appLogs.value.map(l => l.action).filter(Boolean))]
  return actions.sort()
})

const filteredDocument = computed(() => {
  return appLogs.value.filter(log => {
    const userName = (log.userName ?? '').toLowerCase()
    const nameMatch =
      !searchQuery.value ||
      userName.includes(searchQuery.value.toLowerCase())

    const logDate = log.logDate ? log.logDate.split('T')[0] : ''
    const selectedDate = filteredDate.value ? filteredDate.value.split('T')[0] : null
    const dateMatch = !selectedDate || logDate === selectedDate

    const moduleMatch = !filteredModule.value || log.module === filteredModule.value
    const actionMatch = !filteredAction.value || log.action === filteredAction.value

    return nameMatch && dateMatch && moduleMatch && actionMatch
  })
})

const headers = [
  { title: 'User Name', key: 'userName' },
  { title: 'Action Type', key: 'actionType' },
  { title: 'Module', key: 'module' },
  { title: 'LogDate', key: 'logDate' },
  { title: '', key: 'action' },
]

// ====> Filter Content
const onTapFilter = () => {
  filteredDate.value = null
  filteredModule.value = null
  filteredAction.value = null
  isFilterSectionVisible.value = !isFilterSectionVisible.value
}

// ==========> Initialize Index Data
const fetchLogs = async () => {
  try {
    const res = await useApi('/userlogs', { method: 'GET' })
    const value = res.data.value as { data: any }
    appLogs.value = value.data.map((item: any) => mapLog(item))
  } catch (e) {
    console.log(e)
  }
}

const exportLogs = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081/api'
    const response = await fetch(`${baseUrl}/userlogs/export`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${useCookie('accessToken').value}`,
      },
    })
    if (!response.ok) return
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'activity-log.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    console.log(e)
  }
}

function formatDate(input: string): string {
  if (!input) return ''
  const date = new Date(input)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds}`
}

const onRowClicked = (item: AppLog) => {
  selectedLog.value = item
  isDetailLogDialogVisible.value = true
}

const mapLog = (raw: any): AppLog => ({
  userId: raw.userId ?? raw.user_id ?? '',
  userName: raw.userName ?? raw.user_name ?? '',
  action: raw.action ?? '',
  module: raw.module ?? '',
  log: raw.log ?? null,
  logDate: raw.logDate ?? raw.log_date ?? '',
})

return {
    appLogs,
    selectedLog,
    isDetailLogDialogVisible,
    isFilterSectionVisible,
    filteredDocument,
    searchQuery,
    filteredDate,
    filteredModule,
    filteredAction,
    moduleOptions,
    actionOptions,
    headers,
    onRowClicked,
    onTapFilter,
    exportLogs,
    formatDate,
}
}
