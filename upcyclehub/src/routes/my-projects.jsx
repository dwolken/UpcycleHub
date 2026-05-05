/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */

import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toUserMessage } from '../api/apiErrors.js'
import { getMyProjects } from '../api/projects.js'
import { useAuth } from '../auth/AuthContext.jsx'
import DeleteProjectButton from '../components/DeleteProjectButton.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import {
  AuthRequiredState,
  EmptyState,
  ErrorState,
  LoadingState,
  SuccessState,
} from '../components/StatusMessage.jsx'

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
      .catch((requestError) =>
        setError(
          toUserMessage(
            requestError,
            'Deine Projekte konnten nicht geladen werden.',
            {
              401: 'Bitte melde dich an, um deine Projekte zu sehen.',
            },
          ),
        ),
      )
      .finally(() => setIsLoadingProjects(false))
  }, [isAuthenticated, isLoading])

  function handleProjectDeleted(projectId) {
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== projectId),
    )
    setSuccessMessage('Projekt wurde gelöscht.')
  }

  if (isLoading) {
    return <LoadingState>Anmeldung wird geprüft.</LoadingState>
  }

  if (!isAuthenticated) {
    return (
      <AuthRequiredState>
        Melde dich an oder erstelle ein Konto, um deine eigenen Projekte zu
        sehen.
      </AuthRequiredState>
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
        <LoadingState>Eigene Projekte werden geladen</LoadingState>
      ) : null}

      {error ? (
        <ErrorState title="Meine Projekte konnten nicht geladen werden.">
          {error}
        </ErrorState>
      ) : null}

      {successMessage ? (
        <SuccessState>{successMessage}</SuccessState>
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
        <EmptyState
          title="Noch keine eigenen Projekte"
          actions={[
            { to: '/projects/new', label: 'Projekt erstellen', variant: 'primary' },
          ]}
        >
          Du hast bisher noch keine Projekte angelegt.
        </EmptyState>
      ) : null}
    </div>
  )
}
