import { Link } from '@tanstack/react-router'

function App() {
  return (
    <div className="space-y-10">
      <section className="max-w-3xl space-y-5">
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
          Projekte ansehen
        </Link>
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
    </div>
  )
}

export default App
