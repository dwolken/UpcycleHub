const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

async function authRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Die Anfrage konnte nicht verarbeitet werden.')
  }

  return result.data
}

export function getCurrentUser() {
  return authRequest('/auth/me')
}

export function loginUser({ username, password }) {
  return authRequest('/auth/login', {
    method: 'POST',
    body: { username, password },
  })
}

export function registerUser({ username, password }) {
  return authRequest('/auth/register', {
    method: 'POST',
    body: { username, password },
  })
}

export function logoutUser() {
  return authRequest('/auth/logout', {
    method: 'POST',
  })
}
