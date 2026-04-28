const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error('Daten konnten nicht geladen werden.')
  }

  const result = await response.json()
  return result.data
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
