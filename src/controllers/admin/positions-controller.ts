import { Position } from '@/models/positions/position';
import { computed, onMounted, ref } from 'vue';
export function positionsController() {
    const positionsList = ref<Position[]>([])
const filteredPositionsList = ref<Position[]>([])
const isRefetchList = ref(false)
const selectedPosition = ref<Position | null>(null)
const searchQuery = ref('')
const selected = ref<Position[]>([]) // Add this line

let confirmationDialogData = ref({
  title: '',
  body: '',
  buttonTitle: '',
  type: 0
})

// ===> Dialog States
const isCreatePositionDialogVisible = ref(false)
const isConfirmationDialogVisible = ref(false)
const isUpdatePositionDialogVisible = ref(false)

// ===> Alert States
const isAlertVisible = ref(false)
const alertMessage = ref('')

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'NAME', key: 'name' },
  { title: 'ACTION', key: 'actions' },
]

const editItem = (item: Position) => {
  selectedPosition.value = { ...item }
  isUpdatePositionDialogVisible.value = true
}

const showDeletePositionDialog = (item: Position) => {
  confirmationDialogData.value = ({
    title: `Are you sure want to delete position ${ item.name }?`,
    body: 'Once you have deleted all position data cannot be recovered back.',
    buttonTitle: 'Delete',
    type: 1
  })

  selectedPosition.value = item
  isConfirmationDialogVisible.value = true
}

const deleteItem = async () => {
  try {
    const { error } = await useApi(`/position/${selectedPosition.value?.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (error.value) {
      console.error(error.value)
      return
    }

    const index = positionsList.value.findIndex(
      (position) => position.id === selectedPosition.value?.id
    )
    if (index !== -1) {
      positionsList.value.splice(index, 1)
    }

    isConfirmationDialogVisible.value = false

  } catch (e) {
    console.error(e)
  }
}

// ==========> Initialize Index Data

const fetchPositions = async () => {
  try {
    const res = await useApi('/position', {
      method: 'GET'
    })

    console.log(res.data.value)
    const value = res.data.value as { data: any }
    positionsList.value = JSON.parse(JSON.stringify(value.data))
    filteredPositionsList.value = positionsList.value
  } catch (e) {
    console.log(e)
  }
}

const applyFilters = () => {
  filteredPositionsList.value = positionsList.value.filter(position =>
    position.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
}

onMounted(() => {
  fetchPositions()
})

// ===> Add New Position Logic
const newPosition = ref<Position>({ name: '' });
const isFormValid = ref(false);
const formRules = {
  required: (value: string) => !!value || 'Required.',
};

const closeCreatePositionDialog = () => {
  isCreatePositionDialogVisible.value = false;
};

const submitNewPositionForm = async () => {
  if (!isFormValid.value) return

  try {
    const { error } = await useApi('/position', {
      method: 'POST',
      body: JSON.stringify(newPosition.value),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (error.value) {
      console.error(error.value)
      return
    }

    filteredPositionsList.value = positionsList.value
    closeCreatePositionDialog()
    fetchPositions()
  } catch (e) {
    console.error(e)
  }
}

// ===> Edit Position Logic
const submitEditPositionForm = async () => {
  if (isFormValid.value && selectedPosition.value) {
    try {
      const { error } = await useApi('/position', {
        method: 'PUT',
        body: JSON.stringify(selectedPosition.value),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error.value) {
        console.error(error.value)
        return
      }

      isUpdatePositionDialogVisible.value = false
      fetchPositions()
    } catch (e) {
      console.error(e)
    }
  }
}

// Computed property to safely access selectedPosition.name
const selectedPositionName = computed({
  get: () => selectedPosition.value?.name || '',
  set: (value) => {
    if (selectedPosition.value) {
      selectedPosition.value.name = value;
    }
  }
});

return {
    positionsList,
    filteredPositionsList,
    isRefetchList,
    selectedPosition,
    searchQuery,
    selected,
    confirmationDialogData,
    isCreatePositionDialogVisible,
    isConfirmationDialogVisible,
    isUpdatePositionDialogVisible,
    isAlertVisible,
    alertMessage,
    headers,
    editItem,
    showDeletePositionDialog,
    deleteItem,
    fetchPositions,
    applyFilters,
    newPosition,
    isFormValid,
    formRules,
    closeCreatePositionDialog,
    submitNewPositionForm,
    submitEditPositionForm,
    selectedPositionName
}
}
