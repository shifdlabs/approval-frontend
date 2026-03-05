<script lang="ts" setup>
interface Props {
  subject: string;
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
    :aria-label="`Open ${props.subject}`"
  >
    <div class="file-left">
        <VIcon
          icon="tabler-file-text"
          size="30"
        />
    </div>

    <div class="file-body">
      <div class="file-title" :title="props.subject">
        Subject: {{ props.subject }}
      </div>
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
  font-weight: 300;
  font-style: italic;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 420px) {
  .file-row {
    padding: 0.5rem;
  }
  .file-title {
    font-size: 0.2rem;
  }
}
</style>
