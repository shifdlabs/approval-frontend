<script setup lang="ts">
const props = defineProps<Props>()
interface Props {
  overviewData: any[];
}

const inProgressPercentage = computed(() => {
  if (props.overviewData[0].percentage < 20) {
    return 20
  } else {
    return props.overviewData[0].percentage
  }
})

const finishedPercentage = computed(() => {
  if (props.overviewData[1].percentage < 20) {
    return 20
  } else {
    return props.overviewData[1].percentage
  }
})

const cancelledPercentage = computed(() => {
  if (props.overviewData[2].percentage < 20) {
    return 20
  } else {
    return props.overviewData[2].percentage
  }
})

const uiData = [
  { icon: 'tabler-arrow-big-up', title: 'In Progress' },
  { icon: 'tabler-circle-check', title: 'Finish' },
  { icon: 'tabler-circle-x', title: 'Cancelled' },
]
</script>

<template>
  <VCard class="approval-overview-card">
    <VCardItem title="Approval Overview">
    </VCardItem>
    <VCardText>
      <VRow class="no-gap-row">
        <VCol
          cols="12"
          md="4"
        >
      <VRow>
        <VCol cols="12">
          <p class="total-approval" style="margin: 0; padding-top: 20px;">{{ props.overviewData[1].originalValue + props.overviewData[2].originalValue }}</p>
        </VCol>
        <VCol cols="12">
          <p>authorizations that you've approved</p>
        </VCol>
      </VRow>
      </VCol>
        <VCol
          cols="12"
          md="8"
        >
        <div class="d-flex mb-6">
        <div :style="{ inlineSize: inProgressPercentage + '%' }">
          <div class="vehicle-progress-label position-relative mb-6 text-body-1 d-none d-sm-block">
            In Progress
          </div>
          <VProgressLinear
            color="warning-100"
            model-value="100"
            height="46"
            class="rounded-e-0 rounded-lg"
          >
            <div class="text-start text-sm font-weight-medium">
              {{ props.overviewData[0].percentage }}%
            </div>
          </VProgressLinear>
        </div>
        <div :style="{ inlineSize: finishedPercentage + '%' }">
          <div class="vehicle-progress-label position-relative mb-6 text-body-1 d-none d-sm-block">
            Finish
          </div>
          <VProgressLinear
            color="error-100"
            model-value="100"
            height="46"
            class="rounded-0"
          >
            <div class="text-start text-sm font-weight-medium text-start">
              {{ props.overviewData[1].percentage }}%
            </div>
          </VProgressLinear>
        </div>
        <div :style="{ inlineSize: cancelledPercentage + '%' }">
          <div class="vehicle-progress-label position-relative mb-6 text-body-1 d-none d-sm-block">
            Cancelled
          </div>
          <VProgressLinear
            color="info-100"
            model-value="100"
            height="46"
            class="rounded-s-0 rounded-lg"
          >
            <div class="text-sm font-weight-medium text-start">
              {{ props.overviewData[2].percentage }}%
            </div>
          </VProgressLinear>
        </div>
      </div>
      </VCol>
      </VRow>
      
      <VTable class="text-no-wrap">
        <tbody>
          <tr
            v-for="(document, index) in uiData"
            :key="index"
          >
            <td
              width="70%"
              style="padding-inline-start: 0 !important;"
            >
              <div class="d-flex align-center gap-x-2">
                <VIcon
                  :icon="document.icon"
                  size="24"
                  class="text-high-emphasis"
                />
                <div class="text-body-1 text-high-emphasis">
                  {{ document.title }}
                </div>
              </div>
            </td>
            <td>
              <h6 class="text-h6">
                {{ overviewData[index].originalValue }}
              </h6>
            </td>
            <td>
              <div class="text-body-1">
                {{ overviewData[index].percentage }}%
              </div>
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.approval-overview-card {
  max-height: 400px;
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
