function App() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16 text-stone-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm md:p-12">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            WMC Schulprojekt
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            UpcycleHub
          </h1>
          <p className="max-w-2xl text-base leading-7 text-stone-600 md:text-lg">
            Ein klarer Startpunkt fuer eine SPA rund um nachhaltige
            Upcycling-Projekte, Materialien und spaetere Anleitungen.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-emerald-50 p-5">
            <h2 className="text-lg font-semibold text-emerald-900">Fokus</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-950/80">
              Wiederverwendung von Gegenstaenden und Materialien im Alltag.
            </p>
          </article>
          <article className="rounded-2xl bg-stone-100 p-5">
            <h2 className="text-lg font-semibold text-stone-900">Status</h2>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              Nur Basissetup mit React, Vite und Tailwind fuer die naechsten
              Schritte.
            </p>
          </article>
          <article className="rounded-2xl bg-amber-50 p-5">
            <h2 className="text-lg font-semibold text-amber-900">Naechstes</h2>
            <p className="mt-2 text-sm leading-6 text-amber-950/80">
              Spaeter koennen Inhalte, Filter und Verwaltung ergaenzt werden.
            </p>
          </article>
        </section>
      </div>
    </main>
  )
}

export default App
