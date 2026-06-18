<script setup lang="ts">
import { nextTick } from 'vue';
import { Attachment } from '@/models/document/attachment';
import { ApproverState } from '@/models/document/dashboard';
import { Document } from '@/models/document/document';
import { History } from '@/models/document/history';
import { InternalRecipient } from '@/models/document/internal.recipient';
import { DocumentReference } from '@/models/document/reference.document';
import { ConfirmationDialogData } from '@/models/users/confirmation.dialog';
import PdfView from './pdf-view.vue';


const route = useRoute('preview-id')
const router = useRouter()
const { t } = useI18n()

const downloadFile = (fileName: String) => {
  console.log(fileName)
}

// PDF generation function
const generatePDF = async () => {
  await nextTick()
  if (pdfViewComponent.value) {
    pdfViewComponent.value.generateDocumentPDF()
  } else {
    console.error('PDF View component not ready!')
  }
}

const headers = computed(() => [
  { title: t('preview.columns.approver'), key: 'name' },
  { title: t('preview.columns.action'), key: 'isApproved' },
  { title: t('preview.columns.reason'), key: 'reason' },
  { title: t('preview.columns.updatedAt'), key: 'updatedAt' },
])

const histories = ref<History[]>([])
const document = ref<Document>()
const approvers = ref<ApproverState[]>([])
const attachments = ref<Attachment[]>([])
const internalRecipient = ref<InternalRecipient[]>([])
const documentReferences = ref<DocumentReference[]>([])
const isConfirmationDialogVisible = ref(false)
const isAllowToUpdate = ref(false)
const isRecallDialogVisible = ref(false)

