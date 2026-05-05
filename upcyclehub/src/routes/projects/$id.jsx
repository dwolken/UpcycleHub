/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */

import {
  Link,
  Outlet,
  createFileRoute,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toUserMessage } from '../../api/apiErrors.js'
import { getProject } from '../../api/projects.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import DeleteProjectButton from '../../components/DeleteProjectButton.jsx'
import {
  ErrorState,
  LoadingState,
  NotFoundState,
} from '../../components/StatusMessage.jsx'

export const Route = createFileRoute('/projects/$id')({
  component: ProjectDetailPage,
})

function formatMaterialAmount(material) {
  return [material.amount, material.unit].filter(Boolean).join(' ')
}

function ProjectDetailPage() {
  const { id } = Route.useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const isEditRoute = location.pathname === `/projects/${id}/edit`

  async function handleProjectDeleted() {
    await navigate({ to: '/my-projects' })
  }

  useEffect(() => {
    if (isEditRoute) {
      return
    }

    setIsLoading(true)
    setError('')
    setProject(null)

    getProject(id)
      .then((data) => setProject(data))
      .catch((requestError) =>
        setError(
          toUserMessage(requestError, 'Das Projekt konnte nicht geladen werden.', {
            404: 'Projekt wurde nicht gefunden.',
          }),
        ),
      )
      .finally(() => setIsLoading(false))
  }, [id, isEditRoute])

  if (isEditRoute) {
    return <Outlet />
  }

  if (isLoading) {
    return <LoadingState>Projekt wird geladen.</LoadingState>
  }

  if (error || !project) {
    if (error === 'Projekt wurde nicht gefunden.' || !project) {
      return (
        <NotFoundState title="Projekt wurde nicht gefunden">
          Das gesuchte Projekt ist nicht verfügbar oder wurde gelöscht.
        </NotFoundState>
      )
    }

    return (
      <ErrorState
        title="Projekt konnte nicht geladen werden."
        actions={[{ to: '/projects', label: 'Zurück zur Übersicht' }]}
      >
        {error}
      </ErrorState>
    )
  }

  return (
    <article className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/projects"
          className="inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-900"
        >
          Zurück zur Übersicht
        </Link>

        {user?.id === project.owner?.id ? (
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              to="/projects/$id/edit"
              params={{ id: String(project.id) }}
              className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              Projekt bearbeiten
            </Link>
            <DeleteProjectButton
              projectId={project.id}
              projectTitle={project.title}
              onDeleted={handleProjectDeleted}
            />
          </div>
        ) : null}
      </div>

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
            {project.owner?.username ? (
              <p className="text-sm text-stone-500">
                Erstellt von{' '}
                <Link
                  to="/users/$username"
                  params={{ username: project.owner.username }}
                  className="font-medium text-emerald-700 hover:text-emerald-900"
                >
                  {project.owner.username}
                </Link>
              </p>
            ) : null}
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
