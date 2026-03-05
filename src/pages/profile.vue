<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import UpdateBiodataDialog from '@/components/dialogs/UpdateBiodataDialog.vue';
import { useProfileController } from '@/controllers/reguler/profile-controller'

const {
  user,
  positions,
  userSignature,
  hasExistingSignature,
  signatureCreatedDate,
  currentSignature,
  isSavingSignature,
  signatureUrl,
  

  initializeProfile,
  fetchProfile,
  createSignature,
  updateSignature,
  deleteSignature,
  generateSignatureFileName
} = useProfileController()


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
  <VCard>
    <VTabs v-model="currentTab" style="margin-top: 20px;">
      <VTab>Account Settings</VTab>
      <VTab>Security</VTab>
      <VTab>Digital Signature</VTab>
    </VTabs>

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
        <VCardText class="pt-8">
          <VRow>
            <VCol cols="12" lg="8">
              <div class="signature-management-header mb-6">
                <div class="d-flex align-center mb-2">
                  <VIcon icon="tabler-signature" size="32" color="primary" class="me-3" />
                  <div>
                    <h2 class="text-h5 text-primary mb-1">Digital Signature Management</h2>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      Manage your digital signature for document approval and authentication
                    </p>
                  </div>
                </div>
              </div>

              <VCard class="signature-status-card mb-6" elevation="2">
                <VCardText>
                  <div v-if="!hasExistingSignature" class="signature-empty-state">
                    <div class="text-center py-8">
                      <div class="mb-4">
                        <VIcon icon="tabler-signature" size="64" color="grey-lighten-2" />
                      </div>
                      <h3 class="text-h6 mb-2">No Digital Signature Found</h3>
                      <p class="text-body-2 text-medium-emphasis mb-4">
                        Create your digital signature to approve documents electronically
                      </p>
                      <VBtn 
                        color="primary" 
                        size="large"
                        @click="openSignaturePad"
                        class="signature-create-btn"
                      >
                        <VIcon icon="tabler-plus" class="me-2" />
                        Create Digital Signature
                      </VBtn>
                    </div>
                  </div>

                  <div v-else class="signature-active-state">
                    <div class="d-flex align-start">
                      <div class="signature-preview-container me-4">
                        <div class="signature-preview-wrapper">
                          <img 
                            :src="signatureUrl" 
                            alt="Digital Signature"
                            class="signature-preview-image"
                          />
                          <div class="signature-overlay">
                            <VIcon icon="tabler-check-circle" color="success" size="24" />
                          </div>
                        </div>
                      </div>
                      
                      <div class="signature-info flex-grow-1">
                        <div class="d-flex align-center mb-2">
                          <VChip color="success" size="small" class="me-2">
                            <VIcon icon="tabler-check" class="me-1" size="16" />
                            Active
                          </VChip>
                        </div>
                        
                        <h4 class="text-h6 mb-2">Digital Signature Active</h4>
                        <p class="text-body-2 text-medium-emphasis mb-4">
                          Your digital signature is ready for document approval. You can update or replace it anytime.
                        </p>
                        
                        <div class="signature-actions">
                          <VBtn 
                            color="primary" 
                            variant="outlined"
                            size="small"
                            @click="openSignaturePad"
                            class="me-2 mb-2"
                          >
                            <VIcon icon="tabler-edit" class="me-1" />
                            Update Signature
                          </VBtn>
                          
                          <VBtn 
                            color="info" 
                            variant="outlined"
                            size="small"
                            @click="downloadSignature('jpg')"
                            class="me-2 mb-2"
                          >
                            <VIcon icon="tabler-eye" class="me-1" />
                            View
                          </VBtn>
                          
                          <VBtn 
                            color="error" 
                            variant="outlined"
                            size="small"
                            @click="handleDeleteSignature"
                            :loading="isDeletingSignature"
                            :disabled="isDeletingSignature"
                            class="mb-2"
                          >
                            <VIcon icon="tabler-trash" class="me-1" />
                            {{ isDeletingSignature ? 'Deleting...' : 'Delete' }}
                          </VBtn>
                        </div>
                      </div>
                    </div>
                  </div>
                </VCardText>
              </VCard>

              <VCard class="signature-info-card" elevation="1">
                <VCardText>
                  <div class="d-flex align-start">
                    <VIcon icon="tabler-info-circle" color="info" class="me-3 mt-1" />
                    <div>
                      <h4 class="text-subtitle-1 mb-2">About Digital Signatures</h4>
                      <ul class="signature-benefits-list">
                        <li>Secure document approval without printing</li>
                        <li>Legally binding electronic authentication</li>
                        <li>Faster document processing workflow</li>
                        <li>Audit trail for all signed documents</li>
                      </ul>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
            
            <VCol cols="12" lg="4">
              <VCard class="signature-stats-card" elevation="1">
                <VCardText>
                  <h4 class="text-h6 mb-4">Signature Statistics</h4>
                  
                  <div class="stat-item">
                    <div class="d-flex justify-space-between align-center mb-3">
                      <span class="text-body-2">Signature Created</span>
                      <span class="text-caption text-medium-emphasis">
                        {{ userSignature?.createdAt ? new Date(userSignature.createdAt).toLocaleDateString('id-ID') : 'N/A' }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="stat-item">
                    <div class="d-flex justify-space-between align-center mb-3">
                      <span class="text-body-2">Last Updated</span>
                      <span class="text-caption text-medium-emphasis">
                        {{ userSignature?.updatedAt ? new Date(userSignature.updatedAt).toLocaleDateString('id-ID') : 'N/A' }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="stat-item">
                    <div class="d-flex justify-space-between align-center">
                      <span class="text-body-2">Signature Status</span>
                      <VChip 
                        :color="hasExistingSignature ? 'success' : 'warning'" 
                        size="small"
                      >
                        {{ hasExistingSignature ? 'Active' : 'Inactive' }}
                      </VChip>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VWindowItem>
    </VWindow>
  </VCard>

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
            <h3 class="text-h5 mb-1">Create Digital Signature</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Draw your signature in the area below
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
          Use your mouse or touch device to create your signature. Make sure it's clear and legible.
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
                label="Pen Color"
                :items="[
                  { title: 'Blue (Recommended)', value: '#1976d2' },
                  { title: 'Black', value: '#000000' },
                  { title: 'Navy', value: '#0d47a1' }
                ]"
                variant="outlined"
                density="compact"
                hide-details
              />
            </VCol>
            <VCol cols="12" md="6">
              <VSlider
                v-model="signatureOptions.maxWidth"
                label="Pen Width"
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
          Cancel
        </VBtn>
        
        <VBtn 
          color="warning" 
          variant="outlined"
          @click="clearSignaturePad"
          class="me-2"
        >
          <VIcon icon="tabler-eraser" class="me-1" />
          Clear
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
          {{ isSavingSignature ? 'Saving...' : 'Save Signature' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VDialog
    v-model="isDeleteAccountDialogVisible"
    persistent
    class="v-dialog-sm"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isDeleteAccountDialogVisible = !isDeleteAccountDialogVisible" />
          <!-- Dialog Content -->
    <VCard title="Confirm Account Deletion">
      <VCardText>
        Are you sure you want to delete your account? Your profile and information will be temporarily hidden, and you can reactivate it at any time.
      </VCardText>

      <VCardText class="d-flex justify-end gap-3 flex-wrap">
        <VBtn
          color="primary"
          @click="isDeleteAccountDialogVisible = false"
        >
          Cancel
        </VBtn>

        <VBtn 
        color="error"
        variant="tonal"
        @click="deleteAccount">
          Yes, Delete This Account
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.signature-management-header {
  border-left: 4px solid rgb(var(--v-theme-primary));
  padding-left: 16px;
}

.signature-status-card {
  border: 1px solid rgb(var(--v-border-color));
  transition: all 0.3s ease;
}

.signature-status-card:hover {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.1);
}

.signature-empty-state {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 2px dashed rgb(var(--v-border-color));
}

.signature-create-btn {
  background: linear-gradient(45deg, rgb(var(--v-theme-primary)) 0%, #1565c0 100%);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s ease;
}

.signature-create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.4);
}

.signature-preview-container {
  position: relative;
  min-width: 200px;
}

.signature-preview-wrapper {
  position: relative;
  background: white;
  border: 2px solid rgb(var(--v-theme-success));
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(var(--v-theme-success), 0.2);
}

.signature-preview-image {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
}

.signature-overlay {
  position: absolute;
  top: -8px;
  right: -8px;
  background: rgb(var(--v-theme-success));
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(var(--v-theme-success), 0.3);
}

.signature-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.signature-info-card {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border: 1px solid rgba(var(--v-theme-info), 0.2);
}

.signature-benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.signature-benefits-list li {
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.5);
}

.signature-benefits-list li:last-child {
  border-bottom: none;
}

.signature-benefits-list li:before {
  content: '✓';
  position: absolute;
  left: 0;
  color: rgb(var(--v-theme-success));
  font-weight: bold;
}

.signature-stats-card {
  background: linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%);
  border: 1px solid rgba(var(--v-theme-warning), 0.2);
}

.stat-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.3);
}

.stat-item:last-child {
  border-bottom: none;
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
  .signature-actions {
    justify-content: center;
  }
  
  .signature-preview-container {
    min-width: 150px;
  }
  
  .signature-pad-content {
    padding: 16px;
  }
  
  .signature-dialog-actions {
    padding: 16px;
  }
}
</style>