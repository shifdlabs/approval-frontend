<script setup lang="ts">
import UpdateBiodataDialog from '@/components/dialogs/UpdateBiodataDialog.vue';
import { useProfileController } from '@/controllers/reguler/profile-controller';
import { computed, nextTick, onMounted, ref } from 'vue';

const {
  user,
  positions,
  userSignature,
  hasExistingSignature,
  signatureCreatedDate,
  currentSignature,
  isSavingSignature,
  signatureUrl,
  isLoading,

  initializeProfile,
  fetchProfile,
  createSignature,
  updateSignature,
  deleteSignature,
  generateSignatureFileName
} = useProfileController()


const { t } = useI18n()
const isDeletingSignature = ref(false)

const handleDeleteSignature = async () => {
  if (!confirm('Are you sure you want to delete your signature? This action cannot be undone.')) {
    return
  }

  isDeletingSignature.value = true
  try {
    await deleteSignature()
    console.log('Signature deleted successfully')
  } catch (error) {
    console.error('Error deleting signature:', error)
    alert('Failed to delete signature. Please try again.')
  } finally {
    isDeletingSignature.value = false
  }
}

onMounted(async () => {
  await initializeProfile()
  initializeSignatureCanvas()
})

const currentTab = ref('item-1')
const isUpdateBiodataDialogVisible = ref(false)
const isChangeEmailDialogVisible = ref(false)
const isDeleteAccountDialogVisible = ref(false)
const router = useRouter()

const userInitials = computed(() => {
  const f = user.value?.firstName?.charAt(0).toUpperCase() ?? ''
  const l = user.value?.lastName?.charAt(0).toUpperCase() ?? ''
  return f + l || '?'
})
const userFullName = computed(() =>
  [user.value?.firstName, user.value?.lastName].filter(Boolean).join(' ') || '—'
)

const signaturePad = ref<any>(null)
const isSignaturePadVisible = ref(false)
const isSignatureEmpty = ref(true)
const isDrawing = ref(false)
const lastX = ref(0)
const lastY = ref(0)
const signatureOptions = ref({
  penColor: '#1976d2',
  backgroundColor: '#ffffff',
  maxWidth: 3
})

