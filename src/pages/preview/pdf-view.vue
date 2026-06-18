<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Document } from '@/models/document/document';
import { User } from '@/models/users/users';
import companyLogoDummy1 from '@images/custom/dummy-company-logo-1.png';
import { useApi } from '@/composables/useApi';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import QRCode from 'qrcode';

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

  // Generate QR code if document is finished (status == 2)
  let qrCodeDataUrl = ''
  if (props.document.status === 2) {
    const verificationUrl = `${window.location.origin}/verification/${props.document.id}`
    qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 140, margin: 1 })
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

        <!-- ── Letterhead ── -->
        <div class="letterhead">
          <div class="letterhead-logo">
            <img src="${letterheadLogo}" alt="Company Logo" class="logo" />
          </div>
          <div class="letterhead-info">
            <h1 class="company-name">${companyName}</h1>
            <p class="company-details">${companyAddress} &nbsp;|&nbsp; ${companyCity}</p>
            <p class="company-contact">Telp: ${companyPhone} &nbsp;|&nbsp; Email: ${companyEmail}</p>
            ${companyDescription ? `<p class="company-description">${companyDescription}</p>` : ''}
          </div>
        </div>

        <!-- ── Date / Ref / Type ── -->
        <div class="doc-meta">
          <p>${currentDate.value}</p>
          ${props.bookingNumber ? `<p>No: <strong>${props.bookingNumber}</strong></p>` : ''}
          <p>${props.document.type == '1' ? 'Sifat: Internal' : 'Sifat: External'}</p>
        </div>

        <!-- ── Recipients ── -->
        ${recipientsHTML ? `
        <div class="dear">
          <p class="dear-label">Kepada Yth.,</p>
          ${recipientsHTML}
        </div>` : ''}

        <!-- ── Subject ── -->
        ${props.document.subject ? `
        <div class="subject-line">
          <span class="subject-label">Perihal&nbsp;:</span>
          <span class="subject-value">${props.document.subject}</span>
        </div>` : ''}

        <div class="divider-thin"></div>

        <!-- ── Body ── -->
        <div class="${bodyClass}">
          ${props.document.body || ''}
        </div>

        <!-- ── Closing ── -->
        <div class="closing">
          <p>Hormat kami,</p>
        </div>

        <!-- ── Signatures ── -->
        ${signersHTML ? `
        <div class="signature">
          <div class="signers">
            ${signersHTML}
          </div>
        </div>` : ''}

        <!-- ── QR Code (dokumen selesai) ── -->
        ${qrCodeDataUrl ? `
        <div class="qr-verification-wrapper">
          <div class="qr-verification">
            <img src="${qrCodeDataUrl}" alt="QR Verifikasi" class="qr-img" />
            <p class="qr-label">Verifikasi Dokumen</p>
          </div>
        </div>` : ''}

      </div>
    </div>

    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }

      .pdf-document {
        width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        padding: 18mm 20mm 18mm 20mm;
        background: #ffffff;
        font-family: 'Times New Roman', Times, serif;
        font-size: 11pt;
        color: #1a1a1a;
      }

      .letter {
        display: flex;
        flex-direction: column;
        min-height: calc(297mm - 36mm);
      }

      /* ── Letterhead ── */
      .letterhead {
        display: flex;
        align-items: center;
        gap: 14px;
        padding-bottom: 10px;
        border-bottom: 3px solid #1a1a1a;
        margin-bottom: 0;
      }

      .letterhead-logo {
        flex-shrink: 0;
        width: 72px;
      }

      .logo {
        width: 72px;
        height: 72px;
        object-fit: contain;
        display: block;
      }

      .letterhead-info {
        flex: 1;
        text-align: center;
        line-height: 1.35;
      }

      .company-name {
        font-size: 18pt;
        font-weight: 700;
        color: #1a1a1a;
        letter-spacing: 0.5px;
        margin-bottom: 3px;
      }

      .company-details {
        font-size: 9pt;
        color: #555;
        margin-bottom: 2px;
      }

      .company-contact {
        font-size: 9pt;
        color: #555;
      }

      .company-description {
        font-size: 8.5pt;
        color: #888;
        font-style: italic;
        margin-top: 3px;
      }

      /* ── Doc meta (date/no/sifat) ── */
      .doc-meta {
        margin-top: 22px;
        margin-left: auto;
        text-align: right;
        line-height: 1.6;
        font-size: 10.5pt;
      }

      .doc-meta p {
        margin: 0;
      }

      /* ── Recipients ── */
      .dear {
        margin-top: 20px;
        font-size: 11pt;
        line-height: 1.5;
      }

      .dear-label {
        font-style: italic;
        margin-bottom: 2px;
      }

      .dear .name {
        font-weight: 600;
        margin: 1px 0;
      }

      /* ── Subject ── */
      .subject-line {
        display: flex;
        gap: 8px;
        margin-top: 14px;
        font-size: 11pt;
        line-height: 1.5;
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

      /* ── Thin divider ── */
      .divider-thin {
        border: none;
        border-top: 1px solid #ccc;
        margin: 14px 0;
      }

      /* ── Body ── */
      .body {
        font-size: 11pt;
        line-height: 1.75;
        text-align: justify;
        margin-bottom: 24px;
        word-break: break-word;
      }

      .body p {
        margin-bottom: 10px;
      }

      .body p:last-child {
        margin-bottom: 0;
      }

      .body strong, .body b { font-weight: 700; }
      .body em, .body i    { font-style: italic; }
      .body u              { text-decoration: underline; }

      .body ul, .body ol {
        padding-left: 20px;
        margin-bottom: 10px;
      }

      .body ul li, .body ol li {
        margin-bottom: 4px;
      }

      .body h1 { font-size: 14pt; font-weight: 700; margin-bottom: 8px; }
      .body h2 { font-size: 13pt; font-weight: 700; margin-bottom: 7px; }
      .body h3 { font-size: 12pt; font-weight: 700; margin-bottom: 6px; }

      .body.very-long-content {
        page-break-before: always;
      }

      /* ── Closing ── */
      .closing {
        margin-top: 28px;
        font-size: 11pt;
      }

      .closing p {
        margin-bottom: 4px;
      }

      /* ── Signatures ── */
      .signature {
        margin-top: 56px;
      }

      .signers {
        display: flex;
        flex-wrap: wrap;
        gap: 40px;
      }

      .signer {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 160px;
        text-align: center;
      }

      .signer .signature-img {
        width: 110px;
        height: 80px;
        object-fit: contain;
        margin-bottom: 4px;
      }

      .signer .name {
        font-weight: 700;
        font-size: 10.5pt;
        border-top: 1px solid #333;
        padding-top: 4px;
        min-width: 160px;
        text-align: center;
      }

      .signer .position {
        font-size: 10pt;
        color: #555;
        margin-top: 1px;
      }

      /* ── QR Code ── */
      .qr-verification-wrapper {
        display: flex;
        justify-content: flex-end;
        padding-right: 4px;
        padding-bottom: 4px;
        margin-top: 28px;
      }

      .qr-verification {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .qr-img {
        width: 90px;
        height: 90px;
      }

      .qr-label {
        font-size: 7pt;
        color: #888;
        margin: 0;
        text-align: center;
        letter-spacing: 0.3px;
      }
    </style>
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
      margin: 0,
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
        windowWidth: 794, // 210mm at 96dpi
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
        avoid: ['div.signature', 'div.signer', 'div.letterhead', 'div.subject-line', 'div.dear']
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
