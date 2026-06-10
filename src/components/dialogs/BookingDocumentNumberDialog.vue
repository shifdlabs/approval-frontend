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

const selectedGroupName = ref<string | null>(null);
const selectedFormatId = ref<string | null>(null);

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
  }
}

const formatsForSelectedGroup = computed<Format[]>(() => {
  const group = props.data.find(g => g.group === selectedGroupName.value);
  return group ? group.formats : [];
});

const isReady = computed(() => !!selectedGroupName.value && !!selectedFormatId.value);

const { t } = useI18n()
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 580"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <VCard class="bm-dialog bk-dialog">
      <!-- Header -->
      <div class="bmd-head">
        <div class="bmd-mark">
          <!-- Reference icon: document/form card -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
            <rect x="3" y="4" width="18" height="16" rx="3"></rect>
            <path d="M3 9h18"></path>
            <path d="M8 14h3"></path>
            <path d="M15 14h1"></path>
          </svg>
        </div>
        <div class="bmd-titles">
          <h2>{{ t('booking.dialog.title') }}</h2>
          <p>{{ t('booking.dialog.subtitle') }}</p>
        </div>
        <button class="bmd-close" type="button" :aria-label="t('common.close')" @click="onFormReset">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
            <path d="M18 6 6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="bmd-body">
        <!-- Grup Format -->
        <div class="bk-field">
          <label class="bk-label">
            {{ t('booking.dialog.grupFormat') }}
            <span class="bk-req">*</span>
          </label>
          <AppSelect
            v-model="selectedGroupName"
            :placeholder="t('publicationFormat.selectGroup')"
            :items="props.data"
            item-value="group"
            item-title="group"
            clearable
            hide-details
          >
            <template #prepend-inner>
              <div class="bk-lead">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="17" height="17">
                  <path d="M3 7h18M3 12h18M3 17h12"></path>
                </svg>
              </div>
            </template>
          </AppSelect>
        </div>

        <!-- Nama Format -->
        <div class="bk-field">
          <label class="bk-label">
            {{ t('booking.dialog.namaFormat') }}
            <span class="bk-req">*</span>
          </label>
          <AppSelect
            v-model="selectedFormatId"
            :placeholder="t('publicationFormat.selectFormat')"
            :items="formatsForSelectedGroup"
            item-value="id"
            item-title="name"
            clearable
            :disabled="!selectedGroupName"
            hide-details
          >
            <template #prepend-inner>
              <div class="bk-lead">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="17" height="17">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <path d="M14 2v6h6"></path>
                </svg>
              </div>
            </template>
          </AppSelect>
          <div class="bk-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4M12 8h.01"></path>
            </svg>
            <span>{{ t('booking.dialog.hintNamaFormat') }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bmd-foot">
        <button class="bmd-btn bmd-btn-ghost" type="button" @click="onFormReset">
          {{ t('common.cancel') }}
        </button>
        <button
          class="bmd-btn bmd-btn-primary"
          type="button"
          :disabled="!isReady"
          @click="onFormSubmit"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="19" height="19">
            <path d="M5 12h14M13 6l6 6-6 6"></path>
          </svg>
          {{ t('booking.dialog.bookingBtn') }}
        </button>
      </div>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.bk-dialog {
  // override bmd-body gap for field spacing like reference
  :deep(.bmd-body) {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-bottom: 4px;
  }
}

.bk-field {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.bk-label {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--bm-ink-strong);
}

.bk-req {
  color: var(--bm-navy);
  margin-left: 2px;
}

.bk-lead {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 8px;
  background: var(--bm-navy-tint);
  color: var(--bm-navy);
  display: grid;
  place-items: center;
  margin-right: 4px;
}

.bk-hint {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 500;
  color: var(--bm-muted);

  svg {
    flex-shrink: 0;
    color: var(--bm-navy);
  }
}
</style>
