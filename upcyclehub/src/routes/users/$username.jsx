/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */

import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toUserMessage } from '../../api/apiErrors.js'
import { getUserProjects } from '../../api/projects.js'
import ProjectCard from '../../components/ProjectCard.jsx'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  NotFoundState,
} from '../../components/StatusMessage.jsx'

export const Route = createFileRoute('/users/$username')({
  component: AuthorPage,
})

function AuthorPage() {
  const { username } = Route.useParams()
  const [author, setAuthor] = useState(null)
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setIsLoading(true)
    setError('')

    getUserProjects(username)
      .then((data) => {
        setAuthor(data.user)
        setProjects(data.projects)
      })
      .catch((requestError) => {
        setAuthor(null)
        setProjects([])
        setError(
          toUserMessage(requestError, 'Die Projekte konnten nicht geladen werden.', {
            404: 'Benutzer wurde nicht gefunden.',
          }),
        )
      })
      .finally(() => setIsLoading(false))
  }, [username])

  if (isLoading) {
    return <LoadingState>Projekte werden geladen.</LoadingState>
  }

  if (error) {
    if (error === 'Benutzer wurde nicht gefunden.') {
      return (
        <NotFoundState title="Benutzer wurde nicht gefunden">
          Für diesen Benutzernamen gibt es keine öffentliche Autorenseite.
        </NotFoundState>
      )
    }

    return (
      <ErrorState
        title="Autorenseite konnte nicht geladen werden."
        actions={[{ to: '/projects', label: 'Zurück zur Übersicht' }]}
      >
        {error}
      </ErrorState>
    )
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Link
          to="/projects"
          className="inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-900"
        >
          Zurück zur Übersicht
        </Link>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-stone-950">
            Projekte von {author.username}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-stone-600">
            Öffentliche Upcycling-Projekte, die {author.username} erstellt hat.
          </p>
        </div>
      </section>

      {projects.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </section>
      ) : (
        <EmptyState title="Noch keine öffentlichen Projekte">
          Diese Person hat noch keine öffentlichen Upcycling-Projekte erstellt.
        </EmptyState>
      )}
    </div>
  )
}
