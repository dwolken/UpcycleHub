const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
const API_ORIGIN = API_BASE_URL.startsWith('http')
  ? API_BASE_URL.replace(/\/api\/?$/, '')
  : ''
const REQUEST_TIMEOUT_MS = 8000

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
    throw new Error('Daten konnten nicht geladen werden.')
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Daten konnten nicht geladen werden.')
  }
}

async function request(path, options = {}) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  )

  const response = await fetch(`${API_BASE_URL}${path}`, {
    signal: controller.signal,
    ...options,
  }).finally(() => window.clearTimeout(timeoutId))

  const result = await readJsonResponse(response)

  if (!response.ok) {
    throw new Error(result.message || 'Daten konnten nicht geladen werden.')
  }

  return Array.isArray(result.data)
    ? result.data.map((project) => normalizeProject(project))
    : normalizeProject(result.data)
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