const deleteAccount = async () => {
  try {
    const { error } = await useApi('/user/access',
      {
        method: 'PUT',
        body: JSON.stringify({
          id: user.value?.id,
          access: false,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    )

    if (error.value) {
      console.error(error.value)
      return
    }

    await nextTick(() => {
      router.replace('/')
    })
  } catch (e) {
    console.error(e)
  }
}

const initializeSignatureCanvas = () => {
  nextTick(() => {
    const ctx = getCanvasContext()
    if (ctx && signaturePad.value) {
      ctx.fillStyle = signatureOptions.value.backgroundColor
      ctx.fillRect(0, 0, signaturePad.value.width, signaturePad.value.height)
    }
  })
}

const getCanvasContext = () => {
  if (signaturePad.value) {
    return signaturePad.value.getContext('2d')
  }
  return null
}

const openSignaturePad = () => {
  isSignaturePadVisible.value = true
  setTimeout(() => initializeSignatureCanvas(), 100)
}

const closeSignaturePad = () => {
  isSignaturePadVisible.value = false
}

const startDrawing = (e: MouseEvent | TouchEvent) => {
  isDrawing.value = true
  isSignatureEmpty.value = false
  
  const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  
  lastX.value = clientX - rect.left
  lastY.value = clientY - rect.top
  
  const ctx = getCanvasContext()
  if (ctx) {
    ctx.strokeStyle = signatureOptions.value.penColor
    ctx.lineWidth = signatureOptions.value.maxWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }
}

const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing.value) return
  
  e.preventDefault()
  
  const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  
  const currentX = clientX - rect.left
  const currentY = clientY - rect.top
  
  const ctx = getCanvasContext()
  if (ctx) {
    ctx.beginPath()
    ctx.moveTo(lastX.value, lastY.value)
    ctx.lineTo(currentX, currentY)
    ctx.stroke()
  }
  
  lastX.value = currentX
  lastY.value = currentY
}

const stopDrawing = () => {
  isDrawing.value = false
}

const clearSignaturePad = () => {
  const ctx = getCanvasContext()
  if (ctx && signaturePad.value) {
    ctx.clearRect(0, 0, signaturePad.value.width, signaturePad.value.height)
    ctx.fillStyle = signatureOptions.value.backgroundColor
    ctx.fillRect(0, 0, signaturePad.value.width, signaturePad.value.height)
    isSignatureEmpty.value = true
  }
}

const saveSignature = async () => {
  if (signaturePad.value && !isSignatureEmpty.value) {
    try {
      const fileName = generateSignatureFileName(user.value?.firstName)
      
      if (hasExistingSignature.value && userSignature.value) {

        await updateSignature(signaturePad.value, fileName)
      } else {
        await createSignature(signaturePad.value, fileName)
      }
      
      isSignaturePadVisible.value = false
      console.log('Signature saved successfully')
    } catch (error) {
      console.error('Error saving signature:', error)
      alert('Failed to save signature. Please try again.')
    }
  } else {
    alert('Please create a signature before saving.')
  }
}

const downloadSignature = (format: 'png' | 'jpg') => {
  const imageUrl = signatureUrl.value || currentSignature.value
  if (!imageUrl) {
    alert('No signature available to download.')
    return
  }
  
  const fileName = `${user.value?.firstName || 'user'}_signature_${new Date().toISOString().split('T')[0]}.${format}`
  

  const link = document.createElement('a')
  link.href = imageUrl
  link.download = fileName
  link.style.display = 'none'
  

  document.body.appendChild(link)
  link.click()
  
  setTimeout(() => {
    document.body.removeChild(link)
  }, 100)
  
  console.log(`Downloaded: ${fileName}`)
}

</script>
<template>
  <div class="pa-page">

    <!-- Loading overlay -->
    <div v-if="isLoading" class="pa-loading">
      <VProgressCircular indeterminate color="primary" size="48" />
    </div>

    <template v-else>

    <!-- ===== Profile Hero ===== -->
    <div class="pa-card pa-hero">
      <div class="pa-avatar">
        {{ userInitials }}
        <span class="pa-avatar__ring"></span>
      </div>
      <div class="pa-hero__info">
        <h1 class="pa-hero__name">{{ userFullName }}</h1>
        <div class="pa-hero__tags">
          <span v-if="user?.position?.name" class="pa-chip pa-chip--role">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.4" r="3.8" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M5.5 19.2a6.5 6.5 0 0 1 13 0"/></svg>
            {{ user.position.name }}
          </span>
          <span class="pa-chip pa-chip--active">
            <span class="pa-chip__dot"></span>{{ $t('profile.activeAccount') }}
          </span>
        </div>
        <div class="pa-hero__email">{{ user?.email }}</div>
      </div>
    </div>

    <!-- ===== Custom Tabs ===== -->
    <div class="pa-tabs">
      <button :class="['pa-tab', currentTab === 'item-1' && 'pa-tab--on']" @click="currentTab = 'item-1'">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" d="M4 6.5h12M4 10h8M4 13.5h12M4 17h6"/></svg>
        {{ $t('profile.tabs.profile') }}
      </button>
      <button :class="['pa-tab', currentTab === 'item-2' && 'pa-tab--on']" @click="currentTab = 'item-2'">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.2" y="10.5" width="13.6" height="9.3" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/></svg>
        {{ $t('profile.tabs.security') }}
      </button>
      <button :class="['pa-tab', currentTab === 'item-3' && 'pa-tab--on']" @click="currentTab = 'item-3'">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M4 15.5c1.6-.8 2.7-3.4 3-6 .2-1.6-.6-2.2-1.3-1-.9 1.6-.9 5.8.1 7.7.7 1.3 1.9.9 2.6-.6.6-1.3 1.3-1 1.6.2.2.9.9 1.3 1.7 1.1 1-.2 1.8-1 2.2-1.9"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M4.5 19.5h15"/></svg>
        {{ $t('profile.tabs.signature') }}
      </button>
    </div>

    <VWindow v-model="currentTab">
      <VWindowItem value="item-1">
        <AccountSettingsSection
          v-model:user="user"
          v-model:is-update-profile-dialog-visible="isUpdateBiodataDialogVisible"
          v-model:is-change-email-dialog-visible="isChangeEmailDialogVisible"
          v-model:is-delete-account-dialog-visible="isDeleteAccountDialogVisible"
        />
      </VWindowItem>
      <VWindowItem value="item-2">
        <AccountSecuritySection />
      </VWindowItem>
      <VWindowItem value="item-3">
        <div class="ttd-wrap">
        
          <!-- ===== Main Grid ===== -->
          <div class="ttd-grid">

            <!-- Hero Card -->
            <div class="ttd-card ttd-hero">

              <!-- Empty State -->
              <div v-if="!hasExistingSignature" class="ttd-hero__inner">
                <div class="ttd-sig-badge">
                  <div class="ttd-sig-badge__plate">
                    <svg viewBox="0 0 92 52" aria-hidden="true">
                      <path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M6 38c4-2 7-8 8-15s0-12-3-9-3 19 0 26c2 5 6 3 8-3s3-16 6-20 4 4 3 11-2 13 1 14 6-9 9-13 4 0 4 4 1 7 4 6 6-5 9-6 5 1 9 0"/>
                    </svg>
                    <span class="ttd-sig-badge__baseline"></span>
                  </div>
                  <div class="ttd-sig-badge__seal">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m7.5 12.4 3 3 6-7"/>
                    </svg>
                  </div>
                </div>
                <h2 class="ttd-hero__title">{{ $t('profile.signature.noSignature') }}</h2>
                <p class="ttd-hero__desc">{{ $t('profile.signature.noSignatureDesc') }}</p>
                <div class="ttd-actions">
                  <button class="ttd-btn ttd-btn--primary" @click="openSignaturePad">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 5.5v13M5.5 12h13"/></svg>
                    {{ $t('profile.signature.create') }}
                  </button>
                </div>
                <div class="ttd-hint">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.2" y="10.5" width="13.6" height="9.3" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/></svg>
                  {{ $t('profile.signature.encrypted') }}
                </div>
              </div>

              <!-- Active State -->
              <div v-else class="ttd-hero__active">
                <div class="ttd-active-preview">
                  <div class="ttd-active-preview__plate">
                    <img :src="signatureUrl" alt="Tanda Tangan Digital" class="ttd-active-preview__img" />
                    <span class="ttd-active-preview__baseline"></span>
                  </div>
                  <div class="ttd-active-preview__seal">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m7.5 12.4 3 3 6-7"/>
                    </svg>
                  </div>
                </div>
                <div class="ttd-active-info">
                  <span class="ttd-chip ttd-chip--active ttd-chip--mb">
                    <span class="ttd-chip__dot"></span>{{ $t('profile.signature.activeTitle') }}
                  </span>
                  <h2 class="ttd-hero__title">{{ $t('profile.signature.activeTitle') }}</h2>
                  <p class="ttd-hero__desc">{{ $t('profile.signature.activeDesc') }}</p>
                  <div class="ttd-actions ttd-actions--left">
                    <button class="ttd-btn ttd-btn--primary" @click="openSignaturePad">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
                      {{ $t('profile.signature.update') }}
                    </button>
                    <button class="ttd-btn ttd-btn--ghost" @click="downloadSignature('jpg')">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>
                      {{ $t('profile.signature.view') }}
                    </button>
                    <button class="ttd-btn ttd-btn--danger" :disabled="isDeletingSignature" @click="handleDeleteSignature">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><polyline fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" points="3 6 5 6 21 6"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      {{ isDeletingSignature ? $t('profile.signature.deleting') : $t('profile.signature.delete') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Rail -->
            <div class="ttd-rail">

              <!-- Stats Card -->
              <div class="ttd-card ttd-panel">
                <div class="ttd-panel__head">
                  <span class="ttd-panel__ic">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M4 4v15a1 1 0 0 0 1 1h15"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M8 15l3.2-3.8 2.6 2.2L19 7.5"/></svg>
                  </span>
                  <div>
                    <h3 class="ttd-panel__title">{{ $t('profile.signature.stats') }}</h3>
                    <div class="ttd-panel__sub">{{ $t('profile.signature.statsTitle') }}</div>
                  </div>
                </div>
                <div class="ttd-stat-rows">
                  <div class="ttd-stat-row">
                    <span class="ttd-stat-row__key">
                      <span class="ttd-stat-row__dot">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.4" width="16" height="15" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M8 3.5v3.6M16 3.5v3.6M4.3 10h15.4"/></svg>
                      </span>{{ $t('profile.signature.created') }}
                    </span>
                    <span class="ttd-stat-row__val" :class="{ 'ttd-stat-row__val--na': !userSignature?.createdAt }">
                      {{ userSignature?.createdAt ? new Date(userSignature.createdAt).toLocaleDateString('id-ID') : '—' }}
                    </span>
                  </div>
                  <div class="ttd-stat-row">
                    <span class="ttd-stat-row__key">
                      <span class="ttd-stat-row__dot">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M19 5.5v4h-4M5 18.5v-4h4"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M18.4 9.4A7 7 0 0 0 6.3 7.6L5 9M5.6 14.6a7 7 0 0 0 12.1 1.8L19 15"/></svg>
                      </span>{{ $t('profile.signature.lastUpdated') }}
                    </span>
                    <span class="ttd-stat-row__val" :class="{ 'ttd-stat-row__val--na': !userSignature?.updatedAt }">
                      {{ userSignature?.updatedAt ? new Date(userSignature.updatedAt).toLocaleDateString('id-ID') : '—' }}
                    </span>
                  </div>
                  <div class="ttd-stat-row">
                    <span class="ttd-stat-row__key">
                      <span class="ttd-stat-row__dot">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M3.5 12h3.2l2.3-6 4 14 2.6-8h4.9"/></svg>
                      </span>{{ $t('profile.signature.status') }}
                    </span>
                    <span :class="['ttd-chip', hasExistingSignature ? 'ttd-chip--active' : 'ttd-chip--inactive']">
                      <span class="ttd-chip__dot"></span>
                      {{ hasExistingSignature ? $t('profile.signature.active') : $t('profile.signature.inactive') }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Secure Card -->
              <div class="ttd-card ttd-secure">
                <span class="ttd-secure__ic">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.2" y="10.5" width="13.6" height="9.3" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/></svg>
                </span>
                <div>
                  <h4 class="ttd-secure__title">{{ $t('profile.signature.legal') }}</h4>
                  <p class="ttd-secure__desc">{{ $t('profile.signature.legalDesc') }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== Benefits ===== -->
          <div class="ttd-card ttd-benefits">
            <div class="ttd-benefits__head">
              <h3 class="ttd-benefits__title">{{ $t('profile.signature.about') }}</h3>
              <span class="ttd-benefits__sub">{{ $t('profile.signature.why') }}</span>
            </div>
            <div class="ttd-blist">
              <div class="ttd-bitem">
                <span class="ttd-bitem__ic">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="M5 19c0-7 4-13 14-13 0 9-5 14-12 14a6 6 0 0 1-2-1Z"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M8 18c2.5-4 5-6.5 9-8.5"/></svg>
                </span>
                <span class="ttd-bitem__t">{{ $t('profile.signature.features.noPrint') }}</span>
                <span class="ttd-bitem__d">{{ $t('profile.signature.features.noPrintDesc') }}</span>
              </div>
              <div class="ttd-bitem">
                <span class="ttd-bitem__ic">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M12 4v16M7 20h10M4 8l4-2 4 2M20 8l-4-2-4 2"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="M2 12.5 4 8l2 4.5a2.2 2.2 0 0 1-4 0ZM18 12.5 20 8l2 4.5a2.2 2.2 0 0 1-4 0Z"/></svg>
                </span>
                <span class="ttd-bitem__t">{{ $t('profile.signature.features.legal') }}</span>
                <span class="ttd-bitem__d">{{ $t('profile.signature.features.legalDesc') }}</span>
              </div>
              <div class="ttd-bitem">
                <span class="ttd-bitem__ic">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="M13 3 5 13.5h6L11 21l8-10.5h-6z"/></svg>
                </span>
                <span class="ttd-bitem__t">{{ $t('profile.signature.features.faster') }}</span>
                <span class="ttd-bitem__d">{{ $t('profile.signature.features.fasterDesc') }}</span>
              </div>
              <div class="ttd-bitem">
                <span class="ttd-bitem__ic">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M7 4.5h7l4 4V19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M9.5 12.5l1.8 1.8 3.4-3.6"/></svg>
                </span>
                <span class="ttd-bitem__t">{{ $t('profile.signature.features.audit') }}</span>
                <span class="ttd-bitem__d">{{ $t('profile.signature.features.auditDesc') }}</span>
              </div>
            </div>
          </div>

        </div>
      </VWindowItem>
    </VWindow>

    </template><!-- end v-else -->
  </div>

  <UpdateBiodataDialog
    v-model:user="user"
    v-model:position="positions"
    v-model:is-dialog-visible="isUpdateBiodataDialogVisible"
    @update:is-refetch="fetchProfile"
  />
  
  <ChangeEmailDialog 
    v-model:user="user"
    v-model:is-dialog-visible="isChangeEmailDialogVisible"
    @update:is-refetch="fetchProfile"
  />

  <VDialog
    v-model="isSignaturePadVisible"
    max-width="900"
    persistent
    class="signature-dialog"
  >
    <VCard class="signature-pad-card">
      <VCardTitle class="signature-dialog-header">
        <div class="d-flex align-center">
          <VIcon icon="tabler-signature" color="primary" class="me-3" />
          <div>
            <h3 class="text-h5 mb-1">{{ $t('profile.signatureDialog.title') }}</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ $t('profile.signatureDialog.instruction') }}
            </p>
          </div>
        </div>
      </VCardTitle>
      
      <VDivider />
      
      <VCardText class="signature-pad-content">
        <VAlert 
          type="info" 
          variant="tonal" 
          class="mb-4"
          border="start"
        >
          <VIcon icon="tabler-info-circle" class="me-2" />
          {{ $t('profile.signatureDialog.usageNote') }}
        </VAlert>
        
        <div class="signature-pad-container">
          <canvas 
            ref="signaturePad"
            width="840"
            height="300"
            class="signature-canvas"
            @mousedown="startDrawing"
            @mousemove="draw"
            @mouseup="stopDrawing"
            @touchstart="startDrawing"
            @touchmove="draw"
            @touchend="stopDrawing"
          ></canvas>
          
          <div class="signature-canvas-border"></div>
        </div>
        
        <div class="signature-controls">
          <VRow>
            <VCol cols="12" md="6">
              <VSelect
                v-model="signatureOptions.penColor"
                :label="$t('profile.signatureDialog.penColor')"
                :items="[
                  { title: $t('profile.signatureDialog.blueRec'), value: '#1976d2' },
                  { title: $t('profile.signatureDialog.black'), value: '#000000' },
                  { title: $t('profile.signatureDialog.navy'), value: '#0d47a1' }
                ]"
                variant="outlined"
                density="compact"
                hide-details
              />
            </VCol>
            <VCol cols="12" md="6">
              <VSlider
                v-model="signatureOptions.maxWidth"
                :label="$t('profile.signatureDialog.penWidth')"
                min="1"
                max="6"
                step="1"
                thumb-label
                hide-details
              />
            </VCol>
          </VRow>
        </div>
      </VCardText>
      
      <VDivider />
      
      <VCardActions class="signature-dialog-actions">
        <VBtn 
          color="error" 
          variant="outlined"
          @click="closeSignaturePad"
          class="me-2"
        >
          <VIcon icon="tabler-x" class="me-1" />
          {{ $t('profile.signatureDialog.cancel') }}
        </VBtn>

        <VBtn
          color="warning"
          variant="outlined"
          @click="clearSignaturePad"
          class="me-2"
        >
          <VIcon icon="tabler-eraser" class="me-1" />
          {{ $t('profile.signatureDialog.clear') }}
        </VBtn>

        <VSpacer />

        <VBtn
          color="success"
          @click="saveSignature"
          :disabled="isSignatureEmpty || isSavingSignature"
          :loading="isSavingSignature"
          size="large"
          class="signature-save-btn"
        >
          <VIcon icon="tabler-check" class="me-2" />
          {{ isSavingSignature ? $t('profile.signatureDialog.saving') : $t('profile.signatureDialog.save') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VDialog
    v-model="isDeleteAccountDialogVisible"
    max-width="460"
    persistent
  >
    <VCard class="bm-dialog">
      <div class="bmd-head">
        <div class="bmd-mark" style="background: oklch(0.55 0.19 25);">
          <VIcon icon="tabler-user-off" size="22" />
        </div>
        <div class="bmd-titles">
          <h2>{{ $t('profile.deleteDialog.title') }}</h2>
          <p>{{ $t('profile.deleteDialog.description') }}</p>
        </div>
        <button class="bmd-close" type="button" @click="isDeleteAccountDialogVisible = false">
          <VIcon icon="tabler-x" size="18" />
        </button>
      </div>
      <div class="bmd-foot">
        <button class="bmd-btn bmd-btn-ghost" type="button" @click="isDeleteAccountDialogVisible = false">
          {{ $t('common.cancel') }}
        </button>
        <button class="bmd-btn bmd-btn-primary" type="button" style="background: oklch(0.55 0.19 25); box-shadow: 0 12px 24px -10px rgba(180, 40, 20, 0.4);" @click="deleteAccount">
          {{ $t('profile.deleteDialog.confirm') }}
        </button>
      </div>
    </VCard>
  </VDialog>
</template>

<style scoped lang="scss">
/* ===== Page wrapper ===== */
.pa-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.pa-page {
  --pa-navy:       #3d5fc8;
  --pa-navy-deep:  #2e4db5;
  --pa-navy-tint:  #eef1fb;
  --pa-green:      #16a34a;
  --pa-green-tint: #f0fdf4;
  --pa-ink-strong: #1e2440;
  --pa-ink:        #4b5280;
  --pa-muted:      #8b90b8;
  --pa-line:       #e8eaf2;
  --pa-shadow:     0 1px 2px rgba(20,24,40,.04), 0 14px 34px -22px rgba(20,24,40,.22);
  --pa-shadow-card:0 1px 2px rgba(20,24,40,.05), 0 22px 48px -30px rgba(20,24,40,.26);

  /* Break out of .layout-page-content's padding so width matches navbar */
  margin-inline: -1.5rem;
  margin-block-start: -1.5rem;
  padding: 0 0 56px;
}

/* ===== Shared card ===== */
.pa-card {
  background: #fff;
  border: 1px solid var(--pa-line);
  border-radius: 20px;
  box-shadow: var(--pa-shadow-card);
}

/* ===== Profile Hero ===== */
.pa-hero {
  position: relative;
  padding: 26px 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  overflow: hidden;
  margin-inline: 32px;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(120% 160% at 0% 0%, var(--pa-navy-tint) 0%, transparent 55%);
    pointer-events: none;
  }
}

.pa-avatar {
  position: relative;
  width: 76px;
  height: 76px;
  border-radius: 22px;
  flex: none;
  background: linear-gradient(150deg, var(--pa-navy) 0%, var(--pa-navy-deep) 100%);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 27px;
  font-weight: 800;
  letter-spacing: -0.01em;
  box-shadow: 0 12px 26px -10px rgba(61,95,200,.60);
}

.pa-avatar__ring {
  position: absolute;
  inset: -4px;
  border-radius: 26px;
  border: 1.5px solid rgba(61,95,200,.22);
  pointer-events: none;
}

.pa-hero__info {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.pa-hero__name {
  margin: 0;
  font-size: 23px;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--pa-ink-strong);
}

.pa-hero__tags {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.pa-hero__email {
  font-size: 13px;
  color: var(--pa-muted);
  font-weight: 500;
}

/* ===== Chips ===== */
.pa-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 99px;
  letter-spacing: -0.005em;
  white-space: nowrap;

  svg { width: 15px; height: 15px; }

  &--role {
    color: var(--pa-navy);
    background: var(--pa-navy-tint);
    border: 1px solid rgba(61,95,200,.16);
  }

  &--active {
    color: var(--pa-green);
    background: var(--pa-green-tint);
  }
}

.pa-chip__dot {
  width: 7px;
  height: 7px;
  border-radius: 99px;
  background: var(--pa-green);
  box-shadow: 0 0 0 3px rgba(22,163,74,.22);
}

/* ===== Custom Tabs ===== */
.pa-tabs {
  display: inline-flex;
  gap: 4px;
  margin: 22px 0 14px 32px;
  padding: 4px;
  background: #f0f1f7;
  border: 1px solid var(--pa-line);
  border-radius: 13px;
}

.pa-tab {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--pa-muted);
  border: 0;
  background: transparent;
  padding: 9px 18px;
  border-radius: 9px;
  cursor: pointer;
  transition: .18s;

  svg { width: 17px; height: 17px; }

  &:hover { color: var(--pa-ink-strong); }

  &--on {
    background: #fff;
    color: var(--pa-navy);
    box-shadow: 0 1px 2px rgba(0,0,0,.07), 0 2px 8px -4px rgba(0,0,0,.12);
  }
}

