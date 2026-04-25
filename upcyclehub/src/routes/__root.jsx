/* eslint-disable react-refresh/only-export-components */

import {
  Link,
  Outlet,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const linkClassName =
    'rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100'

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold">UpcycleHub</p>
            <p className="text-sm text-stone-500">
              Nachhaltige Upcycling-Projekte und Anleitungen
            </p>
          </div>

          <nav className="flex gap-2">
            <Link
              to="/"
              className={linkClassName}
              activeOptions={{ exact: true }}
              activeProps={{ className: `${linkClassName} bg-emerald-100 text-emerald-900` }}
            >
              Start
            </Link>
            <Link
              to="/projects"
              className={linkClassName}
              activeProps={{ className: `${linkClassName} bg-emerald-100 text-emerald-900` }}
            >
              Projekte
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Outlet />
      </main>

      {import.meta.env.DEV ? (
        <TanStackRouterDevtools position="bottom-right" />
      ) : null}
    </div>
  )
}
