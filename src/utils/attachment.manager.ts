export const allowedFileType = `
image/*,
application/pdf,
application/msword,
application/vnd.openxmlformats-officedocument.wordprocessingml.document,
application/vnd.ms-powerpoint,
application/vnd.openxmlformats-officedocument.presentationml.presentation,
application/vnd.ms-excel,
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
audio/*,
application/zip,
application/x-zip-compressed
`

export const handleFileChange = (event: Event, uploadingFiles: Ref<File[]>) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const maxSize = 2 * 1024 * 1024 // 2MB
    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',

      // PDF
      'application/pdf',

      // Word
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

      // Excel
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

      // PowerPoint
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',

      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',

      // ZIP
      'application/zip',
      'application/x-zip-compressed'
    ]

    const newFiles = Array.from(target.files).filter(file => {
      // Check type
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} is not an allowed file type.`)
        return false
      }
      // Check size
      if (file.size > maxSize) {
        alert(`${file.name} exceeds 2MB and will be skipped.`)
        return false
      }
      return true
    })

    // Avoid duplicates by file name
    const existingFileNames = uploadingFiles.value.map(f => f.name)
    const filteredNewFiles = newFiles.filter(
      f => !existingFileNames.includes(f.name)
    )

    uploadingFiles.value = uploadingFiles.value.concat(filteredNewFiles)
  }

  // Reset the input
  if (target) target.value = ''
}

export const handleFileDrop = (
    event: DragEvent, 
    uploadingFiles: Ref<File[]>, 
    isLoaderVisible: Ref<Boolean>,
    isUploading: Ref<Boolean>
) => {
  if (isLoaderVisible.value || isUploading.value) return
  const files = event.dataTransfer?.files
  if (files) {
    uploadingFiles.value = Array.from(files)
    // Optional: start upload immediately
    // startUpload(files)
  }
}

export const handleRemoveFile = (index: number, uploadingFiles: Ref<File[]>) => {
  uploadingFiles.value.splice(index, 1)
}

export const handleFileClick = (
    fileInput: Ref<HTMLInputElement | null>,
    isLoaderVisible: Ref<Boolean>,
    isUploading: Ref<Boolean>
) => {
  if (!isLoaderVisible.value && !isUploading.value && fileInput.value) {
    fileInput.value.click()
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function convertToFileRequest(uploadingFiles: Ref<File[]>) {
  return uploadingFiles.value.map(file => {
    const extension = file.name.split('.').pop() || 'file'
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${extension}`

    return {
      originalName: file.name,                    // original file name
      fileName: uniqueName,                                   // generated unique name with path
      path: `${S3BucketUrl}${AttachmentFolderName}${uniqueName}`,                          // replace with real upload path if needed
      size: formatFileSize(file.size),            // e.g., '20 MB'
      type: file.type                             // e.g., 'image/jpeg' or 'application/pdf'
    }
  })
}

export async function uploadAllFiles(
    uploadingFiles: Ref<File[]>,
) {
    const attachments = convertToFileRequest(uploadingFiles)
  // safety check: make sure uploadingFiles and attachments align
  if (uploadingFiles.value.length !== attachments.length) {
    console.error('File count mismatch!')
    return
  }

  for (let i = 0; i < uploadingFiles.value.length; i++) {
    const file = uploadingFiles.value[i]
    const fileName = attachments[i].fileName

    try {
      await uploadS3File(file, `document-attachments/${fileName}`)
    } catch (error) {
      console.error('Failed to upload:', fileName, error)
    }
  }
}

export async function deleteFile(fileName: string) {
  await deleteS3File(`document-attachments/${fileName}`)
}
