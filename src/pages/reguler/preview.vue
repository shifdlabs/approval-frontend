<template>
  <div class="document-generator-container">
    <VRow>
      <!-- Form Input Data -->
      <VCol cols="12" lg="6">
        <VCard>
          <VCardTitle class="d-flex align-center gap-2">
            <VIcon icon="tabler-file-plus" size="24" />
            Create Document
          </VCardTitle>
          
          <VCardText>
            <VForm ref="formRef" @submit.prevent="generatePDF">
              <VRow>
                <VCol cols="12">
                  <VTextField
                    v-model="documentData.title"
                    label="Document Title"
                    prepend-icon="tabler-file-text"
                    required
                  />
                </VCol>
                
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="documentData.name"
                    label="Full Name"
                    prepend-icon="tabler-user"
                    required
                  />
                </VCol>
                
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="documentData.position"
                    label="Position"
                    prepend-icon="tabler-briefcase"
                    required
                  />
                </VCol>
                
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="documentData.date"
                    label="Date"
                    type="date"
                    prepend-icon="tabler-calendar"
                    required
                  />
                </VCol>
                
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="documentData.location"
                    label="Location"
                    prepend-icon="tabler-map-pin"
                    required
                  />
                </VCol>
                
                <VCol cols="12">
                  <VTextarea
                    v-model="documentData.content"
                    label="Document Content"
                    prepend-icon="tabler-file-description"
                    rows="4"
                    required
                  />
                </VCol>
                
                <VCol cols="12">
                  <VTextField
                    v-model="documentData.signature"
                    label="Signature Name"
                    prepend-icon="tabler-signature"
                    required
                  />
                </VCol>
              </VRow>
              
              <VDivider class="my-4" />
              
              <div class="d-flex gap-3">
                <VBtn
                  type="submit"
                  color="primary"
                  prepend-icon="tabler-file-export"
                  :loading="isGenerating"
                  :disabled="!isFormValid"
                >
                  Generate PDF
                </VBtn>
                
                <VBtn
                  variant="outlined"
                  prepend-icon="tabler-eye"
                  @click="previewHTML"
                  :disabled="!isFormValid"
                >
                  Preview HTML
                </VBtn>
                
                <VBtn
                  variant="tonal"
                  prepend-icon="tabler-refresh"
                  @click="resetForm"
                >
                  Reset
                </VBtn>
              </div>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
      
      <!-- Preview Area -->
      <VCol cols="12" lg="6">
        <VCard>
          <VCardTitle class="d-flex align-center gap-2">
            <VIcon icon="tabler-eye" size="24" />
            Document Preview
          </VCardTitle>
          
          <VCardText>
            <div v-if="isGenerating" class="text-center py-8">
              <VProgressCircular indeterminate size="64" />
              <p class="mt-2">Generating PDF...</p>
            </div>

            <div v-else-if="showHTMLPreview" class="html-preview-container">
              <div class="preview-controls mb-3">
                <VBtn
                  size="small"
                  variant="outlined"
                  prepend-icon="tabler-x"
                  @click="showHTMLPreview = false"
                >
                  Close Preview
                </VBtn>
              </div>
              
              <div 
                ref="htmlPreviewRef"
                class="html-preview"
                v-html="generatedHTML"
              ></div>
            </div>

            <div v-else-if="generatedPDFUrl" class="pdf-preview-container">
              <div class="preview-controls mb-3">
                <VBtn
                  size="small"
                  variant="outlined"
                  prepend-icon="tabler-download"
                  @click="downloadPDF"
                >
                  Download PDF
                </VBtn>
                
                <VBtn
                  size="small"
                  variant="outlined"
                  prepend-icon="tabler-x"
                  @click="closePDFPreview"
                >
                  Close
                </VBtn>
              </div>
              
              <iframe 
                :src="generatedPDFUrl"
                class="pdf-iframe"
                frameborder="0"
              ></iframe>
            </div>

            <div v-else class="text-center py-8">
              <VIcon icon="tabler-file-text" size="64" color="grey-lighten-1" />
              <p class="text-grey-lighten-1 mt-2">Fill the form and generate your document</p>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<script setup>
import html2pdf from 'html2pdf.js'
import { computed, ref } from 'vue'

// Form data
const documentData = ref({
  title: '',
  name: '',
  position: '',
  date: '',
  location: '',
  content: '',
  signature: ''
})

// Component state
const formRef = ref(null)
const htmlPreviewRef = ref(null)
const isGenerating = ref(false)
const showHTMLPreview = ref(false)
const generatedHTML = ref('')
const generatedPDFUrl = ref('')

// Computed
const isFormValid = computed(() => {
  return documentData.value.title && 
         documentData.value.name && 
         documentData.value.position && 
         documentData.value.date && 
         documentData.value.location && 
         documentData.value.content && 
         documentData.value.signature
})

