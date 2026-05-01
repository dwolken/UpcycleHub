/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */

import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getMyProjects } from '../api/projects.js'
import { useAuth } from '../auth/AuthContext.jsx'
import ProjectCard from '../components/ProjectCard.jsx'

export const Route = createFileRoute('/my-projects')({
  component: MyProjectsPage,
})

function MyProjectsPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [projects, setProjects] = useState([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      setProjects([])
      return
    }

    setIsLoadingProjects(true)
    setError('')

    getMyProjects()
      .then((data) => setProjects(data))
      .catch(() => setError('Deine Projekte konnten nicht geladen werden.'))
      .finally(() => setIsLoadingProjects(false))
  }, [isAuthenticated, isLoading])

  if (isLoading) {
    return (
      <p className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600">
        Anmeldung wird geprueft.
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
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold text-stone-950">
          Meine Projekte
        </h1>
        <p className="text-sm leading-6 text-stone-600">
          Angemeldet als <span className="font-medium">{user.username}</span>.
        </p>
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

      {!isLoadingProjects && !error && projects.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </section>
      ) : null}

      {!isLoadingProjects && !error && projects.length === 0 ? (
        <p className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600">
          Du hast noch keine eigenen Projekte.
        </p>
      ) : null}
    </div>
  )
}
