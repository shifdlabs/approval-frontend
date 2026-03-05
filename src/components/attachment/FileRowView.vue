<script lang="ts" setup>
interface Props {
  fileName: string;
  fileSize: string;
  fileType: string | null;
  file: File | null;
  index: number;
  onFileRemoved?: (index: number) => void;
  onRowTapped?: () => void;
}
const props = defineProps<Props>();

// handleRowClick calls the optional handler safely
const handleRowClick = () => {
  props.onRowTapped?.();
};
</script>

<template>
  <div
    class="file-row"
    role="button"
    tabindex="0"
    @click="handleRowClick"
    @keydown.enter="handleRowClick"
    @keydown.space.prevent="handleRowClick"
    :aria-label="`Open ${props.fileName}`"
  >
    <div class="file-left">
      <VImg
        class="file-icon-img"
        :src="fileIcon(props.file, props.fileName, props.fileType)"
        :alt="getExtension(props.fileName).replace('.', '') || 'file'"
        draggable="false"
      />
    </div>

    <div class="file-body">
      <div class="file-title" :title="props.fileName">
        {{ props.fileName }}
      </div>
      <div class="file-meta">
        <span class="file-ext">{{ getExtension(props.fileName) }}</span>
        <span class="dot">•</span>
        <span class="file-size">{{ props.fileSize }}</span>
      </div>
    </div>

    <div class="file-actions" v-if="onRowTapped == null">
      <VBtn
        icon
        color="error"
        variant="outlined"
        class="action-btn"
        :aria-label="`delete ${props.fileName}`"
        @click.stop="props.onFileRemoved?.(props.index)"
      >
        <VIcon size="20">tabler-trash</VIcon>
      </VBtn>
    </div>
  </div>
</template>

<style>
.file-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  box-shadow: 0 3px 4px rgba(16,24,40,0.04);
  border: 2px solid rgba(0,0,0,0.06);

  transition: background 120ms ease, transform 80ms ease, box-shadow 120ms ease;
}

/* show pointer when row is actionable */
.file-row[role="button"] {
  cursor: pointer;
}

/* hover effect */
.file-row[role="button"]:hover {
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(16,24,40,0.06);
}

/* keyboard focus ring for accessibility */
.file-row[role="button"]:focus-visible {
  outline: 3px solid rgba(99,102,241,0.18);
  outline-offset: 2px;
}

/* rest of your styles (unchanged) */
.file-left {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
}

.file-icon-img {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 8px;
  background: transparent;
  user-select: none;
}

.file-body {
  flex: 1 1 auto;
  min-width: 0;
}

.file-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-ext {
  background: rgba(0,0,0,0.04);
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.75rem;
  color: #374151;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  min-width: 40px;
  display: grid;
  place-items: center;
  box-shadow: none;
}

.dot {
  opacity: 0.6;
}

@media (max-width: 420px) {
  .file-row {
    padding: 0.5rem;
  }
  .file-title {
    font-size: 0.95rem;
  }
}
</style>
