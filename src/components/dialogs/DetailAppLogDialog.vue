<script setup lang="ts">
import { AppLog } from '@/models/app-log/app.log';

interface Props {
  appLog?: AppLog,
  isDialogVisible: boolean
}

interface Emit {
  (e: 'update:isDialogVisible', val: boolean): void
}

const emit = defineEmits<Emit>()
const props = defineProps<Props>()

const dialogModelValueUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val)
}

const formattedLog = computed(() => {
  return props.appLog && props.appLog.log
    ? JSON.stringify(props.appLog.log, null, 2)
    : '';
});

</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 700"
    height="auto"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-sm-10 pa-2">
      <VCardText>
        <!-- 👉 Title -->
        <h4 class="text-h4 text-center mb-2">
          App Log
        </h4>

        <!-- 👉 Form -->
        <VRow>
        <VCol cols="6">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
            User ID
            </VLabel>
            <h6 class="text-h6" style="max-width: 200px;">
            {{ props.appLog?.userId }}
            </h6>
        </VCol>

        <VCol cols="6">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
            Action Type
            </VLabel>
            <h6 class="text-h6">
            {{ props.appLog?.action }}
            </h6>
        </VCol>
        </VRow>

        <VRow>
        <VCol cols="6">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
            Module
            </VLabel>
            <h6 class="text-h6">
            {{ props.appLog?.module }}
            </h6>
        </VCol>

        <VCol cols="6">
            <VLabel class="mb-1 text-body-2 text-wrap" style="line-height: 15px;">
            Log Date
            </VLabel>
            <h6 class="text-h6">
            {{ props.appLog?.logDate }}
            </h6>
        </VCol>
        </VRow>

        <VRow>
            <VCol cols="12">
                <div class="json-container">
                    <pre><code class="json-display">{{ formattedLog }}</code></pre>
                </div>
            </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.json-display {
  /* Set your desired color for the code text */
  color: #333; /* Dark gray, change to any color you like */
  font-family: 'Courier New', Courier, monospace;
  background-color: transparent; /* Or set a background if needed */
}

/* Optionally, adjust the <pre> styling as well */
.json-container pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
