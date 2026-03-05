import { ref, computed } from 'vue'
import { SignatureResponse, SignatureRequest, UpdateSignatureRequest } from '@/models/signature/signature'
import { User } from '@/models/users/users'
import { Position } from '@/models/positions/position'
import { uploadS3File, deleteS3File, S3BucketUrl, SignatureFolderName } from '@/utils/s3'

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
    
    try {
      const res = await $api('/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Profile response:', res)
      if (res.success) {
        user.value = mapUser(res.data)
        isProfileLoaded.value = true
        console.log('User profile loaded:', user.value)
      }
    } catch (e) {
      console.error('Error fetching profile:', e)
    }
  }

  const fetchPositions = async () => {
    try {
      const res = await $api('/position', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Positions response:', res)
      if (res.success) {
        positions.value = res.data
        isPositionsLoaded.value = true
      }
    } catch (e) {
      console.error('Error fetching positions:', e)
    }
  }

  const fetchUserSignature = async () => {
    if (!user.value?.id) {
      console.log('User ID not available yet, skipping signature fetch')
      return
    }

    try {
      const res = await $api('/signature', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Signature response:', res)
      if (res.success && res.data) {
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
    } catch (e) {
      console.error('Error fetching signature:', e)
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
    console.log('Loading profile data - ALWAYS FRESH (no cache)')
    
    await fetchProfile()
    await fetchPositions()
    
    if (user.value?.id) {
      console.log('Fetching signature for user:', user.value.id)
      await fetchUserSignature()
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
