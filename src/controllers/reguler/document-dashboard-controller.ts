import { ActivityResponse } from '@/models/document/activity.response'
import { DashboardSummaryResponse, DeadlineItemResponse, RecentDocumentResponse } from '@/models/document/dashboard'
import { ref } from 'vue'


export const useDashboardController = () => {
  const summary = ref<DashboardSummaryResponse | null>(null)
    const isLoading = ref(true)
    const deadlines = ref<DeadlineItemResponse[]>([])
    const activities = ref<ActivityResponse[]>([])
    const recentDocuments = ref<RecentDocumentResponse[]>([])

  // Mapping dari nilai tab di statTabs → period yang diterima API
  const periodMap: Record<string, string> = {
    semua:  'all',
    hari:   'today',
    minggu: 'week',
    bulan:  'month',
  }

    const fetchSummary = async (tabValue: string) => {
    isLoading.value = true
    const period = periodMap[tabValue] ?? 'all'

    const { execute, data, error } = useApi(
        `document/dashboard?period=${period}`,
        { method: 'GET' },
        { immediate: false }
    )

    await execute()

    if (error.value) {
        console.error('Failed to fetch dashboard summary:', error.value)
        isLoading.value = false // hanya false jika error
        return
    }

    const res = data.value as any
    if (res?.data) {
        summary.value = res.data as DashboardSummaryResponse
    }

    }

    const fetchDeadlines = async () => {
        const { execute, data, error } = useApi(
            'document/dashboard/deadlines',
            { method: 'GET' },
            { immediate: false }
        )

        await execute()

        if (error.value) return

        const res = data.value as any
        if (res?.data) {
            deadlines.value = res.data
        }
    }

    const fetchActivities = async () => {
        const { execute, data, error } = useApi(
            'document/dashboard/activities',
            { method: 'GET' },
            { immediate: false }
        )

        await execute()

        if (error.value) return

        const res = data.value as any
        console.log('Activities API response:', res) // Debug log
        if (res?.data) {
            activities.value = res.data
        }
    }

    const fetchRecentDocuments = async (docType: number = 0) => {
        const { execute, data, error } = useApi(
            `document/dashboard/recent?type=${docType}`,
            { method: 'GET' },
            { immediate: false }
        )

        await execute()

        if (error.value) return

        const res = data.value as any
        if (res?.data) {
            recentDocuments.value = res.data
        }
    }
    

    return {
        summary, deadlines, activities, recentDocuments,
        isLoading, fetchSummary, fetchDeadlines, fetchActivities, fetchRecentDocuments
    }
}
