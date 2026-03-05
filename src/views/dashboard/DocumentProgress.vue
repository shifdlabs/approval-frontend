<script setup lang="ts">
import activeDotPath from '@/assets/images/illustrations/active-dot-path.png'; // Import your SVG icon
import inActiveDotPath from '@/assets/images/illustrations/inactive-dot-path.png'; // Import your SVG icon
import { CompletedOverview, InProgressOverview, RejectedOverview } from '@/models/document/dashboard';
import { formatToWeekdayTime } from '@/utils/converter';

const props = defineProps<Props>()
interface Props {
  inProgressOverview?: InProgressOverview;
  rejectedOverview?: RejectedOverview;
  completedOverview?: CompletedOverview;
}

const currentTab = ref('In Progress')
const tabsData = ['In Progress', 'Rejected', 'Completed']
</script>

<template>
    <VCard class="country-order-card">
      <VCardItem
        title="Latest Activity"
        subtitle="Your latest approval activity"
        class="pb-4"
      >
      </VCardItem>
  
      <VTabs
        v-model="currentTab"
        grow
        class="disable-tab-transition"
      >
        <VTab
          v-for="(tab, index) in tabsData"
          :key="index"
        >
          {{ tab }}
        </VTab>
      </VTabs>
  
      <VCardText>
        <VWindow v-model="currentTab">
          <VWindowItem class="window-item-container">
            <div class="timeline-scroll" v-if="props.inProgressOverview != null">
              <div class="inprogress-header-container">
                <div class="inprogress-subject-label">
                  Subject
                </div>
                <div class="inprogress-subject">
                  {{ props.inProgressOverview?.subject }}
                </div>
              </div>
            
              <!-- IN PROGRES TAB -->
              <VTimeline
                align="start"
                truncate-line="both"
                side="end"
                density="compact"
                line-thickness="1"
                class="v-timeline--variant-outlined"
              >
              <!-- APPROVED STATE -->
                <VTimelineItem
                  v-for="(approver, index) in props.inProgressOverview?.approvers"
                  :key="index"
                  dot-color="rgba(var(--v-theme-surface))"
                  fill-dot
                  size="20"
                  :elevation="0"
                >
                  <template #icon v-if="approver.approved != null">
                      <img
                        :src="activeDotPath"
                        alt="check"
                        style="width: 20px; height: 20px; object-fit: contain;"
                      />
                  </template>

                  <template #icon v-else">
                    <img
                      :src="inActiveDotPath"
                      alt="check"
                      style="width: 20px; height: 20px; object-fit: contain;"
                    />
                  </template>

                  <div v-if="approver.approved != null">
                    <div class="d-flex align-center">
                      <div class="app-timeline-title">
                        {{ approver.name }} - {{ approver.title }}
                      </div>
                      <v-spacer />
                      <div class="app-timeline-text">
                        {{ formatToWeekdayTime(approver.date ?? "") }}
                      </div>
                    </div>

                    <div class="app-timeline-text">
                      <div v-if="approver.approved == true">
                        Accepted
                      </div>
                      <div v-if="approver.approved == false">
                        Rejected
                      </div>
                    </div>
                  </div>

                  <div v-if="approver.approved == null">
                    <div class="app-timeline-title">
                      {{ approver.name }} - {{ approver.title }}
                    </div>
                  </div>
                </VTimelineItem>
              </VTimeline>
            </div>

            <div class="d-flex justify-center align-center" v-else>
                Empty
              </div>
          </VWindowItem>

          <!-- REJECTED TAB -->
          <VWindowItem class="window-item-container">
            <div class="timeline-scroll" v-if="props.rejectedOverview != null">
              <VTimeline
                align="start"
                truncate-line="both"
                side="end"
                density="compact"
                line-thickness="1"
                class="v-timeline--variant-outlined"
              >
              
                <VTimelineItem
                  icon="tabler-circle-x"
                  dot-color="rgba(var(--v-theme-surface))"
                  icon-color="error"
                  size="20"
                  :elevation="0"
                >
                  <div class="d-flex align-center">
                    <div class="text-body-2 text-uppercase text-error">
                    {{ props.rejectedOverview?.name }} - {{ props.rejectedOverview?.title }}
                    </div>
                    <v-spacer />
                    <div class="app-timeline-time">
                      {{ formatToWeekdayTime(props.rejectedOverview?.date) }}
                    </div>
                  </div>
                  
                  <div class="app-timeline-title">
                    {{ props.rejectedOverview?.subject }}
                  </div>
                  <div class="app-timeline-text">
                    Reason: {{ props.rejectedOverview?.reason }}
                  </div>
                </VTimelineItem>
              </VTimeline>
              <VDivider
                class="my-4"
                style="border-style: dashed;"
              />
            </div>

            <div class="d-flex justify-center align-center" v-else>
                Empty
              </div>
          </VWindowItem>


          <!-- COMPLETED TAB -->
          <VWindowItem class="window-item-container">
          <div class="timeline-scroll" v-if="props.completedOverview != null">
            <VTimeline
              align="start"
              truncate-line="both"
              side="end"
              density="compact"
              line-thickness="1"
              class="v-timeline--variant-outlined"
            >
            <VTimelineItem
                :icon="props.completedOverview?.isFinished ? 'tabler-circle-check' : 'tabler-circle-x'"
                dot-color="rgba(var(--v-theme-surface))"
                :icon-color="props.completedOverview?.isFinished ? 'success' : 'error'"
                size="20"
                :elevation="0"
              >
          <div class="d-flex align-center">

            <div class="text-body-2 text-uppercase text-success" v-if="props.completedOverview?.isFinished == true">
            {{ props.completedOverview?.name }} - {{ props.completedOverview?.title }}
            </div>

            <div class="text-body-2 text-uppercase text-error" v-else-if="props.completedOverview?.isFinished == false">
            {{ props.completedOverview?.name }} - {{ props.completedOverview?.title }}
            </div>

            <v-spacer />
            <div class="app-timeline-time">
              {{ formatToWeekdayTime(props.completedOverview?.date) }}
            </div>
          </div>
          
          <div class="app-timeline-title" style="margin-bottom: 5px;">
            {{ props.completedOverview?.subject }}
          </div>
          
          <div class="internal-recipients-container" v-if="props.completedOverview?.internalApprover != null">
            <div class="app-timeline-text">
              Internal Recipients:
            </div>
            <ul class="my-bullet-list" v-for="(approver, index) in props.completedOverview.internalApprover"
            :key="index">
              <li>{{ approver.name }} - {{ approver.title }}</li>
            </ul>
          </div>

          <div class="app-timeline-text" v-if="props.completedOverview?.externalApprover != null">
            External Recipients:
          </div>
          <div class="external-recipients-text">
            {{ props.completedOverview?.externalApprover }}
          </div>
          </VTimelineItem>
              </VTimeline>
              <VDivider
                class="my-4"
                style="border-style: dashed;"
              />
            </div>

            <div class="d-flex justify-center align-center" v-else>
                Empty
              </div>
          </VWindowItem>
        </VWindow>
      </VCardText>
    </VCard>
  </template>
  
  <style lang="scss">
  .inprogress-header-container {
    margin-bottom: 23px;
  }

  .inprogress-subject-label {
    font-size: 12px;
    font-weight: normal;
  }

  .inprogress-subject {
    font-size: 18px;
    font-weight: 500;
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  }
  .app-timeline-time {
    font-size: 13px;
    font-weight: lighter;
    line-height: 1.375rem;
  }

  .country-order-card {
    height: 450px;
    .v-timeline .v-timeline-divider__dot .v-timeline-divider__inner-dot {
      box-shadow: none !important;
    }
  }

  .my-bullet-list {
  list-style-type: disc;    /* default solid circles */
  padding-left: 1.5rem;     /* indent bullets */
  margin: 0;                /* reset default margins if you like */
}
.my-bullet-list li {
  font-weight: 600;
  margin-bottom: 0.1rem;    /* spacing between items */
}

.internal-recipients-container {
  margin-bottom: 10px;
}

.external-recipients-text {
  margin-left: 10px;
  font-weight: 600;
}

// .window-item-container {
//   height: 2000px;
// }

.timeline-scroll {
  /* give it a real height limit */
  height: 280px;

  /* flexbox fix so it actually respects max-height */
  min-height: 0;

  /* scroll when needed */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  /* (optional) force scrollbar “always on” for testing */
  /* overflow-y: scroll !important; */
}
  </style>
  