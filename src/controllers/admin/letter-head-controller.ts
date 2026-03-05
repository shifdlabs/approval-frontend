import { onMounted, ref } from 'vue';

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
      
      const keyMapping: Record<string, keyof LetterHead> = {
        company_logo_url:        'companyLogoUrl',
        company_name:            'companyName',
        company_description:     'description',
        company_email:           'email',
        company_phone_number:    'phoneNumber',
        company_address:         'address',
        company_city:            'city',
      };

      function extractFilename(url: string): string {
        // Returns the substring after the last '/'
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

          // Assign into your ref
          initialFormData.value = mappedData;
        } catch (error) {
          console.error('Error fetching app settings:', error);
        }
      };
      
      const updateLetterhead = async () => {
        try {
          // Upload file if provided
          if (companyLogoFile.value != null) {
            if (initialFormData.value?.companyLogoUrl != '') {
              await deleteFile(`app-assets/${extractFilename(initialFormData.value.companyLogoUrl)}`)
            }

            const extension = companyLogoFile.value?.file.name.split('.').pop()
            const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${extension}`
            const fileName = `app-assets/${uniqueName}`

            await uploadFile(companyLogoFile.value?.file, fileName)
            initialFormData.value.companyLogoUrl = `${S3BucketUrl}${fileName}`
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
            return
          }

          isSuccessSnackbarVisible.value = true

        } catch (e) {
          console.error(e)
        }
      }

      const handleFileSelected = (payload: FilePayload): void => {
        const { file, filename, size, fileType } = payload;
        console.log('File:', file);
        console.log('Name:', filename);
        console.log('Size:', size);
        console.log('Type:', fileType);
        companyLogoFile.value = payload
        // Upload or process as needed...
      };
      
      onMounted(() => {
        fetchValue()
      })

      return {
        imageUrl,
        initialFormData,
        isSuccessSnackbarVisible,
        fetchValue,
        updateLetterhead,
        handleFileSelected,
      }
}
