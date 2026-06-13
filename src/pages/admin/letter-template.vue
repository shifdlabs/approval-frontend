<script setup lang="ts">
import TiptapEditor from '@/@core/components/TiptapEditor.vue'
import { LetterTemplate } from '@/models/document/letter-template'

const { t } = useI18n()

const templates = ref<LetterTemplate[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const isDeleting = ref(false)

// Dialog states
const isFormDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isPreviewDialogOpen = ref(false)
const editingTemplate = ref<LetterTemplate | null>(null)
const deletingId = ref<string | null>(null)
const previewTemplate = ref<LetterTemplate | null>(null)

// Form state
const formName = ref('')
const formDescription = ref('')
const formBody = ref('')
const formError = ref('')

const LOREM_IPSUM = `<p>Sehubungan dengan keperluan yang ada, bersama surat ini kami sampaikan bahwa <strong>Lorem Ipsum</strong> adalah contoh teks yang digunakan dalam industri percetakan dan penataan huruf. Lorem ipsum telah menjadi teks acak standar yang digunakan industri sejak tahun 1500-an.</p>
<p>Adapun hal-hal yang perlu diperhatikan adalah sebagai berikut:</p>
<ul>
  <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
  <li>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
  <li>Ut enim ad minim veniam, quis nostrud exercitation.</li>
</ul>
<p>Demikian surat ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.</p>`

// Fetch all templates
const fetchTemplates = async () => {
  isLoading.value = true
  try {
    const res = await useApi('/template', { method: 'GET' })
    const json = res.data.value as any
    if (json?.success) {
      templates.value = json.data ?? []
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchTemplates)

// Open create dialog
const openCreateDialog = () => {
  editingTemplate.value = null
  formName.value = ''
  formDescription.value = ''
  formBody.value = ''
  formError.value = ''
  isFormDialogOpen.value = true
}

// Open edit dialog
const openEditDialog = (tpl: LetterTemplate) => {
  editingTemplate.value = tpl
  formName.value = tpl.name
  formDescription.value = tpl.description
  formBody.value = tpl.body
  formError.value = ''
  isFormDialogOpen.value = true
}

// Save (create or update)
const saveTemplate = async () => {
  if (!formName.value.trim()) {
    formError.value = 'Nama template wajib diisi'
    return
  }
  isSaving.value = true
  formError.value = ''
  try {
    const isEdit = !!editingTemplate.value
    const url = isEdit ? `/template/${editingTemplate.value!.id}` : '/template'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await useApi(url, {
      method,
      body: JSON.stringify({ name: formName.value.trim(), description: formDescription.value.trim(), body: formBody.value }),
    })
    const json = res.data.value as any
    if (json?.success) {
      isFormDialogOpen.value = false
      await fetchTemplates()
    } else {
      formError.value = 'Gagal menyimpan template'
    }
  } catch {
    formError.value = 'Terjadi kesalahan'
  } finally {
    isSaving.value = false
  }
}

// Open delete confirmation
const openDeleteDialog = (id: string) => {
  deletingId.value = id
  isDeleteDialogOpen.value = true
}

// Confirm delete
const confirmDelete = async () => {
  if (!deletingId.value) return
  isDeleting.value = true
  try {
    const res = await useApi(`/template/${deletingId.value}`, { method: 'DELETE' })
    const json = res.data.value as any
    if (json?.success) {
      isDeleteDialogOpen.value = false
      deletingId.value = null
      await fetchTemplates()
    }
  } finally {
    isDeleting.value = false
  }
}

// Open preview
const openPreview = (tpl: LetterTemplate) => {
  previewTemplate.value = tpl
  isPreviewDialogOpen.value = true
}

// Preview body: jika template body kosong, pakai lorem ipsum
const previewBody = computed(() => previewTemplate.value?.body || LOREM_IPSUM)
</script>

<template>
  <div>
    <!-- Header -->
    <VCard class="mb-6">
      <VCardText class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5">
        <div>
          <div class="text-h6 font-weight-bold">{{ t('nav.letterTemplate') }}</div>
          <div class="text-body-2 text-secondary mt-1">Kelola template surat yang bisa digunakan oleh reguler user saat membuat dokumen.</div>
        </div>
        <VBtn color="primary" prepend-icon="tabler-plus" @click="openCreateDialog">
          Buat Template
        </VBtn>
      </VCardText>
    </VCard>

    <!-- Loading -->
    <div v-if="isLoading" class="d-flex justify-center pa-8">
      <VProgressCircular indeterminate color="primary" />
    </div>

    <!-- Empty state -->
    <VCard v-else-if="templates.length === 0" class="text-center pa-10">
      <VIcon icon="tabler-file-off" size="64" color="secondary" class="mb-4" />
      <div class="text-h6 mb-2">Belum ada template</div>
      <div class="text-body-2 text-secondary mb-4">Buat template surat pertama untuk membantu reguler user.</div>
      <VBtn color="primary" prepend-icon="tabler-plus" @click="openCreateDialog">Buat Template</VBtn>
    </VCard>

    <!-- Template cards -->
    <VRow v-else>
      <VCol
        v-for="tpl in templates"
        :key="tpl.id"
        cols="12"
        sm="6"
        lg="4"
      >
        <VCard height="100%" class="d-flex flex-column">
          <VCardText class="flex-grow-1 pb-2">
            <div class="d-flex align-start justify-space-between gap-2">
              <div>
                <div class="text-subtitle-1 font-weight-bold text-truncate" style="max-width: 220px;">{{ tpl.name }}</div>
                <div v-if="tpl.description" class="text-caption text-secondary mt-1 text-truncate" style="max-width: 220px;">{{ tpl.description }}</div>
              </div>
              <VChip size="x-small" color="primary" variant="tonal">Template</VChip>
            </div>

            <!-- Body preview snippet -->
            <div
              class="mt-3 text-body-2 text-secondary template-body-preview"
              v-html="tpl.body || '<em>Tidak ada konten</em>'"
            />
          </VCardText>

          <VDivider />
          <VCardActions class="pa-3 gap-2">
            <VBtn size="small" variant="tonal" color="info" prepend-icon="tabler-eye" @click="openPreview(tpl)">
              Preview
            </VBtn>
            <VSpacer />
            <VBtn size="small" variant="text" color="primary" icon="tabler-pencil" @click="openEditDialog(tpl)" />
            <VBtn size="small" variant="text" color="error" icon="tabler-trash" @click="openDeleteDialog(tpl.id)" />
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>

    <!-- ── Create/Edit Dialog ── -->
    <VDialog v-model="isFormDialogOpen" max-width="760" persistent>
      <VCard>
        <VCardTitle class="pa-5 pb-3">
          {{ editingTemplate ? 'Edit Template' : 'Buat Template Baru' }}
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-5">
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formName"
                label="Nama Template *"
                placeholder="cth: Surat Tugas, Surat Keputusan"
                :rules="[(v: string) => !!v || 'Wajib diisi']"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="formDescription"
                label="Deskripsi (opsional)"
                placeholder="Jelaskan kegunaan template ini"
              />
            </VCol>
            <VCol cols="12">
              <div class="text-subtitle-2 mb-2 font-weight-medium">Isi Template</div>
              <TiptapEditor
                v-model="formBody"
                class="border rounded"
                style="min-height: 220px;"
              />
              <div class="text-caption text-secondary mt-1">Isi ini akan otomatis mengisi body surat saat user memilih template ini.</div>
            </VCol>
          </VRow>

          <VAlert v-if="formError" type="error" variant="tonal" class="mt-3">{{ formError }}</VAlert>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-4 gap-3">
          <VBtn variant="outlined" @click="isFormDialogOpen = false" :disabled="isSaving">Batal</VBtn>
          <VSpacer />
          <VBtn color="primary" :loading="isSaving" @click="saveTemplate">
            {{ editingTemplate ? 'Simpan Perubahan' : 'Buat Template' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- ── Delete Confirmation Dialog ── -->
    <VDialog v-model="isDeleteDialogOpen" max-width="440">
      <VCard>
        <VCardText class="pa-5 text-center">
          <VIcon icon="tabler-alert-triangle" size="56" color="error" class="mb-3" />
          <div class="text-h6 mb-2">Hapus Template?</div>
          <div class="text-body-2 text-secondary">Template yang dihapus tidak bisa dikembalikan. Dokumen yang sudah dibuat menggunakan template ini tidak akan terpengaruh.</div>
        </VCardText>
        <VCardActions class="pa-4 pt-0 gap-3">
          <VBtn variant="outlined" @click="isDeleteDialogOpen = false" :disabled="isDeleting">Batal</VBtn>
          <VSpacer />
          <VBtn color="error" :loading="isDeleting" @click="confirmDelete">Hapus</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- ── Preview Dialog ── -->
    <VDialog v-model="isPreviewDialogOpen" max-width="860" scrollable>
      <VCard>
        <VCardTitle class="pa-5 pb-3 d-flex align-center justify-space-between">
          <span>Preview: {{ previewTemplate?.name }}</span>
          <VBtn icon="tabler-x" variant="text" size="small" @click="isPreviewDialogOpen = false" />
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4" style="background: #e8e8e8; overflow-y: auto;">
          <!-- A4 Paper preview with lorem ipsum -->
          <div class="preview-paper">
            <!-- Letterhead placeholder -->
            <div class="preview-lh">
              <div class="preview-lh-logo" />
              <div class="preview-lh-info">
                <div class="preview-company-name">Nama Perusahaan Anda</div>
                <div class="preview-company-sub">Alamat Perusahaan | Kota</div>
                <div class="preview-company-sub">Telp: (021) 000-0000 | Email: info@perusahaan.com</div>
              </div>
            </div>

            <!-- Doc meta -->
            <div class="preview-meta">
              <div>Jakarta, 12 Juni 2026</div>
              <div>No: <strong>001/SK/VI/2026</strong></div>
              <div>Sifat: Internal</div>
            </div>

            <!-- Subject -->
            <div class="preview-subject">
              <span class="preview-subject-label">Perihal&nbsp;:</span>
              <span class="preview-subject-value">{{ previewTemplate?.name || 'Perihal Surat' }}</span>
            </div>

            <div class="preview-divider" />

            <!-- Body with template content (lorem ipsum if empty) -->
            <div class="preview-body" v-html="previewBody" />

            <!-- Closing -->
            <div class="preview-closing">
              <p>Hormat kami,</p>
              <p class="preview-approver">Nama Penanda Tangan</p>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.template-body-preview {
  max-height: 80px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.template-body-preview :deep(*) {
  font-size: 12px !important;
  margin: 0 0 4px !important;
}

/* ── A4 paper preview ── */
.preview-paper {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 18mm 20mm;
  background: #ffffff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.22);
  font-family: 'Times New Roman', Times, serif;
  font-size: 11pt;
  color: #1a1a1a;
  line-height: 1.6;
  box-sizing: border-box;
}

.preview-lh {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 12px;
  border-bottom: 3px solid #1a1a1a;
  margin-bottom: 0;
}

.preview-lh-logo {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  background: #e0e0e0;
  border-radius: 4px;
}

.preview-lh-info {
  flex: 1;
  text-align: center;
}

.preview-company-name {
  font-size: 16pt;
  font-weight: 700;
  color: #1a1a1a;
}

.preview-company-sub {
  font-size: 9pt;
  color: #666;
}

.preview-meta {
  margin-top: 22px;
  margin-left: auto;
  text-align: right;
  font-size: 10.5pt;
  line-height: 1.65;
  width: fit-content;
}

.preview-subject {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  font-size: 11pt;
}

.preview-subject-label {
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.preview-subject-value {
  font-weight: 700;
  text-decoration: underline;
}

.preview-divider {
  border: none;
  border-top: 1px solid #ccc;
  margin: 14px 0;
}

.preview-body {
  font-size: 11pt;
  line-height: 1.75;
  text-align: justify;
  margin-bottom: 24px;
}

.preview-body :deep(p)      { margin-bottom: 10px; }
.preview-body :deep(strong) { font-weight: 700; }
.preview-body :deep(em)     { font-style: italic; }
.preview-body :deep(u)      { text-decoration: underline; }
.preview-body :deep(ul),
.preview-body :deep(ol)     { padding-left: 20px; margin-bottom: 10px; }
.preview-body :deep(li)     { margin-bottom: 4px; }

.preview-closing {
  margin-top: 28px;
  font-size: 11pt;
}

.preview-closing p { margin: 0; }

.preview-approver {
  margin-top: 48px !important;
  font-weight: 700;
  border-top: 1px solid #333;
  display: inline-block;
  padding-top: 4px;
  min-width: 180px;
}
</style>
