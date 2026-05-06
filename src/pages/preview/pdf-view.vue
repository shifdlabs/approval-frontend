<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Document } from '@/models/document/document';
import { User } from '@/models/users/users';
import companyLogoDummy1 from '@images/custom/dummy-company-logo-1.png';
import { useApi } from '@/composables/useApi';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface Props {
  document: Document;
  bookingNumber: string | null;
  internalRecipients: User[]
  externalRecipients: string
  signers: User[]
  signersWithSignature: any[]  // Add approvers with signature data
  withLetterHead: boolean
}

const props = defineProps<Props>();

// Function to strip HTML tags and decode entities
const stripHtml = (html: string): string => {
  if (!html) return ''
  
  let text = html
  
  // Decode numeric entities (e.g., &#39; &#x27;)
  text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
  text = text.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
  
  // Manual entity replacement multiple times for nested encoding
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
  
  // Remove HTML tags
  const tmp = document.createElement('div')
  tmp.innerHTML = text
  return tmp.textContent || tmp.innerText || ''
}

const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})

// PDF Generation states
const isGeneratingPDF = ref(false)

// Letterhead data from database
const letterheadData = ref({
  companyLogoUrl: '',
  companyName: '',
  description: '',
  address: '',
  city: '',
  email: '',
  phoneNumber: ''
})

// Fetch letterhead settings from database
const fetchLetterheadSettings = async () => {
  try {
    const res = await useApi('/appsettings', { method: 'GET' });
    const apiResponse = res.data.value as any;

    const keyMapping: Record<string, string> = {
      'company_logo_url': 'companyLogoUrl',
      'company_name': 'companyName',
      'company_description': 'description',
      'company_address': 'address',
      'company_city': 'city',
      'company_email': 'email',
      'company_phone_number': 'phoneNumber'
    }

    if (apiResponse?.data) {
      const mappedData: any = {}
      apiResponse.data.forEach((item: any) => {
        const formKey = keyMapping[item.key]
        if (formKey) {
          mappedData[formKey] = item.value
        }
      })
      letterheadData.value = { ...letterheadData.value, ...mappedData }
    }
  } catch (error) {
    console.error('Error fetching letterhead settings:', error)
  }
}

// Fetch letterhead on mount
onMounted(() => {
  fetchLetterheadSettings()
})

// Helper function to convert image URL to base64
const imageUrlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, { mode: 'cors' })
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Failed to convert image to base64:', url, error)
    return url // Fallback to original URL
  }
}

