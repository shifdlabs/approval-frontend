<script setup lang="ts">
import { Document } from '@/models/document/document';

const props = defineProps<Props>()
interface Props {
  documents: Document[];
}

const headers = [
    { title: 'SUBJECT', key: 'subject' },
    { title: 'STATUS', key: 'status' },
    { title: 'UPDATED AT', key: 'updatedAt' },
]

const statusCard = (value: number) => {
    if (value === 1)
        return { color: 'warning', text: 'In Progress' }
    else if (value === 2)
        return { color: 'success', text: 'Finished' }
    else if (value === 3)
        return { color: 'secondary', text: 'Cancelled' }
    else if (value === 99)
        return { color: 'error', text: 'Rejected' }
    else
        return { color: 'info', text: '-' }
    }

</script>

<template>
  <VCard class="document-overview-card">
    <VCardItem title="Your Documents"/>
    <VCardText>
        <VDataTable
            fixed-header
          :headers="headers"
          :items="props.documents"
          height="300"
        >
          <template #item.subject="{ item }">
            <RouterLink
            :to="{ name: 'preview-id', params: { id: '1212' } }"
            class="font-weight-medium text-link">
            <VLabel>
                {{ item.subject  }}
            </VLabel>
            </RouterLink>
          </template>
        
          <!-- Access -->
          <template #item.status="{ item }">
            <VChip
              :color="statusCard(item.status).color"
              size="small"
            >
              {{ statusCard(item.status).text }}
            </VChip>
          </template>

          <template #item.updatedAt="{ item }">
            <VLabel>
                {{ formatDate(item.updatedAt)  }}
            </VLabel>
          </template>

        </VDataTable>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.document-overview-card {
  height: 450px;
}

.vehicle-progress-label {
  padding-block-end: 1rem;

  &::after {
    position: absolute;
    display: inline-block;
    background-color: rgba(var(--v-theme-on-surface), var(--v-border-opacity));
    block-size: 10px;
    content: "";
    inline-size: 2px;
    inset-block-end: 0;
    inset-inline-start: 0;

    [dir="rtl"] & {
      inset-inline: unset 0;
    }
  }
}
</style>

<style lang="scss">
.v-progress-linear__content {
  justify-content: start;
  padding-inline-start: 1rem;
}

#shipment-statistics .apexcharts-legend-series {
  padding-inline: 16px;
}

@media (max-width: 1080px) {
  #shipment-statistics .apexcharts-legend-series {
    padding-inline: 12px;
  }

  .v-progress-linear__content {
    padding-inline-start: 0.75rem !important;
  }
}

@media (max-width: 576px) {
  #shipment-statistics .apexcharts-legend-series {
    padding-inline: 8px;
  }

  .v-progress-linear__content {
    padding-inline-start: 0.125rem !important;
  }
}

.total-approval {
  font-size: 40px;
  font-weight: 600;
  color: text-primary;
}

.no-gap-row {
  /* no space between rows or cols */
  gap: 0;          /* shorthand for row-gap & column-gap */  
  margin: 0;       /* override negative margins */
}
.no-gap-row > .v-col {
  padding: 0;      /* remove any leftover gutter on cols */
}
</style>