/* ===== Design tokens (scoped to ttd-wrap) ===== */
.ttd-wrap {
  --ttd-navy:        #3d5fc8;
  --ttd-navy-deep:   #2e4db5;
  --ttd-navy-tint:   #eef1fb;
  --ttd-navy-tint-2: #dde4f5;
  --ttd-amber:       #d97706;
  --ttd-amber-tint:  #fffbeb;
  --ttd-green:       #16a34a;
  --ttd-green-tint:  #f0fdf4;
  --ttd-ink-strong:  #111827;
  --ttd-ink:         #1f2a4a;
  --ttd-muted:       #6b7280;
  --ttd-line:        #e8eaf2;
  --ttd-line-soft:   #f0f2f7;
  --ttd-shadow:      0 1px 2px rgba(20,24,40,.04), 0 12px 32px -20px rgba(20,24,40,.22);
  --ttd-shadow-card: 0 1px 2px rgba(20,24,40,.05), 0 20px 44px -28px rgba(20,24,40,.28);

  padding: 16px 32px 56px;
}

/* ===== Shared card ===== */
.ttd-card {
  background: #fff;
  border: 1px solid var(--ttd-line);
  border-radius: 20px;
  box-shadow: var(--ttd-shadow);
}

/* ===== Header ===== */
.ttd-head {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.ttd-mark {
  width: 62px;
  height: 62px;
  flex: none;
  border-radius: 18px;
  background: var(--ttd-navy);
  display: grid;
  place-items: center;
  color: #fff;
  box-shadow: 0 10px 24px -10px rgba(61,95,200,.65);

  svg { width: 36px; height: 28px; }
}

.ttd-head__text { flex: 1; min-width: 0; }

.ttd-head__title {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--ttd-ink-strong);
}

