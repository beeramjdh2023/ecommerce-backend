// show toast notification
export const showToast = (message, type = 'success') => {
  let container = document.querySelector('.toast-container')
  if (!container) {
    container = document.createElement('div')
    container.className = 'toast-container'
    document.body.appendChild(container)
  }

  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message
  container.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// show alert inside form
export const showAlert = (elementId, message, type = 'error') => {
  const alert = document.getElementById(elementId)
  if (!alert) return
  alert.className = `alert alert-${type} show`
  alert.textContent = message
}

// hide alert
export const hideAlert = (elementId) => {
  const alert = document.getElementById(elementId)
  if (alert) alert.className = 'alert'
}

// set button loading state
export const setLoading = (btn, loading) => {
  if (loading) {
    btn.disabled = true
    btn.dataset.originalText = btn.innerHTML
    btn.innerHTML = '<div class="spinner"></div>'
  } else {
    btn.disabled = false
    btn.innerHTML = btn.dataset.originalText
  }
}

// save to localStorage
export const saveToken = (token) => {
  localStorage.setItem('accessToken', token)
}

export const getToken = () => {
  return localStorage.getItem('accessToken')
}

export const removeToken = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
}

export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user))
}

export const getUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

// redirect if not logged in
export const requireAuth = () => {
  const token = getToken()
  if (!token) {
    window.location.href = '/pages/login.html'
    return false
  }
  return true
}

// redirect if already logged in
export const redirectIfLoggedIn = () => {
  const token = getToken()
  if (token) {
    window.location.href = '/pages/products.html'
  }
}