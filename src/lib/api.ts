import axios from 'axios'

// Resolve API base URL:
// 1) Prefer VITE_API_BASE_URL (set in production)
// 2) Fallback to same-origin "/api" (useful when serving backend and frontend from one domain)
// 3) Finally, fallback to localhost for local dev
const envApiBase = import.meta.env?.VITE_API_BASE_URL as string | undefined
const API_BASE_URL = envApiBase
  || `${window.location.origin}/api`
  || 'http://43.204.211.201:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Enforce expected HTTP methods for known endpoints to avoid accidental GETs
type HttpMethod = 'get' | 'post' | 'put' | 'delete'

const routeMethodRules: Array<{ pattern: RegExp; method: HttpMethod }> = [
  { pattern: /^\/auth\/register\/?$/, method: 'post' },
  { pattern: /^\/auth\/login\/?$/, method: 'post' },
  { pattern: /^\/transactions\/?$/, method: 'post' }, // creation
  { pattern: /^\/transactions\/?$/, method: 'get' },  // list
  { pattern: /^\/transactions\/\d+\/?$/, method: 'put' },
  { pattern: /^\/transactions\/\d+\/?$/, method: 'delete' },
  { pattern: /^\/categories\/?$/, method: 'post' },   // creation
  { pattern: /^\/categories\/?$/, method: 'get' },    // list
  { pattern: /^\/categories\/\d+\/?$/, method: 'put' },
  { pattern: /^\/categories\/\d+\/?$/, method: 'delete' },
  { pattern: /^\/summary\/?$/, method: 'get' },
  { pattern: /^\/export\/?$/, method: 'get' },
]

api.interceptors.request.use((config) => {
  const url = (config.url || '').replace(API_BASE_URL, '')
  const method = (config.method || 'get').toLowerCase() as HttpMethod

  // Find all rules matching this URL
  const matchingRules = routeMethodRules.filter(r => r.pattern.test(url))
  if (matchingRules.length > 0) {
    // If any rule matches and expects a different method, correct it
    const allowedForThisUrl = new Set<HttpMethod>(matchingRules.map(r => r.method))
    if (!allowedForThisUrl.has(method)) {
      // Prefer POST over GET if both exist for base collection endpoints
      const preferred: HttpMethod = allowedForThisUrl.has('post') ? 'post' : Array.from(allowedForThisUrl)[0]
      console.warn(`[api] Adjusting method for ${url} from ${method.toUpperCase()} to ${preferred.toUpperCase()}`)
      config.method = preferred
    }
  }
  return config
})

// Types
export interface User {
  user_id: number
  username: string
  email: string
  created_at?: string
}

export interface Category {
  category_id: number
  user: number
  name: string
  is_default: boolean
}

export interface Transaction {
  transaction_id?: number
  user: number
  category: number
  category_name?: string
  date: string
  amount: number
  type: 'Income' | 'Expense'
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface Summary {
  total_income: number
  total_expense: number
  net_balance: number
  category_breakdown: {
    category_id: number
    category_name: string
    total: number
    percentage: number
  }[]
  transaction_count: number
}

// Auth API
export const authAPI = {
  register: async (data: { username: string; email: string; password: string }) => {
    const response = await api.post('/auth/register/', data)
    return response.data
  },
  
  login: async (data: { username: string; password: string }) => {
    const response = await api.post('/auth/login/', data)
    return response.data
  },
}

// Transaction API
export const transactionAPI = {
  getAll: async (userId: number, filters?: {
    category?: number
    type?: string
    start_date?: string
    end_date?: string
  }) => {
    const response = await api.get<Transaction[]>('/transactions/', {
      params: { user_id: userId, ...filters },
    })
    return response.data
  },
  
  create: async (data: Transaction) => {
    const response = await api.post<Transaction>('/transactions/', data)
    return response.data
  },
  
  update: async (id: number, data: Partial<Transaction>) => {
    const response = await api.put<Transaction>(`/transactions/${id}/`, data)
    return response.data
  },
  
  delete: async (id: number) => {
    await api.delete(`/transactions/${id}/`)
  },
}

// Category API
export const categoryAPI = {
  getAll: async (userId: number) => {
    const response = await api.get<Category[]>('/categories/', {
      params: { user_id: userId },
    })
    return response.data
  },
  
  create: async (data: { user: number; name: string }) => {
    const response = await api.post<Category>('/categories/', data)
    return response.data
  },
  
  update: async (id: number, data: Partial<Category>) => {
    const response = await api.put<Category>(`/categories/${id}/`, data)
    return response.data
  },
  
  delete: async (id: number) => {
    await api.delete(`/categories/${id}/`)
  },
}

// Summary API
export const summaryAPI = {
  get: async (userId: number, filters?: {
    start_date?: string
    end_date?: string
  }) => {
    const response = await api.get<Summary>('/summary/', {
      params: { user_id: userId, ...filters },
    })
    return response.data
  },
}

// Export API
export const exportAPI = {
  download: async (userId: number, filters?: {
    category?: number
    type?: string
    start_date?: string
    end_date?: string
  }) => {
    const response = await api.get('/export/', {
      params: { user_id: userId, ...filters },
      responseType: 'blob',
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'transactions.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
  },
}

export default api