.ttd-head__sub {
  margin: 5px 0 0;
  font-size: 14.5px;
  color: var(--ttd-muted);
  font-weight: 600;
}

/* Status badge */
.ttd-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  padding: 9px 15px;
  border-radius: 99px;

  &--inactive {
    color: var(--ttd-amber);
    background: var(--ttd-amber-tint);
    border: 1px solid rgba(217,119,6,.28);
  }

  &--active {
    color: var(--ttd-green);
    background: var(--ttd-green-tint);
    border: 1px solid rgba(22,163,74,.28);
  }
}

.ttd-status__pulse {
  width: 8px;
  height: 8px;
  border-radius: 99px;
  background: currentColor;
}

.ttd-status--inactive .ttd-status__pulse {
  box-shadow: 0 0 0 4px rgba(217, 119, 6, .22);
}

.ttd-status--active .ttd-status__pulse {
  box-shadow: 0 0 0 4px rgba(22, 163, 74, .22);
}

/* ===== Layout ===== */
.ttd-grid {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 22px;
  align-items: start;
  margin-bottom: 22px;

  @media (max-width: 980px) { grid-template-columns: 1fr; }
}

/* ===== Hero card ===== */
.ttd-hero {
  padding: 14px;
  box-shadow: var(--ttd-shadow-card);
}

