/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */

import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getProject } from '../../api/projects.js'

export const Route = createFileRoute('/projects/$id')({
  component: ProjectDetailPage,
})

function formatMaterialAmount(material) {
  return [material.amount, material.unit].filter(Boolean).join(' ')
}

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

  if (error || !project) {
    return (
      <div className="space-y-4 rounded-lg border border-stone-200 bg-white p-5">
        <p className="text-sm text-stone-600">
          {error || 'Das Projekt wurde nicht gefunden.'}
        </p>
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
        className="inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-900"
      >
        Zurück zur Übersicht
      </Link>

      <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="aspect-[16/9] w-full object-cover"
        />

        <div className="space-y-5 p-6 md:p-8">
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

          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-semibold text-stone-950 md:text-4xl">
              {project.title}
            </h1>
            <p className="text-lg leading-8 text-stone-700">
              {project.summary}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm md:p-7">
        <h2 className="text-xl font-semibold text-stone-950">Projektidee</h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-stone-600">
          {project.description}
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-950">
            Benötigte Materialien
          </h2>
          <ul className="mt-5 space-y-3">
            {project.materials.map((material) => (
              <li
                key={material.id}
                className="grid gap-3 rounded-md border border-stone-200 bg-stone-50 p-3 sm:grid-cols-[5.5rem_1fr]"
              >
                <span className="text-sm font-semibold text-emerald-800">
                  {formatMaterialAmount(material) || 'nach Bedarf'}
                </span>
                <span>
                  <span className="block text-sm font-medium text-stone-950">
                    {material.name}
                  </span>
                  {material.note ? (
                    <span className="mt-1 block text-sm leading-5 text-stone-600">
                      {material.note}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-950">
            Schritt-für-Schritt
          </h2>
          <ol className="mt-5 space-y-4">
            {project.steps.map((step) => (
              <li
                key={step.stepNumber}
                className="flex gap-4 rounded-md border border-stone-200 bg-white p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-800">
                  {step.stepNumber}
                </span>
                <p className="text-sm leading-6 text-stone-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </section>
    </article>
  )
}
