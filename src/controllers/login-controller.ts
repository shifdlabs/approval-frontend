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
      const res = error.value.response?._data
      if (res?.code === 403) {
        isInProgress.value = false
        isLoginError.value = true
      } else {
        isLoginError.value = true
        isInProgress.value = false
      }
      return
    }

    const user = data.value?.data

    if (user?.access) {
      isAccountInactive.value = false

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
      isInProgress.value = false
    }
  } catch (err) {
    console.error(err)
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
        isAccountInactive,
        isInProgress,
        credentials,
        login,
        onSubmit
      }
}
