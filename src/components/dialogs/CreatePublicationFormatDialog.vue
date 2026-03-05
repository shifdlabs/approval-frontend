<script setup lang="ts">
import { FormatCellType } from '@/enums/format.cell.type';
import { FormatComponent } from '@/models/numbering-format/format-component';
import { NumberingGroup } from '@/models/numbering-group/numbering-group';
import { ref, watch } from 'vue';
import { VForm } from 'vuetify/components';

interface Props {
  groupFormat: NumberingGroup[];
  isDialogVisible: boolean;
}

interface Emit {
  (e: 'update:groupFormat', value: NumberingGroup[]): void;
  (e: 'update:isDialogVisible', val: boolean): void;
  (e: 'update:isRefetchList', val: boolean): void;
}

const emit = defineEmits<Emit>();
const props = defineProps<Props>();

const separatorTypes = ref([
    { id: '/', name: 'Slash (/)', },
    { id: '-', name: 'Dash (-)' },
    { id: '_', name: 'Underscore (_)' },
    { id: '.', name: 'Dot (.)' },
]);

const incrementedByGroup = ref([
  { id: true, name: 'Yes' },
  { id: false, name: 'No' },
]);

const initialFormData = {
  name: '',
  groupId: '',
  incrementByGroup: false,
  separator: '',
};

const cellFormats = ref<FormatComponent[]>([
]);

const cellTypes = ref<FormatComponent[]>([
  {
    short: FormatCellType.Number.short,
    name: FormatCellType.Number.name,
    key: FormatCellType.Number.key,
    originalValue: '',
    description: FormatCellType.Number.description,
  },
  {
    short: FormatCellType.Static.short,
    name: FormatCellType.Static.name,
    key: FormatCellType.Static.key,
    originalValue: '',
    description: FormatCellType.Static.description,
  },
  {
    short: FormatCellType.MonthNumber.short,
    name: FormatCellType.MonthNumber.name,
    key: FormatCellType.MonthNumber.key,
    originalValue: '',
    description: FormatCellType.MonthNumber.description,
  },
  {
    short: FormatCellType.MonthRoman.short,
    name: FormatCellType.MonthRoman.name,
    key: FormatCellType.MonthRoman.key,
    originalValue: '',
    description: FormatCellType.MonthRoman.description,
  },
  {
    short: FormatCellType.Year.short,
    name: FormatCellType.Year.name,
    key: FormatCellType.Year.key,
    originalValue: '',
    description: FormatCellType.Year.description,
  },
])

const cellFormatKey = ref('');
const cellFormatValue = ref('');

const formData = ref({ ...initialFormData });
const isCellFromValid = ref(false);

const filteredCellType = computed(() => {
  const selectedKeys = cellFormats.value.map(format => format.key);

  const staticCount = cellFormats.value.filter(f => f.key === FormatCellType.Static.key).length;

  const hasMonthType =
    selectedKeys.includes(FormatCellType.MonthNumber.key) ||
    selectedKeys.includes(FormatCellType.MonthRoman.key);

  return cellTypes.value.filter(item => {
    if (
      hasMonthType &&
      (item.key === FormatCellType.MonthNumber.key || item.key === FormatCellType.MonthRoman.key)
    ) {
      return false;
    }

    if (item.key === FormatCellType.Static.key) {
      // allow up to 2 Static
      return staticCount < 2;
    }

    // for other types: remove if already selected
    return !selectedKeys.includes(item.key);
  });
});

function removeCellFormat(index: number) {
  cellFormats.value.splice(index, 1);
}


// Watch the specific prop isDialogVisible
watch(
  () => props.isDialogVisible,
  (isVisible) => {
    if (isVisible) {
      // Reset formData every time the dialog becomes visible
      formData.value = { ...initialFormData };
      isAllInputtedValid.value = true;
      cellFormats.value = []
      console.log('Dialog opened, resetting formData');
    }
  }
);

