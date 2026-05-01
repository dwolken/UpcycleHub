const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

async function readJsonResponse(response) {
  const text = await response.text()

  if (!text) {
    return { data: null }
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function authRequest(path, options = {}) {
  const fallbackMessage =
    options.fallbackMessage || 'Die Anfrage konnte nicht verarbeitet werden.'
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || 'GET',
      credentials: 'include',
      headers: options.body
        ? {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          }
        : options.headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new Error(fallbackMessage)
  }

  const result = await readJsonResponse(response)

  if (!response.ok) {
    throw new Error(result?.message || fallbackMessage)
  }

  if (!result) {
    throw new Error(fallbackMessage)
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
    fallbackMessage: 'Anmeldung fehlgeschlagen. Bitte überprüfe deine Eingaben.',
  })
}

export function registerUser({ username, password }) {
  return authRequest('/auth/register', {
    method: 'POST',
    body: { username, password },
    fallbackMessage:
      'Registrierung fehlgeschlagen. Bitte überprüfe deine Eingaben.',
  })
}

export function logoutUser() {
  return authRequest('/auth/logout', {
    method: 'POST',
    fallbackMessage: 'Abmeldung fehlgeschlagen.',
  })
}
