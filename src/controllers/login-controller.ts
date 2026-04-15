import { VForm } from 'vuetify/components'

export function loginController() {
    definePage({
        meta: {
          layout: 'blank',
          unauthenticatedOnly: false,
        },
      })
      
      const isPasswordVisible = ref(false)
      const route = useRoute()
      const router = useRouter()
      // const ability = useAbility()
      
      const refVForm = ref<VForm>()
      const isLoginError = ref(false)
      const loginErrorMessage = ref('')
      const isAccountInactive = ref(false)
      const isInProgress = ref(false)
      
      // const credentials = ref({
      //   email: 'admin@approval.com',
      //   password: 'Test1234!',
      //   remember: false
      // })
      const credentials = ref({
        email: 'user2@approval.com',
        password: 'Test1234!',
        remember: false
      })
      
const login = async () => {
  try {
    const { data, error } = await useApi<LoginResponse>('/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.value.email,
        password: credentials.value.password,
      }),
    })

    if (error.value) {
      isInProgress.value = false
      
      console.log('Full error object:', error.value)
      console.log('Error type:', typeof error.value)
      
      let errorMsg = 'Login failed. Please try again.'
      let errorCode = 500
      
      // Check if error is an object with our backend response structure
      if (typeof error.value === 'object' && error.value !== null) {
        console.log('Error object keys:', Object.keys(error.value))
        
        // Try to extract from parsed error response
        if (error.value.message) {
          errorMsg = error.value.message
        } else if (error.value.Message) {
          errorMsg = error.value.Message
        }
        
        if (error.value.code) {
          errorCode = error.value.code
        } else if (error.value.statusCode) {
          errorCode = error.value.statusCode
        }
      } else if (typeof error.value === 'string') {
        // Fallback for plain string errors
        errorMsg = error.value
      }
      
      console.log('Final - Code:', errorCode, 'Message:', errorMsg)
      
      loginErrorMessage.value = errorMsg
      
      if (errorCode === 403) {
        // Account locked or access disabled
        isLoginError.value = true
        isAccountInactive.value = false
      } else if (errorCode === 400) {
        // Wrong password with attempts remaining
        isLoginError.value = true
        isAccountInactive.value = false
      } else {
        isLoginError.value = true
        isAccountInactive.value = false
      }
      return
    }

    const user = data.value?.data

    if (user?.access) {
      isAccountInactive.value = false
      isLoginError.value = false
      loginErrorMessage.value = ''

      useCookie('accessToken').value = user.accessToken
      useCookie('refreshToken').value = user.refreshToken
      useCookie('name').value = user.name
      useCookie('role').value = `${user.role}`
      useCookie('userId').value = user.id
      useCookie('jobPosition').value = user.jobPosition
      useCookie('userAbilityRules').value = `${user.userAbilityRules}`

      await nextTick(() => {
        window.location.href = user.role === 99 ? '/admin/users' : '/reguler/dashboard'
      })
    } else {
      isAccountInactive.value = true
      loginErrorMessage.value = 'The account has been disabled, contact your administrator.'
      isInProgress.value = false
    }
  } catch (err) {
    console.error('Catch block error:', err)
    isLoginError.value = true
    loginErrorMessage.value = 'An unexpected error occurred. Please try again.'
    isInProgress.value = false
  }
}
      
      const onSubmit = () => {
        refVForm.value?.validate()
          .then(({ valid: isValid }) => {
            if (isValid)
              isInProgress.value = true
              setTimeout(() => {
                isLoginError.value = false
                login()
              }, 1500)
          })
      }

      return {
        isPasswordVisible,
        route,
        router,
        refVForm,
        isLoginError,
        loginErrorMessage,
        isAccountInactive,
        isInProgress,
        credentials,
        login,
        onSubmit
      }
}
