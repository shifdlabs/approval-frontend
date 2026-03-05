interface LoginResponse {
  success: boolean
  code: number
  message: string
  data: {
    access: boolean
    accessToken: string
    refreshToken: string
    name: string
    role: number
    id: string
    jobPosition: string
    userAbilityRules: any[]
  }
}
