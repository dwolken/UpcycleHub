function App() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
          WMC Schulprojekt
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          UpcycleHub
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600 md:text-lg">
          Eine einfache Webanwendung fuer nachhaltige Upcycling-Projekte und
          Anleitungen.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-lg font-semibold text-emerald-900">Fokus</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-950/80">
            Alte oder ungenutzte Dinge sinnvoll weiterverwenden.
          </p>
        </article>
        <article className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-stone-900">Ziel</h2>
          <p className="mt-2 text-sm leading-6 text-stone-700">
            Ideen und spaetere Anleitungen uebersichtlich anzeigen und
            verwalten.
          </p>
        </article>
        <article className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-semibold text-amber-900">Naechstes</h2>
          <p className="mt-2 text-sm leading-6 text-amber-950/80">
            Im naechsten Schritt koennen echte Projektinhalte dazukommen.
          </p>
        </article>
      </section>
    </div>
  )
}

export default App