// PDF Generation Functions
const generateDocumentHTMLTemplate = async () => {
  if (!props.document) return ''

  // Build recipients HTML exactly like A4PaperView with safety checks
  let recipientsHTML = ''
  if (props.internalRecipients && props.internalRecipients.length > 0) {
    recipientsHTML = props.internalRecipients.map((recipient, index) => 
      `<p class="name">Mr/Ms. ${recipient.firstName || ''} ${recipient.lastName || ''} - ${recipient.position?.name || ''}${index !== props.internalRecipients.length - 1 ? ',' : ''}</p>`
    ).join('')
  }
  
  if (props.externalRecipients && props.externalRecipients !== '') {
    const externalRecipients = props.externalRecipients.split(',')
    recipientsHTML += externalRecipients.map((recipient, index) => 
      `<p class="name">${recipient.trim()}${index !== externalRecipients.length - 1 && externalRecipients.length > 1 ? ',' : ''}</p>`
    ).join('')
  }

  // Signers HTML with signature images if available
  let signersHTML = ''
  
  // Convert signature images to base64 first
  const signersWithBase64Signatures = []
  if (props.signersWithSignature && props.signersWithSignature.length > 0) {
    for (const signer of props.signersWithSignature) {
      if (signer.signature && signer.signatureUrl) {
        const base64Image = await imageUrlToBase64(signer.signatureUrl)
        signersWithBase64Signatures.push({
          ...signer,
          signatureUrl: base64Image
        })
      }
    }
  }
  
  // Check if we have signers with signature data
  if (signersWithBase64Signatures.length > 0) {
    signersHTML = signersWithBase64Signatures
      .map((signer, index) => `
        <div class="signer">
          ${signer.signatureUrl ? `<img src="${signer.signatureUrl}" alt="Signature" class="signature-img" />` : ''}
          <p class="name">${signer.name || ''}</p>
          <p class="position">${signer.title || ''}</p>
        </div>
      `).join('')
  } else if (props.signers && props.signers.length > 0) {
    // Fallback to old signers format
    signersHTML = props.signers.map((signer, index) => `
      <div class="signer">
        <p class="name">${signer.firstName || ''} ${signer.lastName || ''}</p>
        <p class="position">${signer.position?.name || ''}</p>
      </div>
    `).join('')
  }

  // Check if body content is VERY long (more than 5 paragraphs AND 1500+ characters)
  const bodyContent = props.document.body || ''
  const paragraphCount = (bodyContent.match(/<p>/g) || []).length
  const wordCount = bodyContent.replace(/<[^>]*>/g, '').length
  const isVeryLongContent = paragraphCount >= 5 && wordCount > 1500

  // Only add page break class if content is VERY long
  const bodyClass = isVeryLongContent ? 'body very-long-content' : 'body'

  // Get letterhead logo - use DB logo if available, otherwise fallback to dummy
  let letterheadLogo = companyLogoDummy1
  if (letterheadData.value.companyLogoUrl) {
    try {
      letterheadLogo = await imageUrlToBase64(letterheadData.value.companyLogoUrl)
    } catch (error) {
      console.warn('Failed to load letterhead logo, using default')
    }
  }

  // Use DB letterhead data if available, otherwise use hardcoded defaults
  const companyName = letterheadData.value.companyName || 'Pacific Innovations Corporation'
  const companyAddress = letterheadData.value.address || '55 Montgomery Street, Suite 2100, Financial District, San Francisco, CA 94104'
  const companyCity = letterheadData.value.city || 'United States of America'
  const companyPhone = letterheadData.value.phoneNumber || '+1 (415) 555-7890'
  const companyEmail = letterheadData.value.email || 'contact@pacificinnovations.com'
  const companyDescription = letterheadData.value.description || ''

  return `
    <div class="pdf-document">
      <div class="letter">
        <!-- Letterhead Section (Dynamic from Database) -->
        <div class="letterhead">
          <div class="letterhead-logo">
            <img src="${letterheadLogo}" alt="Company Logo" class="logo" />
          </div>
          <div class="letterhead-info">
            <h1 class="company-name">${companyName}</h1>
            <p class="company-details">${companyAddress}<br>${companyCity}</p>
            <p class="company-contact">Phone: ${companyPhone} | Email: ${companyEmail}</p>
            ${companyDescription ? `<p class="company-description">${companyDescription}</p>` : ''}
          </div>
        </div>

        <!-- Empty title space -->
        <h1 class="title"></h1>
        
        <!-- Document Info Section -->
        <div class="sub-title-right">
          <p class="text">${currentDate.value}</p>
          ${props.bookingNumber ? `<p class="text">Ref: ${props.bookingNumber}</p>` : ''}
          <p class="text">${props.document.type == '1' ? 'Internal' : 'External'}</p>
        </div>

        <!-- Recipients Section -->
        <div class="dear">
          <p class="title">Dear,</p>
          ${recipientsHTML}
        </div>

        <!-- Subject Section -->
        ${props.document.subject && props.document.subject !== '' ? `
        <div class="subject">
          <span class="title">Subject: </span>${stripHtml(props.document.subject)}
        </div>` : ''}

        <!-- Body Content -->
        <div class="${bodyClass}">
          ${stripHtml(props.document.body || '')}
        </div>

        <!-- Closing -->
        <div class="closing">
          <p>Sincerely,</p>
        </div>

        <!-- Signature Section -->
        ${signersHTML ? `
        <div class="signature">
          <div class="signers">
            ${signersHTML}
          </div>
        </div>` : ''}
      </div>
      </div>
      <style>
        .pdf-document {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          box-sizing: border-box;
          font-size: 1rem;
        }
        
        .letter {
          display: flex;
          flex-direction: column;
          font-family: 'Times New Roman', Times, serif;
        }
        
        .letterhead {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1rem 0.75rem 1rem;
          border-bottom: 4px solid #000;
        }
        
        .letterhead-logo {
          flex-shrink: 0;
          width: 140px;
        }
        
        .logo {
          width: 100%;
          height: auto;
          max-height: 140px;
          object-fit: contain;
          display: block;
        }
        
        .letterhead-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          text-align: center;
        }
        
        .company-name {
          font-size: 1.75rem;
          font-weight: bold;
          color: #2c3e50;
          margin: 0 0 0.4rem 0;
          line-height: 1.2;
        }
        
        .company-details {
          font-size: 0.95rem;
          color: #7f8c8d;
          line-height: 1.6;
          margin: 0 0 0.2rem 0;
        }
        
        .company-contact {
          font-size: 0.9rem;
          color: #7f8c8d;
          line-height: 1.4;
          margin: 0;
        }
        
        .company-description {
          font-size: 0.9rem;
          color: #95a5a6;
          font-style: italic;
          margin: 0;
          line-height: 1.3;
        }
        
        .sub-title-right {
          display: inline-block;
          text-align: right;
          margin-left: auto;
          margin-top: 50px;
        }
        
        .sub-title-right .text {
          text-align: left;
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: -2px;
        }
        
        .subject {
          display: flex;
          align-items: center;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        
        .subject .title {
          font-weight: 700;
          margin-right: 0.25rem;
        }
        
        .dear {
          font-size: 1rem;
          margin-bottom: 1rem;
        }
        
        .dear .title {
          font-style: italic;
          margin-bottom: 0.5rem;
        }
        
        .dear > p {
          margin-bottom: 0rem;
        }
        
        .dear .name {
          margin-bottom: 0.25rem;
          font-weight: 600;
        }
        
        .dear .name:last-child {
          margin-bottom: 0;
        }
        
        .body {
          flex: 1;
          font-size: 1rem;
          line-height: 1.6;
          text-align: justify;
          margin-bottom: 2rem;
          margin-top: 1rem;
        }
        
        .body.very-long-content {
          page-break-before: always;
          margin-top: 2rem;
        }
        
        .body p {
          margin-bottom: 1rem;
        }
        
        .closing {
          margin-top: auto;
          font-size: 1rem;
        }
        
        .closing p {
          margin-bottom: 0.5rem;
        }
        
        .signature {
          margin-top: 5rem;
        }
        
        .signers {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
        }
        
        .signer {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 250px;
        }
        
        .signer .signature-img {
          width: 150px;
          height: 150px;
          object-fit: contain;
          margin-bottom: 0.5rem;
        }
        
        .signer .name {
          font-weight: 700;
          margin-bottom: 0rem;
        }
        
        .signer .position {
          font-style: normal;
        }
      </style>
    </div>
  `
}


