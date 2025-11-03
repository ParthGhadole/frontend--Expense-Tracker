import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