const refVForm = ref<VForm>();
const isErrorUniqueEmail = ref(false);
const isAllInputtedValid = ref(true);
const isInputFormatCellFormActive = ref(false);

const onInputFormatCellClicked = () => {
  cellFormatKey.value = '';
  cellFormatValue.value = '';

  isInputFormatCellFormActive.value = true
}

const onCellFormSubmitted = () => {
  console.log('Cell Format Form Value:', cellFormatKey.value);
  var type = cellTypes.value.find((item) => item.key === cellFormatKey.value);
  console.log('Selected Type:', type);
  cellFormats.value.push({
    name: type?.name || '',
    key: type?.key || '',
    short: type?.short || '',
    originalValue: type?.name == FormatCellType.Static.name ? cellFormatValue.value : type?.description || '',
    description: type?.description || '',
  })

  isInputFormatCellFormActive.value = false
}

const createNewPublicationFormat = async () => {
  try {
    const groupId = formData.value.groupId
    const formatName = formData.value.name
    const incrementByGroup = formData.value.incrementByGroup
    const separator = formData.value.separator
    const format = buildFormatPath()

    console.log('Creating new publication format with data:', {
      groupId,
      formatName,
      incrementByGroup,
      separator,
      format,
    })

    const { data } = await useApi('/numbering/format', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: groupId,
        name: formatName,
        format: format,
        separator: separator,
        increment_by_group: incrementByGroup,
      }),
    }).json<{ success: boolean }>()

    if (data.value?.success) {
      emit('update:isDialogVisible', false)
      emit('update:isRefetchList', true)
    } else {
      console.warn('Failed to create publication format or success not returned.')
      emit('update:isDialogVisible', false)
    }
  } catch (e) {
    console.log(e)
    emit('update:isDialogVisible', false)
  }
}

const onFormSubmit = async () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      isErrorUniqueEmail.value = false;
      isAllInputtedValid.value = true;
      createNewPublicationFormat();
    } else {
      isAllInputtedValid.value = false;
    }
  });
};

const onFormReset = () => {
  emit('update:isDialogVisible', false);
};

const dialogModelValueUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val);
};

