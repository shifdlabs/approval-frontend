<script setup lang="ts">
import { FormatCellType } from '@/enums/format.cell.type';
import { FormatComponent } from '@/models/numbering-format/format-component';
import { NumberingGroup } from '@/models/numbering-group/numbering-group';
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

const { t } = useI18n()

const separatorTypes = ref([
    { id: '/', name: 'Slash (/)', },
    { id: '-', name: 'Dash (-)' },
    { id: '_', name: 'Underscore (_)' },
    { id: '.', name: 'Dot (.)' },
]);

const incrementedByGroup = computed(() => [
  { id: true, name: t('common.yes') },
  { id: false, name: t('common.no') },
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
      return staticCount < 2;
    }

    return !selectedKeys.includes(item.key);
  });
});

function removeCellFormat(index: number) {
  cellFormats.value.splice(index, 1);
}

watch(
  () => props.isDialogVisible,
  (isVisible) => {
    if (isVisible) {
      formData.value = { ...initialFormData };
      isAllInputtedValid.value = true;
      cellFormats.value = []
      console.log('Dialog opened, resetting formData');
    }
  }
);

const refMainForm = ref<VForm>();
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
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (!isValid) return

    const type = cellTypes.value.find((item) => item.key === cellFormatKey.value)
    cellFormats.value.push({
      name: type?.name || '',
      key: type?.key || '',
      short: type?.short || '',
      originalValue: type?.name == FormatCellType.Static.name ? cellFormatValue.value : type?.description || '',
      description: type?.description || '',
    })

    isInputFormatCellFormActive.value = false
  })
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
      isAllInputtedValid.value = false
    }
  } catch (e) {
    console.log(e)
    isAllInputtedValid.value = false
  }
}

const onFormSubmit = async () => {
  refMainForm.value?.validate().then(({ valid: isValid }) => {
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
    :width="$vuetify.display.smAndDown ? 'auto' : 660"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <VCard class="bm-dialog">
      <div class="bmd-head">
        <div class="bmd-mark">
          <VIcon icon="tabler-file-plus" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>{{ $t('publicationFormat.createTitle') }}</h2>
          <p>{{ $t('publicationFormat.createSubtitle') }}</p>
        </div>
        <button class="bmd-close" type="button" @click="dialogModelValueUpdate(false)">
          <VIcon icon="tabler-x" size="18" />
        </button>
      </div>

      <div class="bmd-body">
        <VForm ref="refMainForm">
          <VAlert v-if="!isAllInputtedValid" color="error" class="mb-3">
            {{ $t('publicationFormat.alertFill') }}
          </VAlert>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.name"
                :label="$t('publicationFormat.formatName')"
                :placeholder="$t('publicationFormat.formatNamePh')"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model="formData.groupId"
                :label="$t('publicationFormat.groupFormat')"
                :placeholder="$t('publicationFormat.selectGroup')"
                :items="groupFormat"
                item-value="id"
                item-title="name"
                clearable
                :rules="[requiredValidator]"
              >
                <template #item="{ item, props: itemProps }">
                  <v-list-item v-bind="itemProps">
                    <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
                <template #selection="{ item }">
                  <span>{{ item.raw.name }}</span>
                </template>
              </AppSelect>
            </VCol>
            <VCol cols="12" sm="6">
              <AppSelect
                v-model="formData.separator"
                :label="$t('publicationFormat.separator')"
                :placeholder="$t('publicationFormat.selectSeparator')"
                :items="separatorTypes"
                item-title="name"
                item-value="id"
                clearable
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="12" sm="6">
              <AppSelect
                v-model="formData.incrementByGroup"
                :label="$t('publicationFormat.incrementByGroup')"
                :placeholder="$t('publicationFormat.selectIncrement')"
                :items="incrementedByGroup"
                item-title="name"
                item-value="id"
                clearable
              />
            </VCol>
          </VRow>
        </VForm>

        <!-- Cell Builder Header -->
        <div class="d-flex align-center mt-4 mb-2">
          <div class="d-flex flex-column">
            <div class="text-subtitle-1">{{ $t('publicationFormat.builderTitle') }}</div>
            <div class="text-subtitle-2">{{ $t('publicationFormat.builderNote') }}</div>
          </div>
          <VSpacer />
          <VBtn
            prepend-icon="tabler-code-plus"
            variant="tonal"
            color="primary"
            size="small"
            @click="onInputFormatCellClicked"
            :disabled="cellFormats.length == 5"
          >
            {{ $t('publicationFormat.addCell') }}
          </VBtn>
        </div>

        <!-- Cell List -->
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
              <VBtn color="error" icon="tabler-trash-x" rounded @click="removeCellFormat(index)" size="small" />
            </div>
          </div>
        </div>
      </div>

      <div class="bmd-foot">
        <button class="bmd-btn bmd-btn-ghost" type="button" @click="onFormReset">
          {{ $t('publicationFormat.close') }}
        </button>
        <button class="bmd-btn bmd-btn-primary" type="button" @click="onFormSubmit">
          {{ $t('publicationFormat.createFormat') }}
        </button>
      </div>
    </VCard>
  </VDialog>

  <!-- Cell Builder Sub-dialog -->
  <VDialog v-model="isInputFormatCellFormActive" max-width="500">
    <VCard class="bm-dialog">
      <div class="bmd-head">
        <div class="bmd-mark">
          <VIcon icon="tabler-code-plus" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>{{ $t('publicationFormat.cellBuilderTitle') }}</h2>
        </div>
        <button class="bmd-close" type="button" @click="isInputFormatCellFormActive = false">
          <VIcon icon="tabler-x" size="18" />
        </button>
      </div>

      <VForm ref="refVForm" v-model="isCellFromValid">
        <div class="bmd-body">
          <AppSelect
            v-model="cellFormatKey"
            :label="$t('publicationFormat.groupFormat')"
            :placeholder="$t('publicationFormat.selectGroup')"
            :items="filteredCellType"
            item-title="name"
            item-value="key"
            :rules="[requiredValidator]"
            clearable
          />
          <div class="mt-4">
            <AppTextField
              v-model="cellFormatValue"
              :label="$t('publicationFormat.preferenceValue')"
              :placeholder="$t('publicationFormat.preferenceValuePh')"
              :disabled="cellFormatKey !== FormatCellType.Static.key"
              :rules="cellFormatKey === FormatCellType.Static.key ? [requiredValidator] : []"
            />
          </div>
        </div>

        <div class="bmd-foot">
          <button class="bmd-btn bmd-btn-ghost" type="button" @click="isInputFormatCellFormActive = false">
            {{ $t('common.cancel') }}
          </button>
          <button class="bmd-btn bmd-btn-primary" type="button" @click="onCellFormSubmitted">
            {{ $t('common.add') }}
          </button>
        </div>
      </VForm>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.format-cell-list {
  border: 1px solid var(--bm-line, #e9eaf4);
  border-radius: 10px;
  overflow: hidden;
}

.format-cell {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--bm-line, #e9eaf4);

  &:last-child {
    border-bottom: none;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__badge {
    width: 34px;
    height: 34px;
    background: var(--bm-navy-tint, #ecf1fb);
    color: var(--bm-navy, #3b5dc6);
    border-radius: 8px;
    font-weight: 700;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__text {
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-weight: 600;
    font-size: 14px;
    color: var(--bm-ink-strong, #1e2240);
  }

  &__subtitle {
    font-size: 12px;
    color: var(--bm-muted, #7e82a4);
  }

  &__actions {
    display: flex;
    gap: 4px;
  }
}
</style>
