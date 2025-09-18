import { useAuthStore } from './stores/auth-store'

class ApiClient {
  private baseUrl = '/api'

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = useAuthStore.getState().token
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // Auth
  async connectWallet(publicKey: string, signature: string) {
    return this.request('/auth/wallet', {
      method: 'POST',
      body: JSON.stringify({ publicKey, signature }),
    })
  }

  // Tracks
  async getTracks(search?: string, page = 1) {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    params.append('page', page.toString())
    
    return this.request(`/tracks?${params}`)
  }

  async createTrack(data: any) {
    return this.request('/tracks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Upload
  async uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    
    return fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${useAuthStore.getState().token}`,
      },
    }).then(res => res.json())
  }

  // Donations
  async createDonation(data: any) {
    return this.request('/donations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient()