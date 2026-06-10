<script setup lang="ts">
interface Props {
  confirmationQuestion: string
  isDialogVisible: boolean
  confirmTitle: string
  confirmMsg: string
  cancelTitle: string
  cancelMsg: string
}

interface Emit {
  (e: 'update:isDialogVisible', value: boolean): void
  (e: 'confirm', value: boolean): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const unsubscribed = ref(false)
const cancelled = ref(false)

const updateModelValue = (val: boolean) => {
  emit('update:isDialogVisible', val)
}

const onConfirmation = () => {
  emit('confirm', true)
  updateModelValue(false)
  unsubscribed.value = true
}

const onCancel = () => {
  emit('confirm', false)
  emit('update:isDialogVisible', false)
  cancelled.value = true
}
</script>

<template>
  <!-- 👉 Confirm Dialog -->
  <VDialog
    max-width="480"
    :model-value="props.isDialogVisible"
    @update:model-value="updateModelValue"
  >
    <VCard class="bm-dialog">
      <div class="bmd-head">
        <div class="bmd-mark" style="background: oklch(0.72 0.14 60);">
          <VIcon icon="tabler-alert-triangle" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>{{ props.confirmationQuestion }}</h2>
        </div>
        <button class="bmd-close" type="button" @click="updateModelValue(false)">
          <VIcon icon="tabler-x" size="18" />
        </button>
      </div>

      <div class="bmd-foot">
        <button class="bmd-btn bmd-btn-ghost" type="button" @click="onCancel">
          {{ $t('common.cancel') }}
        </button>
        <button class="bmd-btn bmd-btn-primary" type="button" @click="onConfirmation">
          {{ $t('common.confirm') }}
        </button>
      </div>
    </VCard>
  </VDialog>

  <!-- Unsubscribed -->
  <VDialog v-model="unsubscribed" max-width="420">
    <VCard class="bm-dialog">
      <div class="bmd-head">
        <div class="bmd-mark" style="background: oklch(0.56 0.14 148);">
          <VIcon icon="tabler-check" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>{{ props.confirmTitle }}</h2>
          <p>{{ props.confirmMsg }}</p>
        </div>
        <button class="bmd-close" type="button" @click="unsubscribed = false">
          <VIcon icon="tabler-x" size="18" />
        </button>
      </div>
      <div class="bmd-foot">
        <button class="bmd-btn bmd-btn-primary" type="button" @click="unsubscribed = false">
          Ok
        </button>
      </div>
    </VCard>
  </VDialog>

  <!-- Cancelled -->
  <VDialog v-model="cancelled" max-width="420">
    <VCard class="bm-dialog">
      <div class="bmd-head">
        <div class="bmd-mark" style="background: oklch(0.55 0.19 25);">
          <VIcon icon="tabler-x" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>{{ props.cancelTitle }}</h2>
          <p>{{ props.cancelMsg }}</p>
        </div>
        <button class="bmd-close" type="button" @click="cancelled = false">
          <VIcon icon="tabler-x" size="18" />
        </button>
      </div>
      <div class="bmd-foot">
        <button class="bmd-btn bmd-btn-primary" type="button" @click="cancelled = false">
          Ok
        </button>
      </div>
    </VCard>
  </VDialog>
</template>
