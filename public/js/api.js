import { getToken, saveToken, removeToken } from './utils.js'

const BASE_URL = 'http://localhost:4000/api/v1'

// core API function with auto token refresh
const request = async (endpoint, options = {}) => {
  const token = getToken()

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    credentials: 'include' // sends cookies (refresh token)
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, config)

  // access token expired — try refresh
  if (response.status === 401) {
    const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include'
    })

    if (refreshResponse.ok) {
      const data = await refreshResponse.json()
      saveToken(data.accessToken)

      // retry original request with new token
      config.headers.Authorization = `Bearer ${data.accessToken}`
      response = await fetch(`${BASE_URL}${endpoint}`, config)
    } else {
      // refresh failed — logout
      removeToken()
      window.location.href = '/pages/login.html'
      return
    }
  }

  return response.json()
}

// auth
export const api = {
  auth: {
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    verifyOTP: (data) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    refreshToken: () => request('/auth/refresh-token', { method: 'POST' })
  },

  products: {
    getAll: (params = '') => request(`/products${params}`),
    getOne: (id) => request(`/products/${id}`),
    create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' })
  },

  categories: {
    getAll: () => request('/categories'),
    getOne: (id) => request(`/categories/${id}`)
  },

  cart: {
    get: () => request('/cart'),
    add: (data) => request('/cart', { method: 'POST', body: JSON.stringify(data) }),
    update: (productId, data) => request(`/cart/${productId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (productId) => request(`/cart/${productId}`, { method: 'DELETE' }),
    clear: () => request('/cart/clear', { method: 'DELETE' })
  },

  orders: {
    place: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
    getAll: () => request('/orders'),
    getOne: (id) => request(`/orders/${id}`),
    updateStatus: (id, data) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) })
  },

  addresses: {
    getAll: () => request('/addresses'),
    create: (data) => request('/addresses', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/addresses/${id}`, { method: 'DELETE' })
  },

  coupons: {
    validate: (data) => request('/coupons/validate', { method: 'POST', body: JSON.stringify(data) })
  },

  wishlist: {
    get: () => request('/wishlist'),
    add: (data) => request('/wishlist', { method: 'POST', body: JSON.stringify(data) }),
    remove: (productId) => request(`/wishlist/${productId}`, { method: 'DELETE' })
  },

  reviews: {
    getProductReviews: (productId, params = '') => request(`/reviews/products/${productId}/reviews${params}`),
    create: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) })
  },

  seller: {
    getProfile: () => request('/sellers/profile'),
    createProfile: (data) => request('/sellers/profile', { method: 'POST', body: JSON.stringify(data) }),
    updateProfile: (data) => request('/sellers/profile', { method: 'PUT', body: JSON.stringify(data) }),
    getDashboard: () => request('/sellers/dashboard')
  },

  admin: {
    getStats: () => request('/admin/stats'),
    getUsers: () => request('/admin/users'),
    updateUserStatus: (id, data) => request(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
    getSalesReport: (params) => request(`/admin/reports/sales${params}`),
    getTopProducts: () => request('/admin/reports/top-products')
  }
}