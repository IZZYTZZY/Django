import { apiClient } from './apiClient'

export async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) return null

  try {
    const res = await apiClient.post('/api/auth/token/refresh/', {
      refresh,
    })

    if (res.data?.access) {
      localStorage.setItem('access_token', res.data.access)
      return res.data.access
    }

    return null
  } catch {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    return null
  }
}
