import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getProjects } from './api/projects.js'
import ProjectCard from './components/ProjectCard.jsx'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from './components/StatusMessage.jsx'

function getRandomProjects(projects, count = 3) {
  const shuffledProjects = [...projects]

  for (let index = shuffledProjects.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentProject = shuffledProjects[index]

    shuffledProjects[index] = shuffledProjects[randomIndex]
    shuffledProjects[randomIndex] = currentProject
  }

  return shuffledProjects.slice(0, count)
}

function App() {
  const [recommendedProjects, setRecommendedProjects] = useState([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true)
  const [recommendationError, setRecommendationError] = useState('')

  useEffect(() => {
    getProjects()
      .then((projects) => setRecommendedProjects(getRandomProjects(projects)))
      .catch(() => {
        setRecommendedProjects([])
        setRecommendationError('Empfohlene Projekte konnten nicht geladen werden.')
      })
      .finally(() => setIsLoadingRecommendations(false))
  }, [])

  return (
    <div className="space-y-12">
      <section className="border-b border-stone-200 pb-10">
        <div className="max-w-3xl space-y-5">
          <h1 className="text-4xl font-semibold text-stone-950 md:text-5xl">
            UpcycleHub
          </h1>
          <p className="text-base leading-7 text-stone-600 md:text-lg">
            UpcycleHub sammelt Ideen für nachhaltige Upcycling-Projekte und
            verständliche Anleitungen. Die Plattform zeigt, wie aus alten oder
            ungenutzten Gegenständen wieder nützliche Dinge entstehen können.
          </p>
          <Link
            to="/projects"
            className="inline-flex rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
          >
            Projekte entdecken
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">
            Wiederverwenden
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Materialien und Gegenstände erhalten eine neue Aufgabe, statt im
            Müll zu landen.
          </p>
        </article>

        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">
            Ideen finden
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Projekte sind übersichtlich aufgebaut und helfen beim Einstieg in
            eigene Upcycling-Ideen.
          </p>
        </article>

        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">
            Bewusster handeln
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Der Fokus liegt auf einfachen Lösungen, die Abfall reduzieren und
            Ressourcen schonen.
          </p>
        </article>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-stone-950">
              Empfohlene Projekte
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Drei Vorschläge aus der Projektsammlung für den nächsten
              freien Nachmittag.
            </p>
          </div>
          <Link
            to="/projects"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
          >
            Alle Projekte ansehen
          </Link>
        </div>

        {isLoadingRecommendations ? (
          <LoadingState>Projekte werden geladen.</LoadingState>
        ) : null}

        {!isLoadingRecommendations && !recommendationError && recommendedProjects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {recommendedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : null}

        {!isLoadingRecommendations && recommendationError ? (
          <ErrorState
            title="Empfehlungen konnten nicht geladen werden."
            actions={[{ to: '/projects', label: 'Alle Projekte ansehen' }]}
          >
            {recommendationError}
          </ErrorState>
        ) : null}

        {!isLoadingRecommendations &&
        !recommendationError &&
        recommendedProjects.length === 0 ? (
          <EmptyState
            title="Noch keine Empfehlungen verfügbar."
            actions={[{ to: '/projects', label: 'Alle Projekte ansehen' }]}
          >
            Es sind noch keine empfohlenen Projekte verfügbar.
          </EmptyState>
        ) : null}
      </section>
    </div>
  )
}

export default App