function buildFormatPath(): string {
  return cellFormats.value
    .map(item => 
      item.key === FormatCellType.Static.key
        ? item.originalValue
        : item.key
    )
    .join(`${formData.value.separator}`);
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 700"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-sm-10 pa-2">
      <VCardText>
        <!-- 👉 Title -->
        <h4 class="text-h4 text-center mb-2">
          Create Publication Format
        </h4>

        <VRow>
                <!-- 👉 First Name -->
                <VCol cols="12">
                  <AppTextField
                    v-model="formData.name"
                    label="Format Name"
                    placeholder="Enter the format name"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="12">
                    <AppSelect
                        v-model="formData.groupId"
                        label="Group of Format"
                        placeholder="Select Group Format"
                        :items="groupFormat"
                        item-value="id"
                        item-title="name"
                        clearable
                    >
                    <template #item="{ item, props }">
                        <v-list-item v-bind="props">
                          <v-list-item-subtitle>
                            {{ item.raw.description }}
                          </v-list-item-subtitle>
                        </v-list-item>
                      </template>

                      <template #selection="{ item, index }">
                        <span>{{ item.raw.name }}</span>
                      </template>
                    </AppSelect>
                </VCol>

                <VCol cols="12" sm="6">
                    <AppSelect
                        v-model="formData.separator"
                        label="Separator Type"
                        placeholder="Select Separator"
                        :items="separatorTypes"
                        item-title="name"
                        item-value="id"
                        clearable
                    />
                </VCol>

                <VCol cols="12" sm="6">
                    <AppSelect
                        v-model="formData.incrementByGroup"
                        label="Increment By Group"
                        placeholder="Select Increment Option"
                        :items="incrementedByGroup"
                        item-title="name"
                        item-value="id"
                        clearable
                    />
                </VCol>
            </VRow>
        </VCardText>

        <VCardText>
            <div class="d-flex align-center">
          <!-- Left Column -->
          <div class="d-flex flex-column">
            <div class="text-subtitle-1">
              Format Builder
            </div>
            <div class="text-subtitle-2">
              (There should be a number cell & Maximum 5 Format Cells)
            </div>
          </div>

          <!-- Spacer in the middle -->
          <VSpacer />

          <!-- Right Button -->
          <VBtn prepend-icon="tabler-code-plus" @click="onInputFormatCellClicked" :disabled="cellFormats.length == 5">
            Add Format Cell
          </VBtn>
        </div>
      </VCardText>

      <VCardText>
        <div class="format-cell-list">
          <div
            class="format-cell"
            v-for="(cell, index) in cellFormats"
            :key="index"
          >
              <div class="format-cell__left">
                <div class="format-cell__badge">{{ cell.short }}</div>
                <div class="format-cell__text">
                  <div class="format-cell__title" v-if="cell.name == FormatCellType.Static.name">{{ cell.name }}: {{ cell.originalValue }}</div>
                  <div class="format-cell__title" v-else>{{ cell.name }}</div>
                  <div class="format-cell__subtitle" v-if="cell.name != FormatCellType.Static.name">{{ cell.originalValue }}</div>
                </div>
              </div>
              <div class="format-cell__actions">
                    <!-- <VBtn
                      icon="tabler-edit"
                      rounded
                    /> -->
                    <VBtn
                    color="error"
                      icon="tabler-trash-x"
                      rounded
                      @click="removeCellFormat(index)"
                    />
              </div>
          </div>
        </div>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="outlined"
          color="primary"
          @click="onFormReset"
        >
          Close
        </VBtn>
        <VBtn color="primary" @click="createNewPublicationFormat">
          Create Format
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VDialog
    v-model="isInputFormatCellFormActive"
    max-width="600"
  >

  <DialogCloseBtn @click="isInputFormatCellFormActive = !isInputFormatCellFormActive" />
  
  <VCard title="Format Cell Builder">
    <VForm ref="refVForm" v-model="isCellFromValid">
      <VCardText>
        <AppSelect
        v-model="cellFormatKey"
        label="Group of Format"
        placeholder="Select Group Format"
        :items="filteredCellType"
        item-title="name"
        item-value="key"
        :rules="[requiredValidator]"
        clearable
      ></AppSelect>
    </VCardText>

    <VCardText>
      <AppTextField
        v-model="cellFormatValue"
        label="Preference Value"
        placeholder="Input Your Preference Value"
        :disabled="cellFormatKey != FormatCellType.Static.key"
        :rules="[requiredValidator]"
      />
    </VCardText>
    </VForm>
    
    <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="isInputFormatCellFormActive = false"
        >
          Cancel
        </VBtn>
        <VBtn color="primary" @click="onCellFormSubmitted">
          Add
        </VBtn>
    </VCardText>
  </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.format-cell-list {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.format-cell {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;

  &:last-child {
    border-bottom: none;
  }

  &__left {
    display: flex;
    align-items: center;
  }

  &__badge {
    width: 32px;
    height: 32px;
    background: #ccc;
    border-radius: 4px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
  }

  &__text {
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-weight: 500;
    color: #333;
  }

  &__subtitle {
    font-size: 12px;
    color: #777;
  }

  &__actions {
    display: flex;
    gap: 4px;
  }

  .edit-btn {
    background: #7c3aed; // purple
    border: none;
    border-radius: 4px;
    color: white;
    padding: 4px 6px;
    cursor: pointer;
  }

  .delete-btn {
    background: #ef4444; // red
    border: none;
    border-radius: 4px;
    color: white;
    padding: 4px 6px;
    cursor: pointer;
  }
}
</style>