const generateDocumentPDF = async () => {
  if (!props.document) {
    alert('Document data not available')
    return
  }

  try {
    isGeneratingPDF.value = true
    
    // Generate HTML content (with base64 signatures)
    const htmlContent = await generateDocumentHTMLTemplate()
    
    // Create a temporary wrapper div
    const wrapper = window.document.createElement('div')
    wrapper.innerHTML = htmlContent
    wrapper.style.position = 'absolute'
    wrapper.style.left = '-9999px'
    wrapper.style.top = '0'
    wrapper.style.width = '210mm'
    wrapper.style.fontFamily = 'Arial, sans-serif'
    window.document.body.appendChild(wrapper)
    
    // Get the pdf-document element
    const pdfElement = wrapper.querySelector('.pdf-document')
    if (!pdfElement) {
      throw new Error('Failed to create PDF content - document element not found')
    }
    
    // Wait for all images to load (including signatures)
    const images = pdfElement.querySelectorAll('img')
    
    if (images.length > 0) {
      const imageLoadPromises = Array.from(images).map((img) => {
        return new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
          } else {
            img.onload = () => resolve()
            img.onerror = () => resolve() // Resolve anyway to not block PDF generation
          }
        })
      })
      
      await Promise.all(imageLoadPromises)
    }
    
    // Give browser time to render base64 images in DOM
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // PDF generation options
    const opt = {
      margin: [15, 15, 15, 15],
      filename: `${props.bookingNumber || 'document'}_${new Date().toISOString().split('T')[0]}.pdf`,
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
        backgroundColor: '#ffffff',
        height: null,
        width: null
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true,
        putOnlyUsedFonts: true
      },
      pagebreak: { 
        mode: ['css', 'legacy'],
        before: ['.very-long-content'],
        avoid: ['div.signature', 'div.signer', 'div.letterhead', 'div.subject', 'div.dear']
      }
    }
    
    // Generate PDF
    const pdf = html2pdf()
    const pdfBlob = await pdf.set(opt).from(pdfElement).toPdf().output('blob')
    
    // Create blob URL and open in new tab
    const pdfUrl = URL.createObjectURL(pdfBlob)
    const newTab = window.open(pdfUrl, '_blank')
    
    if (!newTab) {
      // Fallback if popup is blocked - show download option
      alert('Popup blocked! The PDF will be downloaded instead.')
      const link = window.document.createElement('a')
      link.href = pdfUrl
      link.download = `${props.bookingNumber || 'document'}_${new Date().toISOString().split('T')[0]}.pdf`
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
    }
    
    // Cleanup
    window.document.body.removeChild(wrapper)
    
    // Clean up the blob URL after a short delay to allow the tab to load
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl)
    }, 1000)
    
  } catch (error: any) {
    console.error('Error generating PDF:', error)
    alert(`Error generating PDF: ${error.message}. Please try again.`)
  } finally {
    isGeneratingPDF.value = false
  }
}

// Expose generateDocumentPDF function to parent component
defineExpose({
  generateDocumentPDF,
  isGeneratingPDF
})
</script>

<template>
  <!-- PDF View component - no template needed as it's used for programmatic PDF generation -->
</template>