const selectedTab = ref(0)
const selectedAttachment = ref<string>('')
const pdfInitialized = ref(false)

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
          title: t('preview.approveConfirm'),
          body: t('preview.comment'),
          buttonTitle: t('preview.approve'),
          type: 1
        })
  } else {
    confirmationDialogData.value = ({
          title: t('preview.rejectConfirm'),
          body: t('preview.comment'),
          buttonTitle: t('preview.reject'),
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

const stripHtml = (html: string): string => {
  if (!html) return ''
  let text = html
  text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
  text = text.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
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
  const tmp = window.document.createElement('div')
  tmp.innerHTML = text
  return tmp.textContent || tmp.innerText || ''
}

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
    const payload = { documentId, state, comment }

    const { error } = await useApi('/document/authorize', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
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

const recallDocument = async () => {
  try {
    const { error } = await useApi(`/document/${document.value?.id}/recall`, {
      method: 'POST',
      credentials: 'include',
    })
    if (error.value) {
      console.error('Recall error:', error.value)
      return
    }
    isRecallDialogVisible.value = false
    router.replace('/reguler/draft')
  } catch (e) {
    console.error(e)
    isRecallDialogVisible.value = false
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
      dueDate: payload.data.dueDate ?? null,
      isApprover: payload.data.isApprover,
      canRecall: payload.data.canRecall ?? false,
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
      signatureUrl: approver.signatureUrl,
      delegateName: approver.delegateName ?? null,
      onBehalfOf: approver.onBehalfOf ?? null,
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
    if (value === 1) return t('common.high')
    else if (value === 2) return t('common.medium')
    else if (value === 3) return t('common.low')
}

const documentType = (value: number | undefined) => {
    if (value === 1) return t('common.internal')
    else if (value === 2) return t('common.external')
}

const actionType = (value: boolean | undefined) => {
    if (value === true) return t('status.approved')
    else if (value === false) return t('status.rejected')
}

const statusType = (value: number | undefined) => {
    if (value === 0) return t('status.draft')
    else if (value === 1) return t('status.inProgress')
    else if (value === 2) return t('status.finish')
    else if (value === 3) return t('status.cancelled')
    else if (value === 99) return t('status.rejected')
}

const formatIndonesianDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '–'
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '–'
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function formatDate(input: string): string {
  const parts = input.trim().split(/\s+/);
  if (parts.length < 3) {
    return new Date(input).toLocaleString("en-US", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false
    });
  }
  const [datePart, timeWithFrac, tzRaw] = parts;
  const timePart = timeWithFrac.split(".")[0];
  const tzPart = tzRaw.replace(/([+-]\d{2})(\d{2})/, "$1:$2");
  const iso = `${datePart}T${timePart}${tzPart}`;
  const dt = new Date(iso);
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const day = String(dt.getDate()).padStart(2, "0");
  const mon = monthNames[dt.getMonth()];
  const year = dt.getFullYear();
  const hour = String(dt.getHours()).padStart(2, "0");
  const minute = String(dt.getMinutes()).padStart(2, "0");
  return `${day} ${mon} ${year}, ${hour}:${minute}`;
}

// View helpers
const isCurrentApprover = (index: number): boolean => {
  for (let i = 0; i < approvers.value.length; i++) {
    if (approvers.value[i].approved == null) return i === index
  }
  return false
}

const approverDotClass = (approver: ApproverState, index: number): string => {
  if (approver.approved === true) return 'tl-done'
  if (approver.approved === false) return 'tl-rejected'
  if (isCurrentApprover(index)) return 'tl-current'
  return 'tl-wait'
}

const statusChipClass = (status: number | undefined): string => {
  const map: Record<number, string> = { 0: 'chip-navy', 1: 'chip-amber', 2: 'chip-green', 3: 'chip-muted', 99: 'chip-red' }
  return map[status ?? -1] ?? 'chip-navy'
}

const priorityChipClass = (priority: number | null | undefined): string => {
  const map: Record<number, string> = { 1: 'chip-red', 2: 'chip-amber', 3: 'chip-green' }
  return map[priority ?? -1] ?? 'chip-navy'
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="doc-detail">

    <!-- ===== HEADER CARD ===== -->
    <VCard class="header-card mb-5">
      <div class="head-inner">
        <!-- Publication number badge -->
        <div v-if="document?.publicationValue" class="pub-badge">
          <VIcon size="13" class="mr-1">tabler-hash</VIcon>
          {{ document.publicationValue }}
        </div>

        <!-- Title -->
        <div class="head-top">
          <h1 class="doc-title">{{ stripHtml(document?.subject || '–') }}</h1>
        </div>

        <!-- Meta grid -->
        <div class="meta-grid-4">
          <div class="mg-cell">
            <div class="mg-k">STATUS</div>
            <div class="mg-v">{{ statusType(document?.status) ?? '–' }}</div>
          </div>
          <div class="mg-cell">
            <div class="mg-k">PRIORITAS</div>
            <div class="mg-v">{{ priorityType(document?.priority) ?? '–' }}</div>
          </div>
          <div class="mg-cell">
            <div class="mg-k">TIPE</div>
            <div class="mg-v">{{ documentType(Number(document?.type)) ?? '–' }}</div>
          </div>
          <div class="mg-cell">
            <div class="mg-k">TENGGAT</div>
            <div class="mg-v">{{ formatIndonesianDate(document?.dueDate) }}</div>
          </div>
        </div>
      </div>
    </VCard>

    <!-- ===== BODY LAYOUT ===== -->
    <VRow align="start">

      <!-- ── MAIN CONTENT ── -->
      <VCol cols="12" md="8">

        <!-- Body Card -->
        <VCard class="c-card mb-4">
          <div class="sec-h">
            <div class="sec-icon"><VIcon size="18">tabler-align-left</VIcon></div>
            <h2 class="sec-title">{{ $t('common.body') }}</h2>
          </div>
          <VDivider class="mb-4" />
          <div class="letter-body">{{ stripHtml(document?.body || '') }}</div>
        </VCard>

        <!-- References Card -->
        <VCard v-if="documentReferences.length > 0" class="c-card mb-4">
          <div class="sec-h">
            <div class="sec-icon"><VIcon size="18">tabler-link</VIcon></div>
            <h2 class="sec-title">{{ $t('preview.documentReferences') }}</h2>
            <span class="sec-cnt">{{ documentReferences.length }}</span>
          </div>
          <div v-for="(reference, index) in documentReferences" :key="index">
            <ReferenceItemView
              :subject="reference.title"
              :onRowTapped="() => openDocumentReference(reference.id)"
            />
          </div>
        </VCard>

        <!-- Attachments Card -->
        <VCard class="c-card mb-4">
          <div class="sec-h">
            <div class="sec-icon"><VIcon size="18">tabler-paperclip</VIcon></div>
            <h2 class="sec-title">{{ $t('preview.attachments') }}</h2>
            <span v-if="attachments.length > 0" class="sec-cnt">{{ attachments.length }}</span>
          </div>
          <div v-if="attachments.length === 0" class="attach-empty">
            <div class="ae-icon"><VIcon size="22">tabler-file-off</VIcon></div>
            <div>
              <p class="ae-p">Tidak ada lampiran</p>
              <span class="ae-s">Dokumen ini tidak memiliki file lampiran</span>
            </div>
          </div>
          <div v-for="(attachment, index) in attachments" :key="index">
            <FileRowView
              :file-name="attachment.originalName"
              :file-size="attachment.size ?? ''"
              :file-type="attachment.type"
              :file="null"
              :index="index"
              :onRowTapped="() => openInNewTab(attachment.path)"
            />
          </div>
        </VCard>

        <!-- Approval Activity Timeline -->
        <VCard class="c-card mb-4">
          <div class="sec-h">
            <div class="sec-icon"><VIcon size="18">tabler-timeline</VIcon></div>
            <h2 class="sec-title">{{ $t('preview.approvalActivity') }}</h2>
            <span v-if="approvers.length > 0" class="sec-cnt">{{ approvers.length }}</span>
          </div>
          <VDivider class="mb-5" />

          <div class="tl-wrap">
            <div
              v-for="(approver, index) in approvers"
              :key="index"
              class="tl-node"
              :class="{ 'tl-last': index === approvers.length - 1 }"
            >
              <!-- Dot -->
              <div class="tl-left">
                <div class="tl-dot" :class="approverDotClass(approver, index)">
                  <VIcon v-if="approver.approved === true" size="16" color="white">tabler-check</VIcon>
                  <VIcon v-else-if="approver.approved === false" size="16" color="white">tabler-x</VIcon>
                </div>
              </div>

              <!-- Content -->
              <div class="tl-body">
                <div class="tl-row1">
                  <div>
                    <span class="tl-name">{{ approver.name }}</span>
                    <span class="tl-role"> · {{ approver.title }}</span>
                  </div>
                  <span v-if="approver.approved != null" class="tl-time">{{ formatToWeekdayTime(approver.date ?? '') }}</span>
                </div>

                <div v-if="approver.approved === true" class="tl-state tl-ok">{{ $t('preview.accepted') }}</div>
                <div v-else-if="approver.approved === false" class="tl-state tl-rej">{{ $t('status.rejected') }}</div>
                <div v-else-if="isCurrentApprover(index)" class="tl-state tl-now">Menunggu persetujuan</div>
                <div v-else class="tl-state tl-wait-s">Belum giliran</div>

                <VChip v-if="approver.onBehalfOf" size="x-small" color="info" variant="tonal" prepend-icon="tabler-transfer" class="mt-1">
                  via {{ approver.onBehalfOf }}
                </VChip>
                <VChip v-if="approver.approved == null && approver.delegateName" size="x-small" color="warning" variant="tonal" prepend-icon="tabler-transfer" class="mt-1">
                  Delegasi ke {{ approver.delegateName }}
                </VChip>

                <div v-if="approver.signature && approver.signatureUrl" class="tl-sig">
                  <div class="tl-sig-lbl">{{ $t('preview.digitalSignature') }}:</div>
                  <img :src="approver.signatureUrl" alt="Digital Signature" class="tl-sig-img" />
                </div>
              </div>
            </div>
          </div>
        </VCard>

        <!-- Approval History Table -->
        <VCard class="c-card">
          <div class="sec-h">
            <div class="sec-icon"><VIcon size="18">tabler-history</VIcon></div>
            <h2 class="sec-title">{{ $t('preview.approvalHistory') }}</h2>
            <span v-if="histories.length > 0" class="sec-cnt">{{ histories.length }}</span>
          </div>
          <VDivider />

          <VDataTable
            :headers="headers"
            :items="histories"
            :items-per-page="10"
          >
            <template #item.name="{ item }">
              <div class="hist-who">
                <div class="hist-av">{{ item.name.charAt(0).toUpperCase() }}</div>
                <div>
                  <div class="hist-nm">{{ item.name }} - {{ item.title }}</div>
                </div>
              </div>
            </template>
            <template #item.isApproved="{ item }">
              <VChip :color="item.isApproved ? 'success' : 'error'" size="small" variant="tonal">
                {{ actionType(item.isApproved) }}
              </VChip>
            </template>
            <template #item.reason="{ item }">
              <span class="hist-reason">{{ item.reason }}</span>
            </template>
            <template #item.updatedAt="{ item }">
              <span class="hist-date">{{ formatDate(item.updatedAt) }}</span>
            </template>
          </VDataTable>
        </VCard>

      </VCol>

      <!-- ── RAIL ── -->
      <VCol cols="12" md="4">
        <div class="rail-sticky">

          <!-- Detail Info -->
          <VCard class="c-card mb-4">
            <div class="sec-h">
              <div class="sec-icon"><VIcon size="18">tabler-info-circle</VIcon></div>
              <h2 class="sec-title">{{ $t('preview.detailInfo') }}</h2>
            </div>
            <VDivider class="mb-2" />

            <div class="meta-list">
              <div v-if="internalRecipient?.length > 0" class="ml-row">
                <div class="ml-icon"><VIcon size="18">tabler-users</VIcon></div>
                <div class="ml-text">
                  <div class="ml-k">{{ $t('preview.internalRecipients') }}</div>
                  <div v-for="r in internalRecipient" :key="r.name" class="ml-v">{{ r.name }} · {{ r.title }}</div>
                </div>
              </div>

              <div v-if="document?.externalRecipient != ''" class="ml-row">
                <div class="ml-icon"><VIcon size="18">tabler-mail</VIcon></div>
                <div class="ml-text">
                  <div class="ml-k">{{ $t('preview.externalRecipients') }}</div>
                  <div class="ml-v">{{ document?.externalRecipient }}</div>
                </div>
              </div>
            </div>
          </VCard>

          <!-- Actions -->
          <VCard class="c-card">
            <div class="ap-head">
              <div class="ap-icon">
                <VIcon size="21" color="white">tabler-shield-check</VIcon>
              </div>
              <div>
                <h3 class="ap-title">Tindakan</h3>
                <p v-if="document?.isApprover" class="ap-sub">Diperlukan tindakan Anda</p>
                <p v-else class="ap-sub">Pratinjau dokumen</p>
              </div>
            </div>

            <div class="actions-list">
              <!-- PDF Preview -->
              <button
                class="act act-pdf"
                @click="generatePDF"
                :disabled="pdfViewComponent?.isGeneratingPDF"
              >
                <VIcon size="19">tabler-file-type-pdf</VIcon>
                {{ $t('preview.pdfPreview') }}
                <VProgressCircular v-if="pdfViewComponent?.isGeneratingPDF" indeterminate size="16" width="2" class="ml-1" />
              </button>

              <!-- Update Document -->
              <button
                v-if="isAllowToUpdate"
                class="act act-update"
                @click="updateDocument"
              >
                <VIcon size="19">tabler-edit</VIcon>
                {{ $t('preview.updateDocument') }}
              </button>

              <!-- Approve + Reject -->
              <div v-if="document?.isApprover" class="act-row">
                <button class="act act-reject" @click="showAuthorizationDialog(false)">
                  <VIcon size="19">tabler-x</VIcon>
                  {{ $t('preview.reject') }}
                </button>
                <button class="act act-approve" @click="showAuthorizationDialog(true)">
                  <VIcon size="19">tabler-check</VIcon>
                  {{ $t('preview.approve') }}
                </button>
              </div>

              <!-- Recall -->
              <button
                v-if="document?.canRecall"
                class="act act-recall"
                @click="isRecallDialogVisible = true"
              >
                <VIcon size="19">tabler-rotate-counterclockwise</VIcon>
                {{ $t('preview.recall') }}
              </button>
            </div>
          </VCard>

        </div>
      </VCol>
    </VRow>

    <!-- ===== HIDDEN PDF VIEW ===== -->
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

    <!-- ===== CONFIRMATION DIALOG ===== -->
    <VDialog
      v-model="isConfirmationDialogVisible"
      persistent
      class="v-dialog-sm"
    >
      <DialogCloseBtn @click="isConfirmationDialogVisible = !isConfirmationDialogVisible" />
      <VCard :title="confirmationDialogData.title">
        <VCardText>{{ confirmationDialogData.body }}</VCardText>
        <AppTextarea
          class="ml-6 mr-6"
          :placeholder="$t('preview.commentPh')"
          v-model="authorizationComment"
        />
        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn color="secondary" variant="tonal" @click="isConfirmationDialogVisible = false">
            {{ $t('preview.cancel') }}
          </VBtn>
          <VBtn color="success" v-if="confirmationDialogData.type == 1" @click="authorization(true)">
            {{ confirmationDialogData.buttonTitle }}
          </VBtn>
          <VBtn
            color="error"
            :disabled="authorizationComment == ''"
            v-if="confirmationDialogData.type == 2"
            @click="authorization(false)"
          >
            {{ confirmationDialogData.buttonTitle }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- ===== RECALL DIALOG ===== -->
    <VDialog v-model="isRecallDialogVisible" max-width="480">
      <VCard>
        <VCardText class="pa-6">
          <h5 class="text-h5 mb-2">{{ $t('preview.recallConfirmTitle') }}</h5>
          <p class="text-body-1 mb-4">{{ $t('preview.recallConfirmBody') }}</p>
          <div class="d-flex justify-end gap-3">
            <VBtn variant="tonal" @click="isRecallDialogVisible = false">
              {{ $t('preview.recallCancelBtn') }}
            </VBtn>
            <VBtn color="warning" @click="recallDocument">
              {{ $t('preview.recallConfirmBtn') }}
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VDialog>

  </div>
</template>

<style scoped>
/* ── CSS Variables ── */
.doc-detail {
  --c-navy: oklch(0.44 0.115 264);
  --c-navy-tint: oklch(0.955 0.028 264);
  --c-navy-tint-2: oklch(0.92 0.04 264);
  --c-ink-strong: oklch(0.27 0.018 262);
  --c-ink: oklch(0.46 0.015 262);
  --c-muted: oklch(0.62 0.012 262);
  --c-faint: oklch(0.72 0.01 262);
  --c-line: oklch(0.925 0.005 262);
  --c-line-soft: oklch(0.952 0.004 262);
  --c-green: oklch(0.60 0.12 162);
  --c-green-tint: oklch(0.95 0.05 162);
  --c-red: oklch(0.585 0.205 24);
  --c-red-tint: oklch(0.955 0.04 24);
  --c-amber: oklch(0.70 0.15 66);
  --c-amber-deep: oklch(0.5 0.13 66);
  --c-amber-tint: oklch(0.95 0.06 80);
  --c-blue: oklch(0.55 0.18 263);
}

/* ── Header Card ── */
.header-card {
  border-radius: 18px !important;
}
.head-inner {
  padding: 24px 28px;
}

.pub-badge {
  display: inline-flex;
  align-items: center;
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c-navy);
  background: var(--c-navy-tint);
  border: 1px solid var(--c-navy-tint-2);
  padding: 6px 12px;
  border-radius: 9px;
  margin-bottom: 12px;
  letter-spacing: -0.01em;
}

.doc-title {
  margin: 0 0 12px;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.028em;
  color: var(--c-ink-strong);
  line-height: 1.15;
}

/* Chips */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1;
  padding: 7px 12px 7px 10px;
  border-radius: 9px;
  white-space: nowrap;
}
.chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 99px;
  flex: none;
}
.chip-navy  { color: var(--c-navy);                   background: var(--c-navy-tint); }
.chip-navy .chip-dot  { background: var(--c-navy); }
.chip-amber { color: var(--c-amber-deep);              background: var(--c-amber-tint); }
.chip-amber .chip-dot { background: var(--c-amber); }
.chip-green { color: oklch(0.42 0.13 162);             background: var(--c-green-tint); }
.chip-green .chip-dot { background: var(--c-green); }
.chip-red   { color: oklch(0.5 0.2 24);               background: var(--c-red-tint); }
.chip-red .chip-dot   { background: var(--c-red); }
.chip-muted { color: var(--c-muted);                   background: oklch(0.965 0.004 262); }
.chip-muted .chip-dot { background: var(--c-faint); }

/* Meta grid 4-col */
.meta-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 1px solid var(--c-line);
  border-radius: 14px;
  overflow: hidden;
}
.mg-cell {
  padding: 14px 18px;
  border-right: 1px solid var(--c-line-soft);
  min-width: 0;
}
.mg-cell:last-child { border-right: 0; }
.mg-k {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-muted);
}
.mg-v {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--c-ink-strong);
  margin-top: 7px;
  letter-spacing: -0.01em;
}
.mg-mono {
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 13px;
}