.ttd-hero__inner {
  border: 1.5px dashed #c9d1ec;
  border-radius: 15px;
  background:
    radial-gradient(120% 80% at 50% 0%, var(--ttd-navy-tint) 0%, transparent 60%),
    #fff;
  padding: 56px 40px 52px;
  text-align: center;
  transition: border-color .2s ease;

  &:hover { border-color: var(--ttd-navy); }
}

/* Signature badge illustration */
.ttd-sig-badge {
  position: relative;
  width: 160px;
  height: 112px;
  margin: 0 auto 28px;
}

.ttd-sig-badge__plate {
  position: absolute;
  inset: 0;
  border-radius: 18px;
  background: #fff;
  border: 1px solid var(--ttd-line);
  box-shadow: var(--ttd-shadow);
  display: grid;
  place-items: center;
  color: var(--ttd-navy);
  overflow: hidden;

  svg { width: 116px; height: 66px; }
}

.ttd-sig-badge__baseline {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 24px;
  height: 1.5px;
  background: #d4daf0;
  pointer-events: none;
}

.ttd-sig-badge__seal {
  position: absolute;
  right: -12px;
  bottom: -12px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--ttd-navy);
  display: grid;
  place-items: center;
  box-shadow: 0 8px 18px -8px rgba(61,95,200,.70);
  border: 3px solid #fff;
  color: #fff;

  svg { width: 24px; height: 24px; }
}

