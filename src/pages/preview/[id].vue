<script setup lang="ts">
import { nextTick } from 'vue';
import activeDotPath from '@/assets/images/illustrations/active-dot-path.png'; // Import your SVG icon
import inActiveDotPath from '@/assets/images/illustrations/inactive-dot-path.png';
import { Attachment } from '@/models/document/attachment';
import { ApproverState } from '@/models/document/dashboard';
import { Document } from '@/models/document/document';
import { History } from '@/models/document/history';
import { InternalRecipient } from '@/models/document/internal.recipient';
import { DocumentReference } from '@/models/document/reference.document';
import { ConfirmationDialogData } from '@/models/users/confirmation.dialog';
import { VLabel } from 'vuetify/components';
import PdfView from './pdf-view.vue';


const route = useRoute('preview-id')
const router = useRouter()

const downloadFile = (fileName: String) => {
  console.log(fileName)
}

// PDF generation function
const generatePDF = async () => {
  // Wait for component to be ready
  await nextTick()
  
  if (pdfViewComponent.value) {
    pdfViewComponent.value.generateDocumentPDF()
  } else {
    console.error('PDF View component not ready!')
  }
}

const headers = [
  { title: 'APPROVER', key: 'name' },
  { title: 'ACTION', key: 'isApproved' },
  { title: 'REASON', key: 'reason' },
  { title: 'UPDATED AT', key: 'updatedAt' },
]

const histories = ref<History[]>([])
const document = ref<Document>()
const approvers = ref<ApproverState[]>([])
const attachments = ref<Attachment[]>([])
const internalRecipient = ref<InternalRecipient[]>([])
const documentReferences = ref<DocumentReference[]>([])
const isConfirmationDialogVisible = ref(false)
const isAllowToUpdate = ref(false)

// PDF viewer states
const selectedTab = ref(0)
const selectedAttachment = ref<string>('')
const pdfInitialized = ref(false)

// PDF component ref
const pdfViewComponent = ref<InstanceType<typeof PdfView> | null>(null)


let confirmationDialogData = ref<ConfirmationDialogData>({
        title: '',
        body: '',
        buttonTitle: '',
        type: 0
})

const authorizationComment = ref('')

const showAuthorizationDialog = (isApproved: boolean) => {

  if (isApproved) {
    confirmationDialogData.value = ({
          title: `Are you sure want to APPROVE this document?`,
          body: 'Please put your comment below.',
          buttonTitle: 'Approve',
          type: 1
        })
  } else {
    confirmationDialogData.value = ({
          title: `Are you sure want to REJECT this document?`,
          body: 'Please put your comment below.',
          buttonTitle: 'Reject',
          type: 2
        })
  }

  isConfirmationDialogVisible.value = true
}

const updateDocument = () => {
  router.replace('/document/' + document.value?.id)
}

function openInNewTab(url: string) {
  window.open(url, '_blank');
}

function openDocumentReference(id: string) {
  window.open(`${window.location.origin}/preview/${id}`)
}

