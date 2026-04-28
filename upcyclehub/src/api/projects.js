const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

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

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error('Daten konnten nicht geladen werden.')
  }

  const result = await response.json()
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
