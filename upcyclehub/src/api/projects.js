const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const API_ORIGIN = API_BASE_URL.startsWith('http')
  ? API_BASE_URL.replace(/\/api\/?$/, '')
  : ''
const BACKEND_PORT = '3000'
const REQUEST_TIMEOUT_MS = 8000
const LOAD_ERROR_MESSAGE = 'Daten konnten nicht geladen werden.'

function getApiBaseUrls() {
  const urls = [API_BASE_URL]

  if (!API_BASE_URL.startsWith('http') && typeof window !== 'undefined') {
    const backendUrl = `${window.location.protocol}//${window.location.hostname}:${BACKEND_PORT}/api`
    urls.push(backendUrl)
  }

  return [...new Set(urls)]
}

function resolveImageUrl(imageUrl) {
  if (!imageUrl || imageUrl.startsWith('http')) {
    return imageUrl
  }

  return `${API_ORIGIN}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
}

function normalizeProject(project) {
  if (!project) {
    return project
  }

  return {
    ...project,
    imageUrl: resolveImageUrl(project.imageUrl),
  }
}

async function readJsonResponse(response) {
  const text = await response.text()

  if (!text) {
    return {
      result: null,
      parseError: true,
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

async function request(path, options = {}) {
  const hasFormDataBody =
    typeof FormData !== 'undefined' && options.body instanceof FormData
  const requestOptions = {
    ...options,
    headers: options.body && !hasFormDataBody
      ? {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        }
      : options.headers,
    body: hasFormDataBody
      ? options.body
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
  }

  for (const baseUrl of getApiBaseUrls()) {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    )

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        signal: controller.signal,
        ...requestOptions,
      })
      const { result, parseError } = await readJsonResponse(response)

      if (parseError) {
        continue
      }

      if (!response.ok) {
        throw new Error(result.message || LOAD_ERROR_MESSAGE)
      }

      return Array.isArray(result.data)
        ? result.data.map((project) => normalizeProject(project))
        : normalizeProject(result.data)
    } catch (error) {
      if (error.name !== 'AbortError' && error.name !== 'TypeError') {
        throw error
      }
    } finally {
      window.clearTimeout(timeoutId)
    }
  }

  throw new Error(LOAD_ERROR_MESSAGE)
}

export function getProjects(filters = {}) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    }
  })

  const query = params.toString()
  return request(`/projects${query ? `?${query}` : ''}`)
}

export function getProject(id) {
  return request(`/projects/${id}`)
}

export function getMyProjects() {
  return request('/projects/mine', {
    credentials: 'include',
  })
}

export function createProject(project) {
  return request('/projects', {
    method: 'POST',
    credentials: 'include',
    body: project,
  })
}