// Helper function to strip HTML tags and decode entities
const stripHtml = (html: string): string => {
  if (!html) return ''
  
  let text = html
  
  // Decode numeric entities (e.g., &#39; &#x27;)
  text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
  text = text.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
  
  // Manual entity replacement multiple times for nested encoding
  for (let iteration = 0; iteration < 5; iteration++) {
    let hasChanged = false
    
    const entityReplacements: Array<[RegExp, string]> = [
      [/&amp;/gi, '&'],
      [/&lt;/gi, '<'],
      [/&gt;/gi, '>'],
      [/&quot;/gi, '"'],
      [/&#0*39;/gi, "'"],
      [/&apos;/gi, "'"],
      [/&#x0*27;/gi, "'"],
      [/&nbsp;/gi, ' '],
    ]
    
    for (const [pattern, replacement] of entityReplacements) {
      const before = text
      text = text.replace(pattern, replacement as string)
      if (text !== before) hasChanged = true
    }
    
    if (!hasChanged) break
  }
  
  // Remove HTML tags
  const tmp = window.document.createElement('div')
  tmp.innerHTML = text
  return tmp.textContent || tmp.innerText || ''
}

// Helper function to decode HTML entities for proper rendering
const decodeHtml = (html: string): string => {
  if (!html) return ''
  
  const txt = window.document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}

const authorization = async (isApproved: boolean) => {
  try {
    const documentId = document.value?.id
    const state = isApproved ? 1 : 2
    const comment = authorizationComment.value === '' ? '' : authorizationComment.value

    const payload = {
      documentId,
      state,
      comment
    }

    const { error } = await useApi('/document/authorize', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (error.value) {
      console.error('API Error:', error.value)
      return
    }

    isConfirmationDialogVisible.value = false
    router.replace('/reguler/authorization')
  } catch (e) {
    console.error(e)
    isConfirmationDialogVisible.value = false
  }
}

const fetchData = async () => {
  try {
    const res = await useApi(`/document/detail/${route.params.id}`, {
      method: 'GET'
    })

    const payload = res.data.value as any
    isAllowToUpdate.value = payload.data.isAllowToUpdate

    document.value = {
      id: payload.data.id,
      externalRecipient: payload.data.externalRecipient,
      publicationNumberType: payload.data.publicationNumberType,
      publicationValue: payload.data.publicationValue,
      subject: payload.data.subject,
      body: payload.data.body,
      priority: payload.data.priority,
      status: payload.data.status,
      step: payload.data.step,
      type: payload.data.type,
      updatedAt: payload.data.updatedAt,
      isApprover: payload.data.isApprover,
      currentApprovalName: '',
      lastRejector: null,
      attachments: []
    }
    
    approvers.value = payload.data.documentSequence.approvers.map((approver: ApproverState) => ({
      name: approver.name,
      title: approver.title,
      date: approver.date,
      approved: approver.approved,
      signature: approver.signature,
      signatureUrl: approver.signatureUrl
    })) || []

    attachments.value = mapToAttachments(payload.data.documentAttachment)

    histories.value = payload.data.documentHistory.map((history: History) => ({
      name: history.name,
      title: history.title,
      isApproved: history.isApproved,
      reason: history.reason,
      updatedAt: history.updatedAt
        })) || []

    internalRecipient.value = payload.data.internalRecipients.map((recipient: InternalRecipient) => ({
      name: recipient.name,
      title: recipient.title,
        })) || []

    documentReferences.value = payload.data.documentReferences.map(mapDocumentReference)

  } catch {

  }
}

const priorityType = (value: number | null | undefined) => {
    if (value === 1)
        return "High"
    else if (value === 2)
        return "Medium"
    else if (value === 3)
        return "Low"
}

const documentType = (value: number | undefined) => {
    if (value === 1)
        return "Internal"
    else if (value === 2)
        return "External"
}

const actionType = (value: boolean | undefined) => {
    if (value === true)
        return "Approved"
    else if (value === false)
        return "Rejected"
}

const statusType = (value: number | undefined) => {
    if (value === 0)
        return "Draft"
    else if (value === 1)
        return "In Progress"
    else if (value === 2)
        return "Finished"
    else if (value === 3)
        return "Cancelled"
    else if (value === 99)
        return "Rejected"
}

function formatDate(input: string): string {
  // 1) Split off the parts: ["2025-05-01", "21:15:14.907703", "+0700", "WIB"]
  const parts = input.trim().split(/\s+/);
  if (parts.length < 3) {
    // fallback to JS’s own parsing if the format’s unexpected
    return new Date(input).toLocaleString("en-US", {
      day:   "2-digit",
      month: "short",
      year:  "numeric",
      hour:  "2-digit",
      minute:"2-digit",
      hour12: false
    });
  }

  const [datePart, timeWithFrac, tzRaw] = parts;
  // strip off fractional seconds
  const timePart = timeWithFrac.split(".")[0];             // "21:15:14"
  // reformat "+0700" → "+07:00" so Date parses the zone
  const tzPart = tzRaw.replace(/([+-]\d{2})(\d{2})/, "$1:$2");

  // build an ISO-8601 string
  const iso = `${datePart}T${timePart}${tzPart}`;          // "2025-05-01T21:15:14+07:00"
  const dt  = new Date(iso);

  // month names
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const day   = String(dt.getDate()).padStart(2, "0");
  const mon   = monthNames[dt.getMonth()];
  const year  = dt.getFullYear();
  const hour  = String(dt.getHours()).padStart(2, "0");
  const minute= String(dt.getMinutes()).padStart(2, "0");

  return `${day} ${mon} ${year}, ${hour}:${minute}`;
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <VRow>
    <VCol
      cols="12"
      md="5"
      lg="3"
    >
    <VCard
      class="mx-auto detail-info-container"
      max-width="400"
      max-height="600"
      >
      <VRow style="flex-direction: column;">
        <VLabel
          class="card-title"
          style="font-size: 20px; font-weight: 600;"
        >
          Detail Information
        </VLabel>
        <VDivider/>
      </VRow>

      <VRow style="flex-direction: column; padding-top: 16px;">
          <VLabel style="font-size: 13px;">
            Publication Number
          </VLabel>
          <VLabel style="font-size: 18px; font-weight: 600;">
            {{ document?.publicationValue }}
          </VLabel>
      </VRow>

      <VRow style="flex-direction: column; padding-top: 16px;">
          <VLabel style="font-size: 13px;">
            Priority Level
          </VLabel>
          <VLabel style="font-size: 18px; font-weight: 600;">
            {{ priorityType(document?.priority) }}
          </VLabel>
      </VRow>

      <VRow style="flex-direction: column; padding-top: 16px;">
          <VLabel style="font-size: 13px;">
            Document Type
          </VLabel>
          <VLabel style="font-size: 18px; font-weight: 600;">
            {{ documentType(Number(document?.type)) }}
          </VLabel>
      </VRow>

      <VRow style="flex-direction: column; padding-top: 16px;">
          <VLabel style="font-size: 13px;">
            Status
          </VLabel>
          <VLabel style="font-size: 18px; font-weight: 600;">
            {{ statusType(document?.status) }}
          </VLabel>
      </VRow>

        <VRow style="flex-direction: column; padding-top: 16px;" v-if="internalRecipient?.length > 0">
          <VLabel style="font-size: 13px;">
            Internal Recipients
          </VLabel>

          <div v-for="(recipient, index) in internalRecipient">
            <VLabel style="font-size: 18px; font-weight: 600;">
            {{ recipient.name }} - {{ recipient.title }}
          </VLabel>
          </div>
        </VRow>

        <VRow style="flex-direction: column; padding-top: 16px;" v-if="document?.externalRecipient != ''">
          <VLabel style="font-size: 13px;">
            External Recipients
          </VLabel>

          <VLabel style="font-size: 18px; font-weight: 600;">
            {{ document?.externalRecipient  }}
          </VLabel>
        </VRow>
      </VCard>

        <VBtn
            block
            type="submit"
            color="primary"
            variant="tonal"
            class="mb-2 mt-3"
            @click="generatePDF"
            :loading="pdfViewComponent?.isGeneratingPDF"
          >
            PDF Preview
        </VBtn>

        <VBtn
            block
            color="primary"
            class="mb-2 mt-3"
            @click="updateDocument"
            v-if="isAllowToUpdate"
          >
            Update Document
        </VBtn>

        <VRow dense v-if="document?.isApprover">
          <VCol cols="6">
            <VBtn
              block
              color="error"
              @click="showAuthorizationDialog(false)"
            >
              Reject
            </VBtn>
          </VCol>

          <VCol cols="6">
            <VBtn
              block
              type="submit"
              color="success"
              @click="showAuthorizationDialog(true)"
            >
              Approve
            </VBtn>
          </VCol>
        </VRow>
    </VCol>

  <VCol
      cols="12"
      md="7"
      lg="9"
    >
    <VCard
      class="mx-auto main-content-container"
      max-width="100%"
      max-height="100%">
      <VRow style="flex-direction: column;">
        <VLabel
          class="card-title"
          style="font-size: 20px; font-weight: 200;"
        >
          Subject
        </VLabel>

        <VDivider style="margin-bottom: 13px;"/>

        <VLabel
          class="card-title"
          style="font-size: 20px; font-weight: 600; padding-bottom: 30px;"
        >
          {{ stripHtml(document?.subject || '') }}
        </VLabel>
      </VRow>

      <VRow style="flex-direction: column; padding-bottom: 30px;">
        <VLabel
          class="card-title"
          style="font-size: 20px; font-weight: 200;"
        >
          Body
        </VLabel>

        <VDivider style="margin-bottom: 13px;"/>
        <div class="auto-text">{{ stripHtml(document?.body || '') }}</div>
      </VRow>
    </VCard>

    <VCard
      v-show="documentReferences.length > 0"
      class="mx-auto main-content-container"
      max-width="100%"
      max-height="100%">
      <VRow style="flex-direction: column; padding-bottom: 30px;"
      >
        <VLabel
          class="card-title"
          style="font-size: 20px; font-weight: 200;"
        >
          Document References
        </VLabel>
        <div class="file-list" v-for="(reference, index) in documentReferences"
          :key="index">
            <ReferenceItemView
            :subject="reference.title"
            :onRowTapped="() => openDocumentReference(reference.id)"
            />
        </div>
      </VRow>
    </VCard>

    <VCard
      class="mx-auto main-content-container"
      max-width="100%"
      max-height="100%">
      <VRow style="flex-direction: column; padding-bottom: 30px;"
      >
        <VLabel
          class="card-title"
          style="font-size: 20px; font-weight: 200;"
        >
          Attachments
        </VLabel>

        <div class="file-list" v-for="(attachment, index) in attachments"
          :key="index">
            <FileRowView
              :file-name="attachment.originalName"
              :file-size="attachment.size ?? ''"
              :file-type="attachment.type"
              :file="null"
              :index="index"
              :onRowTapped="() => openInNewTab(attachment.path)"
            />
        </div>
      </VRow>
    </VCard>

    <VCard
      class="mx-auto main-content-container"
      max-width="100%"
      max-height="100%">
      <VRow style="flex-direction: column; padding-bottom: 30px;">
        <VLabel
          class="card-title"
          style="font-size: 20px; font-weight: 200;"
        >
          Approval Activity
        </VLabel>

        <VDivider />

        <VTimeline
                align="start"
                truncate-line="both"
                side="end"
                density="compact"
                line-thickness="1"
                class="v-timeline--variant-outlined pt-5"
              >
          <VTimelineItem
            v-for="(approver, index) in approvers"
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

              <!-- Signature Image -->
              <div v-if="approver.signature && approver.signatureUrl" class="mt-3">
                <div class="text-caption text-medium-emphasis mb-1">Digital Signature:</div>
                <img 
                  :src="approver.signatureUrl" 
                  alt="Digital Signature" 
                  style="max-width: 200px; max-height: 100px; object-fit: contain; border: 1px solid #e0e0e0; padding: 8px; border-radius: 4px;"
                />
              </div>
            </div>

            <div v-if="approver.approved == null">
                    <div class="app-timeline-title">
                      {{ approver.name }} - {{ approver.title }}
                    </div>
                  </div>
          </VTimelineItem>
        </VTimeline>
      </VRow>
    </VCard>

    <VCard
      class="mx-auto main-content-container"
      max-width="100%"
      max-height="100%">
      <VLabel
          class="card-title"
          style="font-size: 20px; font-weight: 200;"
        >
          Approval History
        </VLabel>

      <VDivider/>

      <VDataTable
          :headers="headers"
          :items="histories"
          :items-per-page="10"
        >

        <template #item.name="{ item }">
          <VLabel>
              {{ item.name }} - {{ item.title }}
          </VLabel>
        </template>

        <template #item.isApproved="{ item }">
          <VLabel>
              {{ actionType(item.isApproved)  }}
          </VLabel>
        </template>

        <template #item.reason="{ item }">
          <VLabel>
              {{ item.reason }}
          </VLabel>
        </template>

        <template #item.updatedAt="{ item }">
          <VLabel>
              {{ formatDate(item.updatedAt)  }}
          </VLabel>
        </template>
      </VDataTable>
  </VCard>
  </VCol>
  </VRow>

  <!-- Hidden PDF View Component -->
  <PdfView 
    v-if="approvers.length > 0 && document"
    :key="`pdf-${approvers.length}-${approvers[0]?.signatureUrl || 'none'}`"
    ref="pdfViewComponent"
    :document="document"
    :booking-number="document?.publicationValue"
    :internal-recipients="internalRecipient as any"
    :external-recipients="document?.externalRecipient || ''"
    :signers="[]"
    :signers-with-signature="approvers"
    :with-letter-head="true"
    style="display: none;"
  />

  <VDialog
    v-model="isConfirmationDialogVisible"
    persistent
    class="v-dialog-sm"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isConfirmationDialogVisible = !isConfirmationDialogVisible" />
 
    <!-- Dialog Content -->
    <VCard :title="confirmationDialogData.title">
      <VCardText>
        {{ confirmationDialogData.body }}
      </VCardText>

      <AppTextarea
        class="ml-6 mr-6"
        placeholder="Placeholder Text"
        v-model="authorizationComment"
      />
 
      <VCardText class="d-flex justify-end gap-3 flex-wrap">
        <VBtn
          color="secondary"
          variant="tonal"
          @click="isConfirmationDialogVisible = false"
        >
          Cancel
        </VBtn>

        <VBtn 
          color="success"
          v-if="confirmationDialogData.type == 1" @click="authorization(true)">
          {{ confirmationDialogData.buttonTitle }}
        </VBtn>

        <VBtn 
        color="error"
        :disabled="authorizationComment == ''"
        v-if="confirmationDialogData.type == 2" @click="authorization(false)">
          {{ confirmationDialogData.buttonTitle }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
<style scoped>
.card-title {
  padding-bottom: 13px;
}
.detail-info-container {
  padding: 30px;
}

.main-content-container {
  padding: 30px;
  margin-bottom: 16px;
}

.auto-text {
  font-size: 16px;
  font-weight: 400;
  max-width: 100%;
  /* LET THE HEIGHT GROW */
  height: auto;
}

.attachment-file {
  font-size: 15px;
  font-weight: 800;
  margin-top: 14px;
  margin-bottom: 20px;
}
</style>