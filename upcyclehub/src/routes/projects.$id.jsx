/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */

import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getProject } from '../api/projects.js'

export const Route = createFileRoute('/projects/$id')({
  component: ProjectDetailPage,
})

function ProjectDetailPage() {
  const { id } = Route.useParams()
  const [project, setProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setIsLoading(true)
    setError('')

    getProject(id)
      .then((data) => setProject(data))
      .catch(() => setError('Das Projekt konnte nicht geladen werden.'))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <p className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600">
        Projekt wird geladen.
      </p>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-lg border border-stone-200 bg-white p-5">
        <p className="text-sm text-stone-600">{error}</p>
        <Link
          to="/projects"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
        >
          Zurück zur Übersicht
        </Link>
      </div>
    )
  }

  return (
    <article className="space-y-8">
      <Link
        to="/projects"
        className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
      >
        Zurück zur Übersicht
      </Link>

      <section className="space-y-5">
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">
            {project.category.name}
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
            {project.difficulty.name}
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
            {project.estimatedMinutes} Minuten
          </span>
        </div>

        <h1 className="max-w-3xl text-3xl font-semibold text-stone-950 md:text-4xl">
          {project.title}
        </h1>
        <p className="max-w-3xl text-base leading-7 text-stone-600">
          {project.description}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-[1fr_2fr]">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">Materialien</h2>
          <ul className="mt-4 space-y-2 text-sm text-stone-600">
            {project.materials.map((material) => (
              <li key={material.id}>{material.name}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">Anleitung</h2>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-stone-600">
            {project.steps.map((step) => (
              <li key={step.stepNumber} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-800">
                  {step.stepNumber}
                </span>
                <span>{step.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </article>
  )
}
