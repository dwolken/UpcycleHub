/* eslint-disable react-refresh/only-export-components */

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/projects')({
  component: ProjectsPage,
})

function ProjectsPage() {
  return (
    <section className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
        Projekte
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Upcycling-Projekte
      </h1>
      <p className="max-w-2xl text-base leading-7 text-stone-600">
        Hier werden spaeter die Upcycling-Projekte angezeigt.
      </p>
    </section>
  )
}
