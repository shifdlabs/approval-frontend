<script setup lang="ts">
import { NumberingFormat } from '@/models/numbering-format/numbering-format'
import { NumberingGroup } from '@/models/numbering-group/numbering-group'

const searchQuery = ref('')
const newGroupData = ref({
  name: '',
  description: ''
})

const groupFormats = ref<NumberingGroup[]>([])

const isSuccessCreateGroupFormat = ref(false)
const isCreateGroupFormatDialogVisible = ref(false)
const isCreateFormatDialogVisible = ref(false)
const numberingFormats = ref<NumberingFormat[]>([])
const isFormValid = ref(false);
const isRefetchList = ref(false)
const formRules = {
  required: (value: string) => !!value || 'Required.',
};

const fetchNumberingGroups = async() => {
    try {
          const res = await useApi('/numbering/group', {
            method: 'GET'
          })
      
          const value = res.data.value as { data: any };
          groupFormats.value = value.data.map((numberingGroup: any) => mapNumberingGroup(numberingGroup));
          console.log(groupFormats.value)
        } catch (e) {
          console.log(e)
        }
}

const fetchNumberingFormats = async () => {
        try {
          const res = await useApi('/numbering/format', {
            method: 'GET'
          })
      
          console.log(res.data.value)
          const value = res.data.value as { data: any };
          numberingFormats.value = value.data.map((numberingFormat: any) => mapNumberingFormat(numberingFormat));
          console.log(numberingFormats.value)
        } catch (e) {
          console.log(e)
        }
      }

      const mapNumberingFormat = (rawNumberingFormats: any): NumberingFormat => {
        return {
          ...rawNumberingFormats,
        };
      };

      const mapNumberingGroup = (rawNumberingGroup: any): NumberingGroup => {
        return {
          ...rawNumberingGroup,
        };
      };

      onMounted(() => {
        fetchNumberingFormats()
        fetchNumberingGroups()
      })

      const refetchList = async () => {
        if (isRefetchList) {
          fetchNumberingFormats()
          fetchNumberingGroups()
        }
      }

const submitNewGroupForm = async () => {
  if (isFormValid.value) {
    try {
      const { data, error } = await useApi('/numbering/group',
        {
          method: 'POST',
          body: JSON.stringify({
            name: newGroupData.value.name,
            description: newGroupData.value.description,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // opsional jika diperlukan
        }
      )

      if (error.value) {
        console.error('API Error:', error.value)
        isSuccessCreateGroupFormat.value = false
        return
      }

      if (data.value && (data.value as any).success) {
        isSuccessCreateGroupFormat.value = true
        setTimeout(() => {
          isSuccessCreateGroupFormat.value = false
          isCreateGroupFormatDialogVisible.value = false
          fetchNumberingFormats()
          fetchNumberingGroups()
        }, 1000)
      }
    } catch (e) {
      isSuccessCreateGroupFormat.value = false
      console.error('Unexpected error:', e)
    }
  }
}

const headers = [
  { title: 'FORMAT NAME', key: 'name' },
  { title: 'FORMAT', key: 'format' },
  { title: 'INCREMENTED BY GROUP', key: 'incrementedByGroup' },
  { title: 'SEPARATOR', key: 'separator' },
  { title: 'CREATED AT', key: 'createdAt' },
]

const groupBy = [{ key: 'group' }]

const incrementedStateColor = (status: boolean) => {
  if (status == true) {
    return { color: 'success', text: 'YES' }
  } else {
    return { color: 'error', text: 'NO' }
  }
}

const getIcon = (props: Record<string, unknown>) => props.icon as any
</script>

<template>
    <div>
        <VCard>
      <VCardText>
        <div class="d-flex justify-end flex-wrap gap-y-4 gap-x-6">
          <div class="d-flex align-center flex-wrap">
            <AppTextField
              v-model="searchQuery"
              placeholder="Search Number Formats"
              style="inline-size: 200px; width: 500px;"
              class="me-3"
            />
          </div>
 
          <VSpacer />
          <div class="d-flex align-center flex-wrap gap-4">
            <VBtn prepend-icon="tabler-affiliate" @click="isCreateGroupFormatDialogVisible = true">
              Create Group of Format
            </VBtn>
 
            <VBtn prepend-icon="tabler-code-asterisk" @click="isCreateFormatDialogVisible = true">
              Add New Format
            </VBtn>
          </div>
        </div>
      </VCardText>

      <VDivider />

      <VDataTable
        :headers="headers"
        :items="numberingFormats"
        :items-per-page="10"
        :group-by="groupBy"
      >
    <!-- full name -->
    <template #item.name="{ item }">
      <span class="d-block font-weight-medium text-high-emphasis text-truncate">{{ item.name }}</span>
    </template>
    
    <template #item.incrementedByGroup="{ item }">
      <VChip
        v-if="item.id != null"
        :color="incrementedStateColor(item.incrementedByGroup).color"
        class="font-weight-medium"
      >
        {{ incrementedStateColor(item.incrementedByGroup).text }}
      </VChip>
    </template>

    <template #item.createdAt="{ item }">
      <span v-if="item.createdAt">
        {{ new Date(item.createdAt).toLocaleString() }}
      </span>
    </template>
    
    <!-- <template #item.group="{ item }">
      {{ item.group }}
    </template> -->

    <template #data-table-group="{ props, item, count }">
      <td>
        <VBtn
          v-bind="props"
          variant="text"
          density="comfortable"
        >
          <VIcon
            class="flip-in-rtl"
            :icon="getIcon(props)"
          />
        </VBtn>

        <span>{{ item.value }}</span>
        <span v-if="item.items[0].key != null">({{ count }})</span>
        <span v-else>(0)</span>
      </td>
    </template>
  </VDataTable>
    </VCard>
    </div>

    <CreatePublicationFormatDialog
      v-model:group-format="groupFormats"
      v-model:is-dialog-visible="isCreateFormatDialogVisible"
      v-model:is-refetch-list="isRefetchList"
      @update:is-refetch-list="refetchList"
    />

    <VDialog 
      v-model="isCreateGroupFormatDialogVisible" 
      persistent 
      class="v-dialog-sm"
    >
    <VCard title="Create Group Format">      
      <VCardText>
        <VAlert
          v-if="isSuccessCreateGroupFormat"
          density="default"
          color="success"
          variant="tonal"
        >
          Successfully created '{{ newGroupData.name }}' group format.
        </VAlert>
        <VForm ref="form" v-model="isFormValid">
          <VCol cols="12">
            <VTextField
              v-model="newGroupData.name"
              label="Group Name"
              :rules="[formRules.required]"
              required
            />
          </VCol>

          <VCol cols="12">
            <VTextarea
              v-model="newGroupData.description"
              label="Description"
              rows="2"
              placeholder="Describe about this group format"
            />
          </VCol>
        </VForm>
      </VCardText>
      
      <VCardText class="d-flex justify-end gap-3 flex-wrap">
        <VBtn color="primary" variant="outlined" @click="isCreateGroupFormatDialogVisible = false">
          Cancel
        </VBtn>
        <VBtn color="primary" :disabled="!isFormValid" @click="submitNewGroupForm">
          Create
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
  </template>
  