<script setup lang="ts">
import { ApproverState, CompletedOverview, InProgressOverview, InternalRecipient, RejectedOverview } from '@/models/document/dashboard';
import { Document } from '@/models/document/document';
import AuthorDocumentsOverview from '@/views/dashboard/AuthorDocumentsOverview.vue';
import DocumentProgress from '@/views/dashboard/DocumentProgress.vue';
import DocumentStatistic from '@/views/dashboard/DocumentStatistic.vue';
import GreetingBanner from '@/views/dashboard/GreetingBanner.vue';
import { ref } from 'vue';

const headers = [
  { title: 'SUBJECT', key: 'subject' },
  { title: 'BODY', key: 'body' },
  { title: 'RECEIVED AT', key: 'updatedAt' },
]

const statistics = ref<number[]>([])
// const overview = ref([  
//   { originalValue: 0, percentage: 0 },
//   { originalValue: 0, percentage: 0 },
//   { originalValue: 0, percentage: 0 },
// ])
const inProgressOverview = ref<InProgressOverview>()
const rejectedOverview = ref<RejectedOverview>()
const completedOverview = ref<CompletedOverview>()
const inboxes = ref<Document[]>([])
const authorDocuments = ref<Document[]>([])

const mapDocument = (rawDocuments: any): Document => {
        return {
          ...rawDocuments,
          // override the position property with our mapped version
          // position: mapPosition(rawUser.position)
        };
      };

const fetchDashboardData = async () => {
  try {
    const res = await useApi('/document/dashboard', {
      method: 'GET',
      credentials: 'include',
    })

  const payload = res.data.value as any
  console.log(payload.data)

  if (payload && payload.data.statistic) {
    statistics.value = [
      payload.data.statistic.authorization,
      payload.data.statistic.inProgress,
      payload.data.statistic.rejected,
      payload.data.statistic.completed
    ]
  }
    const authorDocs = payload.data.authorDocuments as any[]
  console.log(authorDocs, "Rezz")
    // const overviewPayload = payload.data.overview
    // const totalOverview = overviewPayload.totalValue
    // overview.value = [
    //   {originalValue: overviewPayload.inProgress, percentage: overviewPayload.inProgress / totalOverview * 100},
    //   {originalValue: overviewPayload.finished, percentage: overviewPayload.finished / totalOverview * 100},
    //   {originalValue: overviewPayload.cancelled, percentage: overviewPayload.cancelled / totalOverview * 100},
    // ]


    
    const progressOverview = payload.data.progress
    if (progressOverview != null) {
      inProgressOverview.value = {
        subject: progressOverview.inProgress.subject,
        approvers: progressOverview.inProgress.approvers.map((approver: ApproverState) => ({
          name: approver.name,
          title: approver.title,
          date: approver.date,
          approved: approver.approved
        })) || [],
      }

      rejectedOverview.value = {
        name: progressOverview.rejected.name,
        title: progressOverview.rejected.title,
        date: progressOverview.rejected.date,
        subject: progressOverview.rejected.subject,
        reason: progressOverview.rejected.reason,
      }
    }

    completedOverview.value = {
      isFinished: progressOverview.completed.isFinished,
      name: progressOverview.completed.name,
      title: progressOverview.completed.title,
      date: progressOverview.completed.date,
      subject: progressOverview.completed.subject,
      internalApprover: progressOverview.completed.internalRecipient.map((recipient: InternalRecipient) => ({
        name: recipient.name,
        title: recipient.title,
      })) || [],
      externalApprover: progressOverview.completed.externalRecipient
    }


    authorDocuments.value = authorDocs.map((document: any) => mapDocument(document));

    const inbox = payload.data.inbox as any[]
    inboxes.value = inbox.map((document: any) => mapDocument(document));
  } catch (e) {
    console.log(e)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <GreetingBanner />
    </VCol>

    <VCol cols="12">
      <DocumentStatistic
      :statistics="statistics"
      />
    </VCol>

    <VCol 
    cols="12"
    md="6"
    >
      <AuthorDocumentsOverview
        :documents="authorDocuments"
      />
    </VCol>
    <VCol
    cols="12"
    md="6">
    <DocumentProgress
      :in-progress-overview="inProgressOverview"
      :rejected-overview="rejectedOverview"
      :completed-overview="completedOverview"
      />
    </VCol>

    <VCol
      cols="12"
    >
    <VDataTable
          :headers="headers"
          :items="inboxes"
          :items-per-page="10"
        >

        <template #item.subject="{ item }">
          <VLabel>
              {{ item.subject  }}
          </VLabel>
        </template>

        <template #item.body="{ item }">
          <VLabel style="max-width: 300px;">
              {{ item.body }}
          </VLabel>
        </template>

        <template #item.updatedAt="{ item }">
          <VLabel>
              {{ formatDate(item.updatedAt)  }}
          </VLabel>
        </template>
      </VDataTable>
    </VCol>
  </VRow>
</template>
