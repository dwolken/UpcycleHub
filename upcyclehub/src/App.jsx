import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getProjects } from './api/projects.js'

function App() {
  const [previewProjects, setPreviewProjects] = useState([])

  useEffect(() => {
    getProjects()
      .then((projects) => setPreviewProjects(projects.slice(0, 3)))
      .catch(() => setPreviewProjects([]))
  }, [])

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

        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
          <img
            src="/project-images/kraeutertopf.svg"
            alt="Kräutertopf aus Konservendose"
            className="aspect-[4/3] w-full object-cover"
          />
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

      {previewProjects.length > 0 ? (
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

          <div className="grid gap-4 md:grid-cols-3">
            {previewProjects.map((project) => (
              <article
                key={project.id}
                className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
              >
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-stone-950">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {project.summary}
                  </p>
                  <Link
                    to="/projects/$id"
                    params={{ id: String(project.id) }}
                    className="mt-4 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-900"
                  >
                    Details ansehen
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default App
