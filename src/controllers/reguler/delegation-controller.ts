import { type Delegator, type CreateDelegatorPayload, type UpdateDelegatorPayload } from '@/models/delegator/delegator'
import { type User } from '@/models/users/users'
import { onMounted, ref } from 'vue'

export function delegationController() {
  const delegationList = ref<Delegator[]>([])
  const usersList = ref<User[]>([])
  const selectedDelegation = ref<Delegator | null>(null)
  const isCreateDialogVisible = ref(false)
  const isUpdateDialogVisible = ref(false)
  const isDeleteDialogVisible = ref(false)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref('')

  const newDelegation = ref<CreateDelegatorPayload>({
    delegate_id: '',
    start_date: '',
    end_date: '',
  })

  const editDelegation = ref<UpdateDelegatorPayload>({
    delegate_id: '',
    start_date: '',
    end_date: '',
  })

  const headers = [
    { title: 'Delegate', key: 'delegate', sortable: false },
    { title: 'Start Date', key: 'start_date', sortable: true },
    { title: 'End Date', key: 'end_date', sortable: true },
    { title: 'Status', key: 'is_active', sortable: false },
    { title: 'Actions', key: 'actions', sortable: false },
  ]

  const fetchDelegations = async () => {
    isLoading.value = true
    try {
      const res = await useApi('/delegator', { method: 'GET' })
      const value = res.data.value as { data: Delegator[] }
      delegationList.value = value?.data ?? []
    } catch (e) {
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await useApi('/user/except-current', { method: 'GET' })
      const value = res.data.value as { data: User[] }
      usersList.value = (value?.data ?? []).filter((u) => u.role !== 99)
    } catch (e) {
      console.error(e)
    }
  }

  const openCreateDialog = () => {
    newDelegation.value = { delegate_id: '', start_date: '', end_date: '' }
    errorMessage.value = ''
    isCreateDialogVisible.value = true
  }

  const openEditDialog = (item: Delegator) => {
    selectedDelegation.value = { ...item }
    editDelegation.value = {
      delegate_id: item.delegate?.id ?? '',
      start_date: item.start_date ? item.start_date.substring(0, 10) : '',
      end_date: item.end_date ? item.end_date.substring(0, 10) : '',
    }
    errorMessage.value = ''
    isUpdateDialogVisible.value = true
  }

  const openDeleteDialog = (item: Delegator) => {
    selectedDelegation.value = { ...item }
    isDeleteDialogVisible.value = true
  }

  const submitCreate = async (refVForm: any) => {
    const { valid } = await refVForm.validate()
    if (!valid) return

    isSubmitting.value = true
    errorMessage.value = ''
    try {
      const { data, error } = await useApi('/delegator', {
        method: 'POST',
        body: JSON.stringify(newDelegation.value),
        headers: { 'Content-Type': 'application/json' },
      })

      if (error.value) {
        const errData = error.value as any
        errorMessage.value = errData?.data?.message ?? 'Failed to create delegation.'
        return
      }

      isCreateDialogVisible.value = false
      await fetchDelegations()
    } catch (e) {
      errorMessage.value = 'An unexpected error occurred.'
      console.error(e)
    } finally {
      isSubmitting.value = false
    }
  }

  const submitUpdate = async (refVForm: any) => {
    if (!selectedDelegation.value) return
    const { valid } = await refVForm.validate()
    if (!valid) return

    isSubmitting.value = true
    errorMessage.value = ''
    try {
      const { data, error } = await useApi(`/delegator/${selectedDelegation.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(editDelegation.value),
        headers: { 'Content-Type': 'application/json' },
      })

      if (error.value) {
        const errData = error.value as any
        errorMessage.value = errData?.data?.message ?? 'Failed to update delegation.'
        return
      }

      isUpdateDialogVisible.value = false
      await fetchDelegations()
    } catch (e) {
      errorMessage.value = 'An unexpected error occurred.'
      console.error(e)
    } finally {
      isSubmitting.value = false
    }
  }

  const confirmDelete = async () => {
    if (!selectedDelegation.value) return

    isSubmitting.value = true
    try {
      const { error } = await useApi(`/delegator/${selectedDelegation.value.id}`, {
        method: 'DELETE',
      })

      if (error.value) {
        console.error(error.value)
        return
      }

      isDeleteDialogVisible.value = false
      await fetchDelegations()
    } catch (e) {
      console.error(e)
    } finally {
      isSubmitting.value = false
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const userItems = () =>
    usersList.value.map((u) => ({
      title: `${u.firstName} ${u.lastName} (${u.email})`,
      value: u.id,
    }))

  onMounted(() => {
    fetchDelegations()
    fetchUsers()
  })

  return {
    delegationList,
    usersList,
    selectedDelegation,
    isCreateDialogVisible,
    isUpdateDialogVisible,
    isDeleteDialogVisible,
    isLoading,
    isSubmitting,
    errorMessage,
    newDelegation,
    editDelegation,
    headers,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    submitCreate,
    submitUpdate,
    confirmDelete,
    formatDate,
    userItems,
    fetchDelegations,
  }
}