/* ── General Card ── */
.c-card {
  border-radius: 18px !important;
  padding: 24px 26px;
}

/* ── Section Header ── */
.sec-h {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}
.sec-icon {
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 10px;
  background: var(--c-navy-tint);
  color: var(--c-navy);
  display: grid;
  place-items: center;
}
.sec-title {
  margin: 0;
  font-size: 15.5px;
  font-weight: 800;
  letter-spacing: -0.018em;
  color: var(--c-ink-strong);
  flex: 1;
}
.sec-cnt {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-muted);
  background: oklch(0.965 0.004 262);
  border: 1px solid var(--c-line);
  padding: 4px 10px;
  border-radius: 8px;
}

/* ── Letter body ── */
.letter-body {
  font-size: 14.5px;
  line-height: 1.75;
  color: var(--c-ink);
  font-weight: 500;
}

/* ── Attachments empty state ── */
.attach-empty {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 16px;
  border: 1.5px dashed var(--c-line);
  border-radius: 12px;
  background: oklch(0.984 0.003 262);
}
.ae-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid var(--c-line);
  color: var(--c-faint);
  display: grid;
  place-items: center;
  flex: none;
}
.ae-p  { margin: 0; font-size: 13.5px; font-weight: 700; color: var(--c-ink-strong); }
.ae-s  { font-size: 12px; font-weight: 500; color: var(--c-faint); }

