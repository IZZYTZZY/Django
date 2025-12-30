import { apiClient } from './apiClient'

export async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) return null

  try {
    const response = await apiClient.post('/api/auth/token/refresh/', {
      refresh,
    })

    if (response.data?.access) {
      localStorage.setItem('access_token', response.data.access)
      return response.data.access
    }

    return null
  } catch {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    return null
  }
}
