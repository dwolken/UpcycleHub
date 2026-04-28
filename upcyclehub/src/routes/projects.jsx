/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */

import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { getProjects } from '../api/projects.js'
import ProjectCard from '../components/ProjectCard.jsx'

export const Route = createFileRoute('/projects')({
  component: ProjectsPage,
})

function uniqueValues(projects, getValue) {
  return [...new Set(projects.map(getValue).filter(Boolean))].sort()
}

function ProjectsPage() {
  const [allProjects, setAllProjects] = useState([])
  const [projects, setProjects] = useState([])
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    difficulty: '',
    material: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getProjects()
      .then((data) => setAllProjects(data))
      .catch(() => setAllProjects([]))
  }, [])

  useEffect(() => {
    setIsLoading(true)
    setError('')

    getProjects(filters)
      .then((data) => setProjects(data))
      .catch(() => setError('Die Projekte konnten nicht geladen werden.'))
      .finally(() => setIsLoading(false))
  }, [filters])

  const categories = useMemo(
    () => uniqueValues(allProjects, (project) => project.category.name),
    [allProjects],
  )
  const difficulties = useMemo(
    () => uniqueValues(allProjects, (project) => project.difficulty.name),
    [allProjects],
  )
  const materials = useMemo(
    () =>
      [...new Set(allProjects.flatMap((project) => project.materials.map((material) => material.name)))].sort(),
    [allProjects],
  )

  function updateFilter(name, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function resetFilters() {
    setFilters({
      q: '',
      category: '',
      difficulty: '',
      material: '',
    })
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-stone-950">
          Upcycling-Projekte
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600">
          Durchsuche Ideen für nachhaltige Projekte und finde Anleitungen, die
          zu vorhandenen Materialien passen.
        </p>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-2 text-sm font-medium text-stone-700">
            Suche
            <input
              type="search"
              value={filters.q}
              onChange={(event) => updateFilter('q', event.target.value)}
              placeholder="Titel oder Beschreibung"
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-stone-700">
            Kategorie
            <select
              value={filters.category}
              onChange={(event) => updateFilter('category', event.target.value)}
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600"
            >
              <option value="">Alle Kategorien</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-stone-700">
            Schwierigkeit
            <select
              value={filters.difficulty}
              onChange={(event) => updateFilter('difficulty', event.target.value)}
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600"
            >
              <option value="">Alle Stufen</option>
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-stone-700">
            Material
            <select
              value={filters.material}
              onChange={(event) => updateFilter('material', event.target.value)}
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600"
            >
              <option value="">Alle Materialien</option>
              {materials.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-900"
        >
          Filter zurücksetzen
        </button>
      </section>

      {isLoading ? (
        <p className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600">
          Projekte werden geladen.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600">
          {error}
        </p>
      ) : null}

      {!isLoading && !error ? (
        <section className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </section>
      ) : null}

      {!isLoading && !error && projects.length === 0 ? (
        <p className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600">
          Zu diesen Filtern wurden keine Projekte gefunden.
        </p>
      ) : null}
    </div>
  )
}