// HTML Template Generator
const generateHTMLTemplate = () => {
  const data = documentData.value
  return `
    <div class="pdf-document">
      <div class="document-header">
        <h1 class="document-title">${data.title}</h1>
      </div>
      
      <div class="document-meta">
        <div class="meta-item">
          <span class="meta-label">Name</span>
          <span class="meta-value">${data.name}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Position</span>
          <span class="meta-value">${data.position}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Date</span>
          <span class="meta-value">${new Date(data.date).toLocaleDateString('id-ID')}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Location</span>
          <span class="meta-value">${data.location}</span>
        </div>
      </div>
      
      <div class="document-content">
        ${data.content.replace(/\n/g, '<br>')}
      </div>
      
      <div class="document-signature">
        <div class="signature-line"></div>
        <div class="signature-name">${data.signature}</div>
        <div class="signature-title">${data.position}</div>
      </div>
      
      <style>
        .pdf-document {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
          padding: 30px;
          max-width: 180mm;
          margin: 0 auto;
          min-height: 250mm;
        }
        
        .document-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 15px;
        }
        
        .document-title {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .document-meta {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          margin-bottom: 25px;
          background: #f8fafc;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #2563eb;
        }
        
        .meta-item {
          display: flex;
          flex-direction: column;
          margin-bottom: 10px;
          min-width: 120px;
        }
        
        .meta-label {
          font-size: 11px;
          font-weight: bold;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 3px;
        }
        
        .meta-value {
          font-size: 13px;
          font-weight: 500;
          color: #1e293b;
        }
        
        .document-content {
          background: white;
          padding: 25px;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
          line-height: 1.8;
          font-size: 13px;
          text-align: justify;
        }
        
        .document-signature {
          margin-top: 50px;
          text-align: right;
        }
        
        .signature-line {
          border-top: 1px solid #333;
          width: 180px;
          margin: 30px 0 8px auto;
        }
        
        .signature-name {
          font-weight: bold;
          font-size: 13px;
          margin-bottom: 3px;
        }
        
        .signature-title {
          font-size: 11px;
          color: #64748b;
        }
      </style>
    </div>
  `
}

// Methods
const previewHTML = () => {
  const htmlTemplate = generateHTMLTemplate()
  generatedHTML.value = `
    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      ${htmlTemplate}
    </div>
  `
  showHTMLPreview.value = true
  console.log('HTML Preview generated')
}

const generatePDF = async () => {
  if (!isFormValid.value) {
    alert('Please fill all required fields')
    return
  }

  try {
    isGenerating.value = true
    console.log('Starting PDF generation...')
    
    // Generate HTML content
    const htmlContent = generateHTMLTemplate()
    
    // Create a temporary wrapper div
    const wrapper = document.createElement('div')
    wrapper.innerHTML = htmlContent
    wrapper.style.position = 'absolute'
    wrapper.style.left = '-9999px'
    wrapper.style.top = '0'
    wrapper.style.width = '210mm' // A4 width
    wrapper.style.fontFamily = 'Arial, sans-serif'
    document.body.appendChild(wrapper)
    
    // Get the pdf-document element (our main content)
    const pdfElement = wrapper.querySelector('.pdf-document')
    if (!pdfElement) {
      console.error('PDF element not found. Wrapper content:', wrapper.innerHTML)
      throw new Error('Failed to create PDF content - document element not found')
    }
    
    console.log('PDF element found, proceeding with generation...')
    
    // PDF generation options
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${documentData.value.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.98 
      },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'] 
      }
    }
    
    // Generate PDF from the pdf-document element
    const pdf = html2pdf()
    const pdfBlob = await pdf.set(opt).from(pdfElement).toPdf().output('blob')
    
    // Create blob URL for preview
    if (generatedPDFUrl.value) {
      URL.revokeObjectURL(generatedPDFUrl.value)
    }
    generatedPDFUrl.value = URL.createObjectURL(pdfBlob)
    
    // Cleanup
    document.body.removeChild(wrapper)
    showHTMLPreview.value = false
    
    console.log('PDF generated successfully')
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert(`Error generating PDF: ${error.message}. Please try again.`)
  } finally {
    isGenerating.value = false
  }
}

const downloadPDF = async () => {
  if (!generatedPDFUrl.value) return
  
  try {
    // Create download link
    const link = document.createElement('a')
    link.href = generatedPDFUrl.value
    link.download = `${documentData.value.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('PDF download initiated')
  } catch (error) {
    console.error('Error downloading PDF:', error)
    alert('Error downloading PDF. Please try again.')
  }
}

const closePDFPreview = () => {
  if (generatedPDFUrl.value) {
    URL.revokeObjectURL(generatedPDFUrl.value)
  }
  generatedPDFUrl.value = ''
}

const resetForm = () => {
  documentData.value = {
    title: '',
    name: '',
    position: '',
    date: '',
    location: '',
    content: '',
    signature: ''
  }
  
  closePDFPreview()
  showHTMLPreview.value = false
  generatedHTML.value = ''
  
  console.log('Form reset')
}
</script>

<style scoped>
.document-generator-container {
  padding: 24px;
}

.preview-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.html-preview-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f5f5f5;
  padding: 16px;
}

.html-preview {
  background: white;
  border-radius: 4px;
  overflow: auto;
  max-height: 60vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pdf-preview-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f5f5f5;
  padding: 16px;
}

.pdf-iframe {
  width: 100%;
  height: 60vh;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Form styling */
:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-btn) {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .document-generator-container {
    padding: 16px;
  }
  
  .pdf-iframe {
    height: 50vh;
  }
  
  .html-preview {
    max-height: 50vh;
  }
}
</style>
