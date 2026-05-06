import { onMounted, ref } from 'vue';
import { uploadS3File, deleteS3File, S3BucketUrl } from '@/utils/s3';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export function letterHeadController() {
    interface ApiItem {
        key: string;
        value: string;
      }
      interface ApiResponse {
        success: boolean;
        code: number;
        message: string;
        data: ApiItem[];
      }

      type LetterHead = {
        companyLogoUrl: string;
        companyName: string;
        description: string;
        email: string;
        phoneNumber: string;
        address: string;
        city: string;
      };

      type FilePayload = {
        file: File;
        filename: string;
        size: number;
        fileType: string;
      };
      
      // const imageUrl = ref('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhm_gybReuB4yJ2V1C8QHxfxdruEyh3ANLu8MnldqIzvZCO_EW0buWTNmoUImSW5lGhklijP60NVbrz3AcHR6eoLjct31M15FdO7O_ASD2xeC7imD6HKpP_W2FwVv-uquwkJCTQgHnTa_O0dOW-RXHmzZ7L24y3fiAFd-KlY4YzODnPjItCebG4Nl00Kg/s1581/Logo%20Shell.png')
      const imageUrl = ref('')
      const companyLogoFile = ref<FilePayload | null>(null)
      const isImageMarkedForDeletion = ref(false) // Flag to track if image should be deleted on save
      const initialFormData = ref<LetterHead>({
        companyLogoUrl: '',
        companyName: '',
        description: '',
        address: '',
        city: '',
        email: '',
        phoneNumber: ''
      })
      const isSuccessSnackbarVisible = ref(false)
      const isSaving = ref(false)
      
      const keyMapping: Record<string, keyof LetterHead> = {
        company_logo_url:        'companyLogoUrl',
        company_name:            'companyName',
        company_description:     'description',
        company_email:           'email',
        company_phone_number:    'phoneNumber',
        company_address:         'address',
        company_city:            'city',
      };

      function extractFilename(url: string | undefined | null): string {
        // Returns the substring after the last '/'
        if (!url) return '';
        return url.split('/').pop() || '';
      }
      
      const fetchValue = async (): Promise<void> => {
        try {
          const res = await useApi('/appsettings', { method: 'GET' });
          const apiResponse = res.data.value as ApiResponse;

          // Build a fresh LetterHead object from the key/value pairs
          const mappedData = apiResponse.data.reduce<LetterHead>((acc, curr) => {
            const formKey = keyMapping[curr.key];
            if (formKey) {
              acc[formKey] = curr.value;
            }
            return acc;
          }, {} as LetterHead);

          // Only update if there's actual data from backend
          if (Object.keys(mappedData).length > 0) {
            initialFormData.value = { ...initialFormData.value, ...mappedData };
          }
          
          // Set imageUrl if there's a saved logo
          if (mappedData.companyLogoUrl) {
            imageUrl.value = mappedData.companyLogoUrl;
          }
          
          // Clear deletion flag on load
          isImageMarkedForDeletion.value = false
        } catch (error) {
          console.error('Error fetching app settings:', error);
        }
      };
      
      const updateLetterhead = async () => {
        try {
          isSaving.value = true
          
          // Handle image deletion if marked
          if (isImageMarkedForDeletion.value && initialFormData.value?.companyLogoUrl) {
            await deleteS3File(`app-assets/${extractFilename(initialFormData.value.companyLogoUrl)}`)
            initialFormData.value.companyLogoUrl = ''
            isImageMarkedForDeletion.value = false
          }
          
          // Upload new file if provided
          if (companyLogoFile.value != null) {
            // Delete old file if exists (and not already deleted above)
            if (!isImageMarkedForDeletion.value && initialFormData.value?.companyLogoUrl && initialFormData.value.companyLogoUrl !== '') {
              await deleteS3File(`app-assets/${extractFilename(initialFormData.value.companyLogoUrl)}`)
            }

            const extension = companyLogoFile.value?.file.name.split('.').pop()
            const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${extension}`
            const fileName = `app-assets/${uniqueName}`

            await uploadS3File(companyLogoFile.value?.file, fileName)
            initialFormData.value.companyLogoUrl = `${S3BucketUrl}${fileName}`
            companyLogoFile.value = null // Clear temp file after upload
          }

          const { error } = await useApi('/appsettings', {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              properties: [
                {
                  key: 'company_logo_url',
                  value: initialFormData.value.companyLogoUrl,
                },
                {
                  key: 'company_name',
                  value: initialFormData.value.companyName,
                },
                {
                  key: 'company_description',
                  value: initialFormData.value.description,
                },
                {
                  key: 'company_email',
                  value: initialFormData.value.email,
                },
                {
                  key: 'company_phone_number',
                  value: initialFormData.value.phoneNumber,
                },
                {
                  key: 'company_address',
                  value: initialFormData.value.address,
                },
                {
                  key: 'company_city',
                  value: initialFormData.value.city,
                },
              ],
            }),
          })

          if (error.value) {
            console.error(error.value)
            isSaving.value = false
            return
          }

          // Update imageUrl to reflect saved state
          imageUrl.value = initialFormData.value.companyLogoUrl
          isSuccessSnackbarVisible.value = true

        } catch (e) {
          console.error(e)
        } finally {
          isSaving.value = false
        }
      }

      const previewLetterhead = async () => {
        // Determine logo source - prioritize uploaded file, then check if image is marked for deletion
        let logoBase64 = ''
        let hasLogo = false
        
        // If user marked image for deletion, don't show it in preview
        if (isImageMarkedForDeletion.value) {
          console.log('Image marked for deletion - preview without logo')
          hasLogo = false
        } else if (companyLogoFile.value?.file) {
          // If user just uploaded a new file, convert directly to base64
          try {
            logoBase64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(companyLogoFile.value!.file)
            })
            console.log('Using newly uploaded file for preview')
            hasLogo = true
          } catch (error) {
            console.error('Failed to convert uploaded file to base64:', error)
            alert('Failed to load letterhead image. Please try again.')
            return
          }
        } else if (initialFormData.value.companyLogoUrl) {
          // Use saved logo URL from DB
          logoBase64 = initialFormData.value.companyLogoUrl
          console.log('Using saved logo URL for preview')
          hasLogo = true
        }

        // Generate HTML with letterhead - logo section only if hasLogo is true
        const logoSection = hasLogo ? `
          <div class="letterhead-logo">
            <img src="${logoBase64}" alt="Letterhead" class="letterhead-image" />
          </div>
        ` : ''

        const letterheadHTML = `
          <div class="pdf-document">
            <div class="letterhead-preview">
              <div class="letterhead-content">
                ${logoSection}
                
                <div class="letterhead-info ${!hasLogo ? 'no-logo' : ''}">
                  <h1 class="company-name">${initialFormData.value.companyName || 'Company Name'}</h1>
                  <p class="company-details">${initialFormData.value.address ? `${initialFormData.value.address}${initialFormData.value.city ? '<br>' + initialFormData.value.city : ''}` : 'Address information'}</p>
                  <p class="company-contact">
                    ${initialFormData.value.phoneNumber ? `Phone: ${initialFormData.value.phoneNumber}` : 'Phone: N/A'} 
                    | 
                    ${initialFormData.value.email ? `Email: ${initialFormData.value.email}` : 'Email: N/A'}
                  </p>
                  ${initialFormData.value.description ? `<p class="company-description">${initialFormData.value.description}</p>` : ''}
                </div>
              </div>
            </div>
          </div>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            .pdf-document {
              width: 100%;
              max-width: 900px;
              margin: 0 auto;
              padding: 2rem;
              background: white;
              font-size: 1rem;
              font-family: 'Times New Roman', Times, serif;
            }
            
            .letterhead-preview {
              width: 100%;
              padding: 1rem 1rem 0.75rem 1rem;
              border-bottom: 4px solid #000;
              margin-bottom: 1.5rem;
            }
            
            .letterhead-content {
              display: flex;
              align-items: center;
              gap: 1rem;
            }
            
            .letterhead-logo {
              flex-shrink: 0;
              width: 140px;
            }
            
            .letterhead-image {
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
            
            .letterhead-info.no-logo {
              text-align: left;
            }
            
            .company-name {
              font-size: 1.75rem;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 0.4rem;
              line-height: 1.2;
            }
            
            .company-details {
              font-size: 0.95rem;
              color: #7f8c8d;
              line-height: 1.6;
              margin-bottom: 0.2rem;
            }
            
            .company-contact {
              font-size: 0.9rem;
              color: #7f8c8d;
              line-height: 1.4;
            }
            
            .company-description {
              font-size: 0.9rem;
              color: #95a5a6;
              font-style: italic;
              margin-top: 0rem;
              line-height: 1.3;
            }
          </style>
        `

        // Generate PDF and open in new tab
        try {
          const opt = {
            margin: 0,
            filename: 'Letterhead-Preview.pdf',
            html2canvas: { 
              scale: 3,
              useCORS: true,
              logging: false,
              letterRendering: true,
              allowTaint: false,
              backgroundColor: '#ffffff'
            },
            jsPDF: { 
              unit: 'mm', 
              format: 'a4', 
              orientation: 'portrait',
              compress: true
            }
          }

          // Generate PDF as blob
          const pdf = await html2pdf().set(opt).from(letterheadHTML).output('blob')
          
          // Create object URL and open in new tab
          const pdfUrl = URL.createObjectURL(pdf)
          window.open(pdfUrl, '_blank')
          
          // Clean up temporary URLs after a delay
          setTimeout(() => {
            URL.revokeObjectURL(pdfUrl)
          }, 1000)
        } catch (error) {
          console.error('Error generating PDF preview:', error)
          alert('Failed to generate PDF preview. Please try again.')
        }
      }

      const handleFileSelected = (payload: FilePayload): void => {
        const { file, filename, size, fileType } = payload;
        console.log('File:', file);
        console.log('Name:', filename);
        console.log('Size:', size);
        console.log('Type:', fileType);
        companyLogoFile.value = payload
        
        // Update imageUrl for preview in UI
        imageUrl.value = URL.createObjectURL(file)
        
        // Clear deletion flag since user uploaded new image
        isImageMarkedForDeletion.value = false
      };

      const removeImage = (): void => {
        // Clear the preview image
        imageUrl.value = ''
        companyLogoFile.value = null
        
        // Mark image for deletion on save (if there's a saved image)
        if (initialFormData.value.companyLogoUrl) {
          isImageMarkedForDeletion.value = true
        }
      };
      
      onMounted(() => {
        fetchValue()
      })

      return {
        imageUrl,
        initialFormData,
        isSuccessSnackbarVisible,
        isSaving,
        fetchValue,
        updateLetterhead,
        previewLetterhead,
        handleFileSelected,
        removeImage,
      }
}
