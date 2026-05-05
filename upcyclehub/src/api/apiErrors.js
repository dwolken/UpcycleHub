export const NETWORK_ERROR_MESSAGE =
  'Der Server ist nicht erreichbar. Bitte versuche es später erneut.'
export const RESPONSE_ERROR_MESSAGE =
  'Die Serverantwort konnte nicht gelesen werden.'
export const LOAD_ERROR_MESSAGE = 'Die Daten konnten nicht geladen werden.'

const technicalMessagePatterns = [
  /failed to fetch/i,
  /unexpected end of json input/i,
  /networkerror/i,
  /cannot read/i,
]

export class ApiError extends Error {
  constructor(message, { status = null, code = '' } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export function getStatusMessage(status, fallback = LOAD_ERROR_MESSAGE) {
  if (status === 400) {
    return 'Bitte prüfe deine Eingaben.'
  }

  if (status === 401) {
    return 'Bitte melde dich an, um fortzufahren.'
  }

  if (status === 403) {
    return 'Diese Aktion ist nicht erlaubt.'
  }

  if (status === 404) {
    return 'Der gesuchte Inhalt wurde nicht gefunden.'
  }

  if (status >= 500) {
    return 'Der Server konnte die Anfrage nicht verarbeiten.'
  }

  return fallback
}

export function cleanErrorMessage(message, fallback = LOAD_ERROR_MESSAGE) {
  const text = String(message || '').trim()

  if (!text) {
    return fallback
  }

  if (technicalMessagePatterns.some((pattern) => pattern.test(text))) {
    return fallback
  }

  return text
}

export function createApiError(response, result, fallback = LOAD_ERROR_MESSAGE) {
  const status = response?.status || null
  const apiError = result?.error || {}
  const rawMessage = apiError.message || result?.message
  const message = cleanErrorMessage(rawMessage, getStatusMessage(status, fallback))

  return new ApiError(message, {
    status,
    code: apiError.code || '',
  })
}

export function toUserMessage(error, fallback = LOAD_ERROR_MESSAGE, messages = {}) {
  if (error?.status && messages[error.status]) {
    return messages[error.status]
  }

  if (error?.status) {
    return cleanErrorMessage(
      error.message,
      getStatusMessage(error.status, fallback),
    )
  }

  return cleanErrorMessage(error?.message, fallback)
}
