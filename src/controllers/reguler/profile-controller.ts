import { ref, computed } from 'vue'
import { SignatureResponse, SignatureRequest, UpdateSignatureRequest } from '@/models/signature/signature'
import { User } from '@/models/users/users'
import { Position } from '@/models/positions/position'
import { uploadS3File, deleteS3File, S3BucketUrl, SignatureFolderName } from '@/utils/s3'
import { useApi } from '@/composables/useApi'

export function useProfileController() {
  // Reactive state
  const user = ref<User>()
  const positions = ref<Position[]>([])
  const userSignature = ref<SignatureResponse | null>(null)
  const hasExistingSignature = ref(false)
  const signatureCreatedDate = ref('')
  const currentSignature = ref('')
  const isSavingSignature = ref(false)
  
  const isProfileLoaded = ref(false)
  const isPositionsLoaded = ref(false)
  const isLoading = ref(false)

  const signatureUrl = computed(() => {
    if (userSignature.value?.imageUrl) {
      if (userSignature.value.imageUrl.startsWith('http')) {
        return userSignature.value.imageUrl
      }
      const cacheBuster = new Date().getTime()
      return `${S3BucketUrl}${userSignature.value.imageUrl}?v=${cacheBuster}`
    }
    return currentSignature.value
  })

  const fetchProfile = async () => {
    const { execute, data, error } = useApi('/user/profile', { method: 'GET' }, { immediate: false })
    await execute()

    if (error.value) {
      console.error('Error fetching profile:', error.value)
      return
    }

    const res = data.value as any
    if (res?.success) {
      user.value = mapUser(res.data)
      isProfileLoaded.value = true
    }
  }

  const fetchPositions = async () => {
    const { execute, data, error } = useApi('/position', { method: 'GET' }, { immediate: false })
    await execute()

    if (error.value) {
      console.error('Error fetching positions:', error.value)
      return
    }

    const res = data.value as any
    if (res?.success) {
      positions.value = res.data
      isPositionsLoaded.value = true
    }
  }

  const fetchUserSignature = async () => {
    if (!user.value?.id) return

    const { execute, data, error } = useApi('/signature', { method: 'GET' }, { immediate: false })
    await execute()

    if (error.value) {
      console.error('Error fetching signature:', error.value)
      resetSignatureState()
      return
    }

    const res = data.value as any
    if (res?.success && res?.data) {
      const currentUserSignature = res.data.find((sig: SignatureResponse) => sig.userId === user.value?.id)

      if (currentUserSignature) {
        userSignature.value = currentUserSignature
        hasExistingSignature.value = true
        currentSignature.value = signatureUrl.value
        signatureCreatedDate.value = new Date(currentUserSignature.createdAt).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } else {
        resetSignatureState()
      }
    } else {
      resetSignatureState()
    }
  }

  const createSignature = async (signatureCanvas: HTMLCanvasElement, fileName: string) => {
    if (!user.value?.id) {
      throw new Error('User ID not available')
    }

    isSavingSignature.value = true
    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        signatureCanvas.toBlob((blob) => {
          resolve(blob!)
        }, 'image/png', 0.9)
      })

      // Create File object from blob
      const file = new File([blob], fileName, { type: 'image/png' })
      
      // Upload to S3
      const s3Key = `${SignatureFolderName}${fileName}` // Langsung di signatures/ tanpa user folder
      await uploadS3File(file, s3Key)
      
      // Build full S3 URL using constant
      const imageUrl = `${S3BucketUrl}${s3Key}`
      
      // Create signature record in database
      const payload: SignatureRequest = {
        userId: user.value.id,
        imageUrl: imageUrl  // Send full URL instead of path
      }

      const res = await $api('/signature', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Create signature response:', res)
      
      if (res.success) {
        await fetchUserSignature()
        return { success: true }
      } else {
        throw new Error(res.message || 'Failed to create signature')
      }
    } catch (e) {
      console.error('Error creating signature:', e)
      throw e
    } finally {
      isSavingSignature.value = false
    }
  }

  const updateSignature = async (signatureCanvas: HTMLCanvasElement, fileName: string) => {
    if (!user.value?.id || !userSignature.value?.id) {
      throw new Error('User ID or signature ID not available')
    }

    isSavingSignature.value = true
    try {
      if (userSignature.value.imageUrl) {
        try {
          const oldS3Key = userSignature.value.imageUrl.split('.amazonaws.com/')[1]
          if (oldS3Key) {
            await deleteS3File(oldS3Key)
          }
        } catch (e) {
          console.warn('Failed to delete old signature from S3:', e)
        }
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        signatureCanvas.toBlob((blob) => {
          resolve(blob!)
        }, 'image/png', 0.9)
      })

      // Create File object from blob
      const file = new File([blob], fileName, { type: 'image/png' })
      
      // Upload new signature to S3
      const s3Key = `${SignatureFolderName}${fileName}` // Langsung di signatures/ tanpa user folder
      await uploadS3File(file, s3Key)
      
      // Build full S3 URL using constant
      const imageUrl = `${S3BucketUrl}${s3Key}`
      
      // Update signature record in database
      const payload: UpdateSignatureRequest = {
        imageUrl: imageUrl  // Send full URL instead of path
      }

      const res = await $api(`/signature/${user.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Update signature response:', res)
      
      if (res.success) {
        await fetchUserSignature()
        return { success: true }
      } else {
        throw new Error(res.message || 'Failed to update signature')
      }
    } catch (e) {
      console.error('Error updating signature:', e)
      throw e
    } finally {
      isSavingSignature.value = false
    }
  }

  const deleteSignature = async () => {
    if (!userSignature.value?.id) {
      throw new Error('No signature to delete')
    }

    try {
      // Delete from database first
      const res = await $api(`/signature/${userSignature.value.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Delete signature response:', res)

      if (res.success) {
        if (userSignature.value.imageUrl) {
          try {
            const s3Key = userSignature.value.imageUrl.split('.amazonaws.com/')[1]
            if (s3Key) {
              await deleteS3File(s3Key)
              console.log('Signature file deleted from S3')
            }
          } catch (e) {
            console.warn('Failed to delete signature from S3:', e)
          }
        }

        resetSignatureState()
        
        console.log('Signature deleted successfully')
        return { success: true }
      } else {
        throw new Error(res.message || 'Failed to delete signature')
      }
    } catch (e) {
      console.error('Error deleting signature:', e)
      throw e
    }
  }

  const resetSignatureState = () => {
    userSignature.value = null
    hasExistingSignature.value = false
    currentSignature.value = ''
    signatureCreatedDate.value = ''
  }

  const mapUser = (rawUser: any): User => {
    return {
      ...rawUser,
      position: rawUser.position ? mapPosition(rawUser.position) : undefined
    }
  }

  const mapPosition = (rawPosition: any): Position => {
    return {
      id: rawPosition.ID || rawPosition.id,
      name: rawPosition.Name || rawPosition.name
    }
  }

  const generateSignatureFileName = (userFirstName?: string) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const userName = userFirstName || 'user'
    return `signature_${userName.toLowerCase()}_${timestamp}.png`
  }

  const initializeProfile = async () => {
    await loadProfileData()
  }

  const loadProfileData = async () => {
    isLoading.value = true
    try {
      await fetchProfile()
      await fetchPositions()
      if (user.value?.id) {
        await fetchUserSignature()
      }
    } finally {
      isLoading.value = false
    }
  }

  const clearCache = () => {
    isProfileLoaded.value = false
    isPositionsLoaded.value = false  
  }

  return {
    user,
    positions,
    userSignature,
    hasExistingSignature,
    signatureCreatedDate,
    currentSignature,
    isSavingSignature,
    signatureUrl,
    isProfileLoaded,
    isPositionsLoaded,
    isLoading,
    fetchProfile,
    fetchPositions,
    fetchUserSignature,
    createSignature,
    updateSignature,
    deleteSignature,
    generateSignatureFileName,
    initializeProfile,
    loadProfileData,
    clearCache,
    resetSignatureState
  }
}
