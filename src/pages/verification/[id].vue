<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

definePage({
  meta: {
    layout: 'blank',
  },
})

const route = useRoute()
const { t } = useI18n()

interface VerificationData {
  subject: string
  body: string
  documentNumber: string
  organizationName: string
  approvalDate: string
  lastApproverName: string
  type: number
  companyLogoUrl: string
  companyAddress: string
  companyCity: string
  companyPhone: string
  companyEmail: string
  companyDescription: string
}

const data = ref<VerificationData | null>(null)
const isLoading = ref(true)
const notFound = ref(false)

const fetchVerification = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'
    const res = await fetch(`${baseUrl}/verification/${route.params.id}`)
    const json = await res.json()
    if (json.success && json.data) {
      data.value = json.data
    } else {
      notFound.value = true
    }
  } catch {
    notFound.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchVerification()
})
</script>

<template>
  <div class="verification-page">

    <!-- Loading -->
    <div v-if="isLoading" class="state-center">
      <VProgressCircular indeterminate color="primary" size="48" />
    </div>

    <!-- Not Found -->
    <div v-else-if="notFound" class="state-center">
      <VIcon icon="tabler-file-unknown" size="80" color="secondary" class="mb-4" />
      <h2 class="text-h5 font-weight-bold mb-2">{{ t('verification.notFound') }}</h2>
      <p class="text-body-2 text-secondary text-center">{{ t('verification.notFoundDesc') }}</p>
    </div>

    <!-- Verified Document -->
    <div v-else-if="data" class="verified-wrapper">

      <!-- ── Verified badge banner ── -->
      <VCard class="verification-banner mb-6" rounded="lg" elevation="2">
        <VCardText class="pa-5">
          <div class="d-flex align-center gap-3 mb-4">
            <VIcon icon="tabler-shield-check" color="success" size="32" />
            <div>
              <div class="text-h6 font-weight-bold">{{ t('verification.pageTitle') }}</div>
              <div class="text-caption text-secondary">{{ t('verification.pageSubtitle') }}</div>
            </div>
            <VSpacer />
            <VChip color="success" variant="tonal" prepend-icon="tabler-circle-check" size="small">
              {{ t('verification.verifiedBadge') }}
            </VChip>
          </div>

          <VDivider class="mb-4" />

          <VRow>
            <VCol cols="12" sm="6" md="3">
              <div class="info-block">
                <div class="text-caption text-secondary text-uppercase font-weight-medium mb-1">
                  {{ t('verification.issuedBy') }}
                </div>
                <div class="text-body-2 font-weight-semibold">{{ data.organizationName || '-' }}</div>
              </div>
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <div class="info-block">
                <div class="text-caption text-secondary text-uppercase font-weight-medium mb-1">
                  {{ t('verification.documentNumber') }}
                </div>
                <div class="text-body-2 font-weight-semibold">{{ data.documentNumber || '-' }}</div>
              </div>
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <div class="info-block">
                <div class="text-caption text-secondary text-uppercase font-weight-medium mb-1">
                  {{ t('verification.approvalDate') }}
                </div>
                <div class="text-body-2 font-weight-semibold">{{ data.approvalDate || '-' }}</div>
              </div>
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <div class="info-block">
                <div class="text-caption text-secondary text-uppercase font-weight-medium mb-1">
                  {{ t('verification.approvedBy') }}
                </div>
                <div class="text-body-2 font-weight-semibold">{{ data.lastApproverName || '-' }}</div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- ── Letter Preview ── -->
      <div class="letter-paper">

            <!-- Letterhead — only rendered when at least a name or logo is configured -->
            <div
              v-if="data.organizationName || data.companyLogoUrl"
              class="lh-root"
            >
              <div class="lh-logo-wrap" v-if="data.companyLogoUrl">
                <img :src="data.companyLogoUrl" alt="Logo" class="lh-logo" />
              </div>
              <div class="lh-info">
                <div class="lh-company-name">{{ data.organizationName }}</div>
                <div class="lh-company-sub" v-if="data.companyAddress || data.companyCity">
                  {{ [data.companyAddress, data.companyCity].filter(Boolean).join(' | ') }}
                </div>
                <div class="lh-company-contact" v-if="data.companyPhone || data.companyEmail">
                  {{ [data.companyPhone ? 'Telp: ' + data.companyPhone : '', data.companyEmail ? 'Email: ' + data.companyEmail : ''].filter(Boolean).join(' | ') }}
                </div>
                <div class="lh-company-desc" v-if="data.companyDescription">
                  {{ data.companyDescription }}
                </div>
              </div>
            </div>

            <!-- Doc meta: date, number, type -->
            <div class="doc-meta">
              <div>{{ data.approvalDate }}</div>
              <div v-if="data.documentNumber">No: <strong>{{ data.documentNumber }}</strong></div>
              <div>Sifat: {{ data.type === 1 ? 'Internal' : 'External' }}</div>
            </div>

            <!-- Subject -->
            <div class="subject-line" v-if="data.subject">
              <span class="subject-label">Perihal&nbsp;:</span>
              <span class="subject-value">{{ data.subject }}</span>
            </div>

            <div class="divider-thin" />

            <!-- Body -->
            <div class="letter-body" v-html="data.body" />

            <!-- Closing / footer note -->
            <div class="letter-closing">
              <p>Hormat kami,</p>
              <p class="approver-name">{{ data.lastApproverName }}</p>
            </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
