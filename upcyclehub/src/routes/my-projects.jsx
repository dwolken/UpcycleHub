/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */

import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getMyProjects } from '../api/projects.js'
import { useAuth } from '../auth/AuthContext.jsx'
import DeleteProjectButton from '../components/DeleteProjectButton.jsx'
import ProjectCard from '../components/ProjectCard.jsx'

export const Route = createFileRoute('/my-projects')({
  component: MyProjectsPage,
})

function MyProjectsPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [projects, setProjects] = useState([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      setProjects([])
      return
    }

    setIsLoadingProjects(true)
    setError('')
    setSuccessMessage('')

    getMyProjects()
      .then((data) => setProjects(data))
      .catch(() => setError('Deine Projekte konnten nicht geladen werden.'))
      .finally(() => setIsLoadingProjects(false))
  }, [isAuthenticated, isLoading])

  function handleProjectDeleted(projectId) {
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== projectId),
    )
    setSuccessMessage('Projekt wurde geloescht.')
  }

  if (isLoading) {
    return (
      <p className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600">
        Anmeldung wird geprüft.
      </p>
    )
  }

  if (!isAuthenticated) {
    return (
      <section className="space-y-5 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-stone-950">
            Anmeldung erforderlich
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-stone-600">
            Melde dich an oder erstelle ein Konto, um deine eigenen Projekte zu
            sehen.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/login"
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
          >
            Anmelden
          </Link>
          <Link
            to="/register"
            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
          >
            Registrieren
          </Link>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-stone-950">
            Meine Projekte
          </h1>
          <p className="text-sm leading-6 text-stone-600">
            Angemeldet als <span className="font-medium">{user.username}</span>.
          </p>
        </div>

        <Link
          to="/projects/new"
          className="w-fit rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
        >
          Projekt erstellen
        </Link>
      </section>

      {isLoadingProjects ? (
        <p className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600">
          Projekte werden geladen.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          {successMessage}
        </p>
      ) : null}

      {!isLoadingProjects && !error && projects.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              action={
                <>
                  <Link
                    to="/projects/$id/edit"
                    params={{ id: String(project.id) }}
                    className="font-medium text-stone-700 hover:text-stone-950"
                  >
                    Bearbeiten
                  </Link>
                  <DeleteProjectButton
                    projectId={project.id}
                    projectTitle={project.title}
                    onDeleted={handleProjectDeleted}
                  />
                </>
              }
            />
          ))}
        </section>
      ) : null}

      {!isLoadingProjects && !error && projects.length === 0 ? (
        <section className="space-y-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-600">
            Du hast noch keine eigenen Projekte.
          </p>
          <Link
            to="/projects/new"
            className="inline-flex rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            Erstes Projekt erstellen
          </Link>
        </section>
      ) : null}
    </div>
  )
}