/* ── Timeline ── */
.tl-wrap { padding-left: 4px; }
.tl-node {
  position: relative;
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 14px;
  padding-bottom: 28px;
}
.tl-node:not(.tl-last)::before {
  content: "";
  position: absolute;
  left: 16px;
  top: 34px;
  bottom: 0;
  width: 2px;
  background: var(--c-line);
}

.tl-left { z-index: 1; }
.tl-dot {
  width: 34px;
  height: 34px;
  border-radius: 99px;
  display: grid;
  place-items: center;
  border: 3px solid #fff;
  position: relative;
}
.tl-done     { background: var(--c-green); box-shadow: 0 0 0 1px oklch(0.88 0.06 162); }
.tl-rejected { background: var(--c-red);   box-shadow: 0 0 0 1px oklch(0.88 0.06 24); }
.tl-current  { background: #fff; box-shadow: 0 0 0 2px var(--c-blue); }
.tl-current::after {
  content: "";
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 99px;
  background: var(--c-blue);
  animation: tl-pulse 1.8s ease-in-out infinite;
}
.tl-wait { background: oklch(0.95 0.004 262); }
@keyframes tl-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: .45; transform: scale(.7); }
}

.tl-body { padding-top: 5px; min-width: 0; }
.tl-row1 {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.tl-name  { font-size: 14.5px; font-weight: 700; color: var(--c-ink-strong); letter-spacing: -0.01em; }
.tl-role  { font-size: 13.5px; font-weight: 500; color: var(--c-muted); }
.tl-time  { font-size: 12px;   font-weight: 600; color: var(--c-faint); white-space: nowrap; }
.tl-state { font-size: 13px;   font-weight: 600; margin-top: 3px; }
.tl-ok     { color: var(--c-green); }
.tl-rej    { color: var(--c-red); }
.tl-now    { color: var(--c-blue); }
.tl-wait-s { color: var(--c-faint); }

.tl-sig     { margin-top: 10px; }
.tl-sig-lbl { font-size: 12px; font-weight: 600; color: var(--c-muted); margin-bottom: 6px; }
.tl-sig-img {
  max-width: 200px;
  max-height: 100px;
  object-fit: contain;
  border: 1px solid var(--c-line);
  padding: 8px;
  border-radius: 6px;
}

/* ── History table ── */
.hist-who { display: flex; align-items: center; gap: 10px; }
.hist-av  {
  width: 32px; height: 32px; border-radius: 99px; flex: none;
  display: grid; place-items: center;
  font-size: 12px; font-weight: 800; color: #fff; background: var(--c-navy);
}
.hist-nm     { font-weight: 700; color: var(--c-ink-strong); font-size: 13.5px; }
.hist-reason { font-size: 13.5px; color: var(--c-ink); }
.hist-date   { font-family: "JetBrains Mono", "Courier New", monospace; font-size: 12.5px; color: var(--c-muted); }

/* ── Meta list (rail) ── */
.meta-list { display: flex; flex-direction: column; }
.ml-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 0;
  border-top: 1px solid var(--c-line-soft);
}
.ml-row:first-child { border-top: 0; padding-top: 2px; }
.ml-icon {
  width: 36px; height: 36px; flex: none;
  border-radius: 10px;
  background: oklch(0.967 0.004 262);
  color: var(--c-muted);
  display: grid; place-items: center;
}
.ml-k { font-size: 11.5px; font-weight: 600; color: var(--c-muted); letter-spacing: 0.01em; }
.ml-v { font-size: 14px; font-weight: 700; color: var(--c-ink-strong); letter-spacing: -0.01em; margin-top: 2px; }

