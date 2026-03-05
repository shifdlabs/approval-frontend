import { ref } from 'vue'

export function useDocumentAttachmentController() {
  const isUploading = ref(false)

  const createDocumentAttachment = async (payload: {
    DocumentID: string
    FileName: string
    Path: string
    Size: string
    Type: string
  }) => {
    isUploading.value = true
    try {
      const res = await useApi('/documentattachment', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return res
    } catch (error) {
      console.error('Error create document attachment:', error)
      throw error
    } finally {
      isUploading.value = false
    }
  }

  return {
    isUploading,
    createDocumentAttachment,
  }
}