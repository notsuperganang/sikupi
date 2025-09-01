/**
 * Utility functions for making authenticated admin API calls
 */

/**
 * Make an authenticated API call to admin endpoints
 */
export async function adminApiCall(
  endpoint: string, 
  accessToken: string,
  options: RequestInit = {}
) {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Hook-like utility for admin API calls (to be used in components)
 */
export class AdminAPI {
  constructor(private accessToken: string) {}

  async get(endpoint: string) {
    return adminApiCall(endpoint, this.accessToken, {
      method: 'GET',
    })
  }

  async post(endpoint: string, data?: any) {
    return adminApiCall(endpoint, this.accessToken, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch(endpoint: string, data?: any) {
    return adminApiCall(endpoint, this.accessToken, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(endpoint: string) {
    return adminApiCall(endpoint, this.accessToken, {
      method: 'DELETE',
    })
  }
}