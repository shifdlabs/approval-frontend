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

const onFormSubmit = async () => {
  if (selectedGroupName.value && selectedFormatId.value) {
    try {
      const { data, error } = await useApi('/document/number', {
        method: 'POST',
        body: JSON.stringify({
          numbering_format_id: selectedFormatId.value,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).json<{ success: boolean }>()

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
    console.error('Please select both group and format.')
  }
}

const formatsForSelectedGroup = computed<Format[]>(() => {
  const group = props.data.find(g => g.group === selectedGroupName.value);
  return group ? group.formats : [];
});

const { t } = useI18n()
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
          {{ t('booking.dialog.title') }}
        </h4>
        <VRow>
            <VCol cols="12">
                <AppSelect
                        v-model="selectedGroupName"
                        :label="t('publicationFormat.groupFormat')"
                        :placeholder="t('publicationFormat.selectGroup')"
                        :items="props.data"
                        item-value="group"
                        item-title="group"
                        clearable
                ></AppSelect>
            </VCol>
            <VCol cols="12">
                <AppSelect
                        v-model="selectedFormatId"
                        :label="t('publicationFormat.formatName')"
                        :placeholder="t('publicationFormat.selectFormat')"
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
            {{ t('common.cancel') }}
            </VBtn>
            <VBtn color="primary" @click="onFormSubmit">
            {{ t('booking.dialog.bookingBtn') }}
            </VBtn>
        </VCardText>
        </VCard>
    </VDialog>
</template>