.ttd-hero__title {
  margin: 0;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ttd-ink-strong);
}

.ttd-hero__desc {
  margin: 9px auto 0;
  max-width: 420px;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--ttd-ink);
  font-weight: 600;
}

/* Hint line */
.ttd-hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 22px;
  font-size: 12.5px;
  color: var(--ttd-muted);
  font-weight: 500;

  svg { width: 16px; height: 16px; color: var(--ttd-navy); }
}


/* ===== Buttons ===== */
.ttd-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 26px;
  flex-wrap: wrap;

  &--left { justify-content: flex-start; }
}

.ttd-btn {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  height: 50px;
  padding: 0 24px;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
  border-radius: 13px;
  cursor: pointer;
  transition: .18s;
  white-space: nowrap;
  border: 0;

  svg { width: 19px; height: 19px; }

  &:disabled { opacity: .55; cursor: not-allowed; transform: none !important; }

  &--primary {
    background: var(--ttd-navy);
    color: #fff;
    box-shadow: 0 10px 22px -10px rgba(61,95,200,.70);
    &:hover { background: var(--ttd-navy-deep); transform: translateY(-1px); }
  }

  &--ghost {
    background: #fff;
    color: var(--ttd-navy);
    border: 1.5px solid #c9d1ec;
    &:hover { background: var(--ttd-navy-tint); border-color: var(--ttd-navy); }
  }

  &--danger {
    background: #fff;
    color: #dc2626;
    border: 1.5px solid #fecaca;
    &:hover { background: #fef2f2; border-color: #dc2626; }
  }
}

/* ===== Active state ===== */
.ttd-hero__active {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding: 40px 32px;
  text-align: center;

  @media (min-width: 600px) {
    flex-direction: row;
    text-align: left;
    align-items: flex-start;
  }
}

.ttd-active-preview {
  position: relative;
  flex: none;
}

.ttd-active-preview__plate {
  background: #fff;
  border: 1.5px solid var(--ttd-line);
  border-radius: 18px;
  padding: 18px 22px 28px;
  box-shadow: var(--ttd-shadow);
  position: relative;
  min-width: 190px;
}

.ttd-active-preview__img {
  display: block;
  max-width: 160px;
  height: auto;
}

.ttd-active-preview__baseline {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 14px;
  height: 1.5px;
  background: #d4daf0;
}

.ttd-active-preview__seal {
  position: absolute;
  right: -10px;
  bottom: -10px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--ttd-green);
  display: grid;
  place-items: center;
  box-shadow: 0 8px 18px -8px rgba(22,163,74,.70);
  border: 3px solid #fff;
  color: #fff;

  svg { width: 20px; height: 20px; }
}

