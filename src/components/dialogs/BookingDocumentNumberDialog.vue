<script setup lang="ts">
import { Format, GroupWithFormats } from '@/models/document-number/group.with.format';

interface Props {
  data: GroupWithFormats[];
  isDialogVisible: boolean;
}

interface Emit {
  (e: 'update:data', value: GroupWithFormats[]): void;
  (e: 'update:isDialogVisible', val: boolean): void;
  (e: 'update:isRefetchList', val: boolean): void;
}

const emit = defineEmits<Emit>();
const props = defineProps<Props>();

const selectedGroupName = ref<string | null>(null); // store selected group name
const selectedFormatId = ref<string | null>(null);  // store selected format id

const onFormReset = () => {
selectedGroupName.value = null
selectedFormatId.value = null
  emit('update:isDialogVisible', false);
};
const dialogModelValueUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val);
};

const {
  execute,
  error,
} = useApi('/document/number',
  {
    method: 'POST',
    body: JSON.stringify({
      numbering_format_id: selectedFormatId.value,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  },
  {
    immediate: false,
  }
)

const onFormSubmit = async () => {
  if (selectedGroupName.value && selectedFormatId.value) {
    try {
      await execute()

      if (!error.value) {
        emit('update:isRefetchList', true)
        onFormReset()
      } else {
        console.error('API Error:', error.value)
      }
    } catch (err) {
      console.error('Unexpected Exception:', err)
    }
  } else {
    // Handle validation error
    console.error('Please select both group and format.')
  }
}

const formatsForSelectedGroup = computed<Format[]>(() => {
  const group = props.data.find(g => g.group === selectedGroupName.value);
  return group ? group.formats : [];
});
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 700"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="onFormReset" />
    <VCard>
      <VCardText>
        <!-- 👉 Title -->
        <h4 class="text-h4 text-center mb-2">
          Create Publication Format
        </h4>
        <VRow>
            <VCol cols="12">
                <AppSelect
                        v-model="selectedGroupName"
                        label="Group of Format"
                        placeholder="Select Group Format"
                        :items="props.data"
                        item-value="group"
                        item-title="group"
                        clearable
                ></AppSelect>
            </VCol>
            <VCol cols="12">
                <AppSelect
                        v-model="selectedFormatId"
                        label="Format Name"
                        placeholder="Select Format Name"
                        :items="formatsForSelectedGroup"
                        item-value="id"
                        item-title="name"
                        clearable
                ></AppSelect>
            </VCol>
        </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end flex-wrap gap-3">
            <VBtn
            variant="outlined"
            color="primary"
            @click="dialogModelValueUpdate(false)"
            >
            Cancel
            </VBtn>
            <VBtn color="primary" @click="onFormSubmit">
            Booking Number
            </VBtn>
        </VCardText>
        </VCard>
    </VDialog>
</template>
