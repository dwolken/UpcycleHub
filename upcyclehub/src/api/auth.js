import {
  NETWORK_ERROR_MESSAGE,
  RESPONSE_ERROR_MESSAGE,
  createApiError,
} from './apiErrors.js'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const BACKEND_PORT = '3000'

function getApiBaseUrls() {
  const urls = [API_BASE_URL]

  if (!API_BASE_URL.startsWith('http') && typeof window !== 'undefined') {
    const backendUrl = `${window.location.protocol}//${window.location.hostname}:${BACKEND_PORT}/api`
    urls.push(backendUrl)
  }

  return [...new Set(urls)]
}

async function readJsonResponse(response) {
  const text = await response.text()

  if (!text) {
    return {
      result: { data: null },
      parseError: false,
    }
  }

  try {
    return {
      result: JSON.parse(text),
      parseError: false,
    }
  } catch {
    return {
      result: null,
      parseError: true,
    }
  }
}

async function authRequest(path, options = {}) {
  const requestOptions = {
    method: options.method || 'GET',
    credentials: 'include',
    headers: options.body
      ? {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        }
      : options.headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  }
  let networkFailed = false

  for (const baseUrl of getApiBaseUrls()) {
    try {
      const response = await fetch(`${baseUrl}${path}`, requestOptions)
      const { result, parseError } = await readJsonResponse(response)

      if (parseError) {
        continue
      }

      if (!response.ok) {
        throw createApiError(
          response,
          result,
          options.fallbackMessage || RESPONSE_ERROR_MESSAGE,
        )
      }

      return result.data
    } catch (error) {
      if (error instanceof TypeError) {
        networkFailed = true
        continue
      }

      throw error
    }
  }

  throw new Error(networkFailed ? NETWORK_ERROR_MESSAGE : RESPONSE_ERROR_MESSAGE)
}

export function getCurrentUser() {
  return authRequest('/auth/me')
}

export function loginUser({ username, password }) {
  return authRequest('/auth/login', {
    method: 'POST',
    body: { username, password },
    fallbackMessage: 'Die Anmeldung konnte nicht abgeschlossen werden.',
  })
}

export function registerUser({ username, password }) {
  return authRequest('/auth/register', {
    method: 'POST',
    body: { username, password },
    fallbackMessage: 'Die Registrierung konnte nicht abgeschlossen werden.',
  })
}

export function logoutUser() {
  return authRequest('/auth/logout', {
    method: 'POST',
    fallbackMessage: 'Die Abmeldung konnte nicht abgeschlossen werden.',
  })
}