/* ── Page shell — grey viewer background ── */
.verification-page {
  min-height: 100vh;
  background: #e8e8e8;
  padding: 2.5rem 1rem 4rem;
}

.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.verified-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ── Banner: same width as paper ── */
.verification-banner {
  width: 210mm;
  border-left: 4px solid rgb(var(--v-theme-success));
  margin-bottom: 1.5rem;
}

.info-block {
  padding: 0.25rem 0;
}

/* ── A4 Paper ── */
.letter-paper {
  width: 210mm;
  min-height: 297mm;
  padding: 18mm 20mm;
  background: #ffffff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.22);
  font-family: 'Times New Roman', Times, serif;
  font-size: 11pt;
  color: #1a1a1a;
  line-height: 1.6;
  box-sizing: border-box;
}

/* ── Letterhead ── */
.lh-root {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 12px;
  border-bottom: 3px solid #1a1a1a;
}

.lh-logo-wrap {
  flex-shrink: 0;
}

.lh-logo {
  width: 68px;
  height: 68px;
  object-fit: contain;
  display: block;
}

.lh-info {
  flex: 1;
  text-align: center;
  line-height: 1.35;
}

.lh-company-name {
  font-size: 18pt;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 0.4px;
  margin-bottom: 3px;
}

.lh-company-sub {
  font-size: 9pt;
  color: #555;
  margin-bottom: 2px;
}

.lh-company-contact {
  font-size: 9pt;
  color: #555;
}

.lh-company-desc {
  font-size: 8.5pt;
  color: #888;
  font-style: italic;
  margin-top: 3px;
}

/* ── Doc meta ── */
.doc-meta {
  margin-top: 22px;
  margin-left: auto;
  text-align: right;
  font-size: 10.5pt;
  line-height: 1.65;
  width: fit-content;
}

.doc-meta div { margin: 0; }

/* ── Subject ── */
.subject-line {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  font-size: 11pt;
  align-items: baseline;
}

.subject-label {
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.subject-value {
  font-weight: 700;
  text-decoration: underline;
}

/* ── Divider ── */
.divider-thin {
  border: none;
  border-top: 1px solid #ccc;
  margin: 14px 0;
}

/* ── Body ── */
.letter-body {
  font-size: 11pt;
  line-height: 1.75;
  text-align: justify;
  word-break: break-word;
  margin-bottom: 24px;
}

.letter-body :deep(p)          { margin-bottom: 10px; }
.letter-body :deep(p:last-child) { margin-bottom: 0; }
.letter-body :deep(strong),
.letter-body :deep(b)          { font-weight: 700; }
.letter-body :deep(em),
.letter-body :deep(i)          { font-style: italic; }
.letter-body :deep(u)          { text-decoration: underline; }
.letter-body :deep(ul),
.letter-body :deep(ol)         { padding-left: 20px; margin-bottom: 10px; }
.letter-body :deep(li)         { margin-bottom: 4px; }
.letter-body :deep(h1)         { font-size: 14pt; font-weight: 700; margin-bottom: 8px; }
.letter-body :deep(h2)         { font-size: 13pt; font-weight: 700; margin-bottom: 7px; }
.letter-body :deep(h3)         { font-size: 12pt; font-weight: 700; margin-bottom: 6px; }

/* ── Closing ── */
.letter-closing {
  margin-top: 28px;
  font-size: 11pt;
}

.letter-closing p { margin: 0; }

.approver-name {
  margin-top: 48px !important;
  font-weight: 700;
  border-top: 1px solid #333;
  display: inline-block;
  padding-top: 4px;
  min-width: 180px;
}

/* ── Responsive: scroll horizontally on small screens ── */
@media (max-width: 240mm) {
  .verification-page {
    padding: 1rem 0;
  }

  .verified-wrapper {
    align-items: flex-start;
    overflow-x: auto;
  }
}
</style>
