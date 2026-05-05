/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */

import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { toUserMessage } from '../../api/apiErrors.js'
import { getProjects } from '../../api/projects.js'
import ProjectCard from '../../components/ProjectCard.jsx'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../components/StatusMessage.jsx'

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
  const [openFilter, setOpenFilter] = useState('')
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
      .catch((requestError) =>
        setError(
          toUserMessage(requestError, 'Die Projekte konnten nicht geladen werden.'),
        ),
      )
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

  function resetFilters() {
    setFilters(emptyFilters)
    setOpenFilter('')
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(220px,1.2fr)_repeat(3,minmax(170px,1fr))_auto] lg:items-end">
          <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
            <span>Suche</span>
            <input
              type="search"
              value={filters.q}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Titel oder Beschreibung"
              className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600"
            />
          </label>

          <MultiSelectDropdown
            id="category"
            label="Kategorien"
            emptyLabel="Alle Kategorien"
            selectedLabel="Kategorien"
            values={categories}
            selectedValues={filters.category}
            isOpen={openFilter === 'category'}
            onToggleOpen={() =>
              setOpenFilter((currentFilter) =>
                currentFilter === 'category' ? '' : 'category',
              )
            }
            onToggleValue={(value) => toggleFilter('category', value)}
          />

          <MultiSelectDropdown
            id="difficulty"
            label="Schwierigkeit"
            emptyLabel="Alle Stufen"
            selectedLabel="Schwierigkeit"
            values={difficulties}
            selectedValues={filters.difficulty}
            isOpen={openFilter === 'difficulty'}
            onToggleOpen={() =>
              setOpenFilter((currentFilter) =>
                currentFilter === 'difficulty' ? '' : 'difficulty',
              )
            }
            onToggleValue={(value) => toggleFilter('difficulty', value)}
          />

          <MultiSelectDropdown
            id="material"
            label="Materialien"
            emptyLabel="Alle Materialien"
            selectedLabel="Materialien"
            values={materials}
            selectedValues={filters.material}
            isOpen={openFilter === 'material'}
            onToggleOpen={() =>
              setOpenFilter((currentFilter) =>
                currentFilter === 'material' ? '' : 'material',
              )
            }
            onToggleValue={(value) => toggleFilter('material', value)}
          />

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="h-10 rounded-md px-3 text-left text-sm font-medium text-emerald-700 transition hover:text-emerald-900 disabled:cursor-not-allowed disabled:text-stone-400 lg:whitespace-nowrap"
          >
            Filter zurücksetzen
          </button>
        </div>
      </section>

      {isLoading ? (
        <LoadingState>Projekte werden geladen.</LoadingState>
      ) : null}

      {error ? (
        <ErrorState
          title="Projekte konnten nicht geladen werden."
          actions={[{ to: '/', label: 'Zur Startseite' }]}
        >
          {error}
        </ErrorState>
      ) : null}

      {!isLoading && !error ? (
        <section className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </section>
      ) : null}

      {!isLoading && !error && projects.length === 0 ? (
        <EmptyState
          title="Keine passenden Projekte gefunden."
          actions={
            hasActiveFilters
              ? [{ label: 'Filter zurücksetzen', onClick: resetFilters }]
              : []
          }
        >
          Es wurden keine passenden Projekte gefunden. Passe die Filter an oder
          entferne sie, um wieder mehr Projekte zu sehen.
        </EmptyState>
      ) : null}
    </div>
  )
}

function getSelectionSummary(selectedValues, emptyLabel, selectedLabel) {
  if (selectedValues.length === 0) {
    return emptyLabel
  }

  if (selectedValues.length === 1) {
    return `1 ${selectedLabel} ausgewählt`
  }

  return `${selectedValues.length} ${selectedLabel} ausgewählt`
}

function MultiSelectDropdown({
  id,
  label,
  emptyLabel,
  selectedLabel,
  values,
  selectedValues,
  isOpen,
  onToggleOpen,
  onToggleValue,
}) {
  return (
    <div className="relative flex flex-col gap-2 text-sm font-medium text-stone-700">
      <span>{label}</span>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`${id}-options`}
        onClick={onToggleOpen}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-stone-300 bg-white px-3 text-left text-sm font-normal text-stone-900 outline-none transition hover:border-emerald-500 focus:border-emerald-600"
      >
        <span className="truncate">
          {getSelectionSummary(selectedValues, emptyLabel, selectedLabel)}
        </span>
        <span className="text-xs text-stone-500" aria-hidden="true">
          {isOpen ? 'Schließen' : 'Öffnen'}
        </span>
      </button>

      {isOpen ? (
        <div
          id={`${id}-options`}
          className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-md border border-stone-200 bg-white p-2 shadow-lg"
        >
          {values.length === 0 ? (
            <p className="px-2 py-2 text-sm font-normal text-stone-500">
              Keine Optionen verfügbar.
            </p>
          ) : null}

          {values.map((value) => {
            const isSelected = selectedValues.includes(value)

            return (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm font-normal text-stone-700 transition hover:bg-stone-50"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleValue(value)}
                  className="h-4 w-4 rounded border-stone-300 accent-emerald-700"
                />
                <span>{value}</span>
              </label>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
