/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */

import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { getProjects } from '../../api/projects.js'
import ProjectCard from '../../components/ProjectCard.jsx'

export const Route = createFileRoute('/projects/')({
  component: ProjectsPage,
})

const emptyFilters = {
  q: '',
  category: [],
  difficulty: [],
  material: [],
}

function uniqueValues(projects, getValue) {
  return [...new Set(projects.map(getValue).filter(Boolean))].sort()
}

function ProjectsPage() {
  const [allProjects, setAllProjects] = useState([])
  const [projects, setProjects] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
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
      [
        ...new Set(
          allProjects.flatMap((project) =>
            project.materials.map((material) => material.name),
          ),
        ),
      ].sort(),
    [allProjects],
  )

  const hasActiveFilters = useMemo(
    () =>
      Boolean(filters.q.trim()) ||
      filters.category.length > 0 ||
      filters.difficulty.length > 0 ||
      filters.material.length > 0,
    [filters],
  )

  const activeFilterTags = useMemo(
    () => [
      ...filters.category.map((value) => ({
        label: 'Kategorie',
        name: 'category',
        value,
      })),
      ...filters.difficulty.map((value) => ({
        label: 'Schwierigkeit',
        name: 'difficulty',
        value,
      })),
      ...filters.material.map((value) => ({
        label: 'Material',
        name: 'material',
        value,
      })),
    ],
    [filters],
  )

  function updateSearch(value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      q: value,
    }))
  }

  function toggleFilter(name, value) {
    setFilters((currentFilters) => {
      const currentValues = currentFilters[name]
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((currentValue) => currentValue !== value)
        : [...currentValues, value]

      return {
        ...currentFilters,
        [name]: nextValues,
      }
    })
  }

  function removeFilter(name, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: currentFilters[name].filter(
        (currentValue) => currentValue !== value,
      ),
    }))
  }

  function resetFilters() {
    setFilters(emptyFilters)
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
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <label className="space-y-2 text-sm font-medium text-stone-700">
            Suche
            <input
              type="search"
              value={filters.q}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Titel oder Beschreibung"
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600 md:w-80"
            />
          </label>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="rounded-md px-3 py-2 text-left text-sm font-medium text-emerald-700 transition hover:text-emerald-900 disabled:cursor-not-allowed disabled:text-stone-400 md:text-center"
          >
            Filter zurücksetzen
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <FilterGroup
            title="Kategorien"
            values={categories}
            selectedValues={filters.category}
            onToggle={(value) => toggleFilter('category', value)}
          />
          <FilterGroup
            title="Schwierigkeit"
            values={difficulties}
            selectedValues={filters.difficulty}
            onToggle={(value) => toggleFilter('difficulty', value)}
          />
          <FilterGroup
            title="Materialien"
            values={materials}
            selectedValues={filters.material}
            onToggle={(value) => toggleFilter('material', value)}
          />
        </div>

        {activeFilterTags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
            {activeFilterTags.map((filter) => (
              <button
                key={`${filter.name}-${filter.value}`}
                type="button"
                onClick={() => removeFilter(filter.name, filter.value)}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
              >
                {filter.label}: {filter.value} entfernen
              </button>
            ))}
          </div>
        ) : null}
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

function FilterGroup({ title, values, selectedValues, onToggle }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-stone-700">{title}</legend>
      {values.length > 0 ? (
        <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto pr-1">
          {values.map((value) => {
            const isSelected = selectedValues.includes(value)

            return (
              <button
                key={value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggle(value)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  isSelected
                    ? 'border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800'
                    : 'border-stone-300 bg-white text-stone-700 hover:border-emerald-500 hover:text-emerald-800'
                }`}
              >
                {value}
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-stone-500">Keine Optionen verfügbar.</p>
      )}
    </fieldset>
  )
}
