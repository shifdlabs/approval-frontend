import { createFetch } from '@vueuse/core'
import { destr } from 'destr'
import { ofetch } from 'ofetch'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const useApi = createFetch({
  baseUrl: API_BASE_URL,
  fetchOptions: {
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include', // Include cookies for CORS requests
  },
  options: {
    refetch: true,
    async beforeFetch({ options }) {
      let accessToken = useCookie('accessToken').value

      if (accessToken) {
        console.log("Access Token Valid")
        if (isJwtExpired(accessToken)) {
          console.log("Access Token Expired", accessToken)
          try {
            await refreshingToken()
            accessToken = useCookie('accessToken').value

            // If still no valid token after refresh, stop request
            if (!accessToken || isJwtExpired(accessToken)) {
              throw new Error('Token refresh failed or still expired.')
            }
          } catch (err) {
            console.error('Token refresh error:', err)
            throw err // Let the caller handle the failure (e.g. redirect to login)
          }
        }
        console.log("Access Token Active", accessToken)

        // Attach access token to headers
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        }
      }

      return { options }
    },
    afterFetch(ctx) {
      const { data, response } = ctx

      let parsedData = null
      try {
        parsedData = destr(data)
      } catch (error) {
        console.error('Failed to parse response:', error)
      }

      return { data: parsedData, response }
    }
  },
})

const refreshingToken = async () => {
  try {
    const response = await $refreshTokenApi('/refresh', {
      method: 'POST',
      credentials: 'include', // Include cookies for refresh token,
      body: {
        refreshToken: useCookie('refreshToken').value
      }
    })

    const payload = response?.data
    // If your refresh API returns { accessToken, refreshToken }
    console.log('Refresh response:', payload.accessToken)
    if (payload?.accessToken) {
      useCookie('accessToken').value = payload.accessToken
      // useCookie('refreshToken').value = data.refreshToken
      console.log('✅ Token refreshed successfully')
    } else {
      throw new Error('No tokens in refresh response.')
    }
  } catch (err) {
    console.error('❌ Refresh token failed:', err)
    useCookie('accessToken').value = null
    throw err
  }
}

export const $refreshTokenApi = ofetch.create({
  baseURL: API_BASE_URL,
  async onRequest({ options }) {
    const accessToken = useCookie('accessToken').value

    if (accessToken) {
      // Create a Headers instance from the current headers
      const headers = new Headers(options.headers)

      // Set Authorization
      headers.set('Authorization', `Bearer ${accessToken}`)

      // Reassign the updated Headers object
      options.headers = headers
    }
  },
})

function isJwtExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split('.')[1]
    const payload = JSON.parse(atob(payloadBase64))

    if (!payload.exp) {
      throw new Error("Token missing 'exp' field.")
    }

    const currentTime = Math.floor(Date.now() / 1000)
    return currentTime >= payload.exp
  } catch (error) {
    console.error('Invalid token or decode error:', error)
    return true
  }
}