.ttd-active-info {
  flex: 1;
  min-width: 0;

  .ttd-hero__desc { margin: 9px 0 0; max-width: none; }
}

/* ===== Right Rail ===== */
.ttd-rail {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* Stats panel */
.ttd-panel { padding: 22px 24px; }

.ttd-panel__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.ttd-panel__ic {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--ttd-navy-tint);
  color: var(--ttd-navy);
  display: grid;
  place-items: center;
  flex: none;

  svg { width: 22px; height: 22px; }
}

.ttd-panel__title {
  margin: 0;
  font-size: 16.5px;
  font-weight: 800;
  letter-spacing: -0.015em;
  color: var(--ttd-ink-strong);
}

.ttd-panel__sub {
  font-size: 12px;
  color: var(--ttd-muted);
  font-weight: 500;
  margin-top: 2px;
}

.ttd-stat-rows { margin-top: 14px; }

.ttd-stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 0;
  border-top: 1px solid var(--ttd-line-soft);

  &:first-child { border-top: 0; }
}

.ttd-stat-row__key {
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ttd-ink);
}

.ttd-stat-row__dot {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #f5f6fa;
  color: var(--ttd-muted);
  display: grid;
  place-items: center;
  flex: none;

  svg { width: 18px; height: 18px; }
}

