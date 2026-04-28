/* eslint-disable react-refresh/only-export-components */

import {
  Link,
  Outlet,
  createRootRoute,
} from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const linkClassName =
    'rounded-md px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-950'

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 14c3.5 0 6-2 8-6 1.5 5-1 10-5.5 11.5-2 .7-4.1.3-5.5-.5 1-.1 2-.5 3-1.2" />
                <path d="M7 14c0 2.5 1.3 4.3 4 5" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-stone-950">
                UpcycleHub
              </p>
              <p className="text-sm text-stone-500">
                Nachhaltige Upcycling-Projekte und Anleitungen
              </p>
            </div>
          </div>

          <nav className="flex gap-2">
            <Link
              to="/"
              className={linkClassName}
              activeOptions={{ exact: true }}
              activeProps={{ className: `${linkClassName} bg-emerald-50 text-emerald-800` }}
            >
              Start
            </Link>
            <Link
              to="/projects"
              className={linkClassName}
              activeProps={{ className: `${linkClassName} bg-emerald-50 text-emerald-800` }}
            >
              Projekte
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