/* ── Action panel ── */
.ap-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--c-line-soft);
}
.ap-icon {
  width: 40px; height: 40px; border-radius: 11px;
  background: var(--c-navy);
  display: grid; place-items: center; flex: none;
  box-shadow: 0 10px 22px -12px oklch(0.44 0.115 264 / 70%);
}
.ap-title { margin: 0; font-size: 15px; font-weight: 800; color: var(--c-ink-strong); letter-spacing: -0.015em; }
.ap-sub   { margin: 3px 0 0; font-size: 12.5px; font-weight: 500; color: var(--c-muted); }

.actions-list { display: flex; flex-direction: column; gap: 10px; }

.act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 50px;
  padding: 0 18px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  border-radius: 13px;
  cursor: pointer;
  transition: 0.18s;
  white-space: nowrap;
  border: 1.5px solid transparent;
  width: 100%;
  outline: none;
}
.act:disabled { opacity: 0.6; cursor: not-allowed; }

.act-pdf    { background: #fff; color: var(--c-navy); border-color: oklch(0.88 0.025 264); }
.act-pdf:hover:not(:disabled) { background: var(--c-navy-tint); border-color: var(--c-navy); }

.act-update { background: var(--c-navy); color: #fff; box-shadow: 0 10px 22px -12px oklch(0.44 0.115 264 / 60%); }
.act-update:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }

.act-row { display: flex; gap: 10px; }
.act-row .act { flex: 1; }

.act-approve { background: var(--c-green); color: #fff; box-shadow: 0 12px 24px -12px oklch(0.60 0.12 162 / 70%); }
.act-approve:hover:not(:disabled) { filter: brightness(1.05); transform: translateY(-1px); }

.act-reject { background: #fff; color: var(--c-red); border-color: oklch(0.88 0.05 24); }
.act-reject:hover:not(:disabled) { background: var(--c-red-tint); border-color: var(--c-red); }

.act-recall { background: #fff; color: var(--c-amber-deep); border-color: oklch(0.86 0.07 80); }
.act-recall:hover:not(:disabled) { background: var(--c-amber-tint); border-color: var(--c-amber); }

/* ── Sticky rail ── */
.rail-sticky {
  position: sticky;
  top: 88px;
}

/* ── Responsive ── */
@media (max-width: 959px) {
  .meta-grid-4 { grid-template-columns: repeat(2, 1fr); }
  .mg-cell:nth-child(2) { border-right: 0; }
  .mg-cell:nth-child(1),
  .mg-cell:nth-child(2) { border-bottom: 1px solid var(--c-line-soft); }
  .rail-sticky { position: static; }
  .doc-title { font-size: 22px; }
}
@media (max-width: 599px) {
  .head-inner { padding: 20px 18px; }
  .c-card     { padding: 20px 18px; }
  .doc-title  { font-size: 20px; }
}
</style>