.ttd-stat-row__val {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ttd-ink-strong);
  font-variant-numeric: tabular-nums;

  &--na { color: var(--ttd-muted); font-weight: 600; }
}

/* Chip */
.ttd-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 99px;

  &--active {
    color: var(--ttd-green);
    background: var(--ttd-green-tint);
  }

  &--inactive {
    color: var(--ttd-amber);
    background: var(--ttd-amber-tint);
  }

  &--mb { display: inline-flex; margin-bottom: 10px; }
}

.ttd-chip__dot {
  width: 7px;
  height: 7px;
  border-radius: 99px;
  background: currentColor;
}

/* Secure card */
.ttd-secure {
  padding: 18px 20px;
  display: flex;
  gap: 13px;
  align-items: flex-start;
  background: var(--ttd-navy-tint);
  border-color: rgba(61,95,200,.14);
}

.ttd-secure__ic {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: var(--ttd-navy);
  color: #fff;
  display: grid;
  place-items: center;
  flex: none;

  svg { width: 26px; height: 26px; }
}

.ttd-secure__title {
  margin: 2px 0 4px;
  font-size: 14px;
  font-weight: 800;
  color: var(--ttd-ink-strong);
  letter-spacing: -0.01em;
}

.ttd-secure__desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--ttd-ink);
  font-weight: 600;
}

/* ===== Benefits ===== */
.ttd-benefits { padding: 24px 26px 26px; }

.ttd-benefits__head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.ttd-benefits__title {
  margin: 0;
  font-size: 16.5px;
  font-weight: 800;
  letter-spacing: -0.015em;
  color: var(--ttd-ink-strong);
}

.ttd-benefits__sub {
  font-size: 13px;
  color: var(--ttd-muted);
  font-weight: 500;
}

.ttd-blist {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 980px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 560px)  { grid-template-columns: 1fr; }
}

.ttd-bitem {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border: 1px solid var(--ttd-line);
  border-radius: 15px;
  background: #fafafa;
  transition: .18s;

  &:hover {
    border-color: rgba(61,95,200,.30);
    box-shadow: var(--ttd-shadow);
    transform: translateY(-2px);
  }
}

.ttd-bitem__ic {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--ttd-navy-tint);
  color: var(--ttd-navy);
  display: grid;
  place-items: center;

  svg { width: 26px; height: 26px; }
}

.ttd-bitem__t {
  font-size: 14px;
  font-weight: 700;
  color: var(--ttd-ink-strong);
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.ttd-bitem__d {
  font-size: 13px;
  line-height: 1.5;
  color: var(--ttd-ink);
  font-weight: 600;
}

.signature-dialog {
  z-index: 2000;
}

.signature-pad-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.signature-dialog-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 24px;
  border-bottom: 1px solid rgb(var(--v-border-color));
}

.signature-pad-content {
  padding: 32px;
}

.signature-pad-container {
  position: relative;
  margin: 24px 0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
}

.signature-canvas {
  display: block;
  width: 100%;
  height: 300px;
  cursor: crosshair;
  background: white;
  border: none;
}

.signature-canvas-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid rgb(var(--v-theme-primary));
  border-radius: 12px;
  pointer-events: none;
}

.signature-controls {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-top: 16px;
}

.signature-dialog-actions {
  padding: 24px 32px;
  background: #f8f9fa;
}

.signature-save-btn {
  background: linear-gradient(45deg, rgb(var(--v-theme-success)) 0%, #2e7d32 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(var(--v-theme-success), 0.3);
  transition: all 0.3s ease;
}

.signature-save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(var(--v-theme-success), 0.4);
}

.signature-save-btn:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .signature-pad-content {
    padding: 16px;
  }

  .signature-dialog-actions {
    padding: 16px;
  }
}
</style>
