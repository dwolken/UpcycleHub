import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getProjects } from './api/projects.js'
import ProjectCard from './components/ProjectCard.jsx'

const selectedProjectIds = [1, 3, 4]

function App() {
  const [previewProjects, setPreviewProjects] = useState([])
  const [isLoadingPreview, setIsLoadingPreview] = useState(true)

  useEffect(() => {
    getProjects()
      .then((projects) => {
        const selectedProjects = selectedProjectIds
          .map((id) => projects.find((project) => project.id === id))
          .filter(Boolean)

        setPreviewProjects(
          selectedProjects.length === selectedProjectIds.length
            ? selectedProjects
            : projects.slice(0, 3),
        )
      })
      .catch(() => setPreviewProjects([]))
      .finally(() => setIsLoadingPreview(false))
  }, [])

  const heroProject = previewProjects[0]

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
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

        {heroProject ? (
          <Link
            to="/projects/$id"
            params={{ id: String(heroProject.id) }}
            className="group overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
          >
            <img
              src={heroProject.imageUrl}
              alt={heroProject.title}
              className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
            <div className="border-t border-stone-200 p-4">
              <p className="text-sm font-medium text-stone-950">
                {heroProject.title}
              </p>
              <p className="mt-1 text-sm text-stone-500">
                {heroProject.estimatedMinutes} Minuten
              </p>
            </div>
          </Link>
        ) : (
          <div className="aspect-[4/3] rounded-lg border border-stone-200 bg-white shadow-sm" />
        )}
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
              Ausgewählte Projekte
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Ein erster Blick auf Ideen, die vorhandene Materialien sinnvoll
              weiterverwenden.
            </p>
          </div>
          <Link
            to="/projects"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
          >
            Alle Projekte ansehen
          </Link>
        </div>

        {isLoadingPreview ? (
          <p className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600">
            Projekte werden geladen.
          </p>
        ) : null}

        {!isLoadingPreview && previewProjects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {previewProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : null}

        {!isLoadingPreview && previewProjects.length === 0 ? (
          <p className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600">
            Ausgewählte Projekte konnten nicht geladen werden.
          </p>
        ) : null}
      </section>
    </div>
  )
}

export default App
