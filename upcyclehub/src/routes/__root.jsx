/* eslint-disable react-refresh/only-export-components */

import {
  Link,
  Outlet,
  useNavigate,
  createRootRoute,
} from '@tanstack/react-router'
import { AuthProvider, useAuth } from '../auth/AuthContext.jsx'
import AppIcon from '../components/AppIcon.jsx'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  )
}

function RootLayoutContent() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, logout, user } = useAuth()
  const linkClassName =
    'rounded-md px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-950'
  const loginLinkClassName =
    'rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800'
  const accountLinkClassName =
    'rounded-md px-3 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50 hover:text-emerald-950'
  const buttonClassName =
    'rounded-md bg-stone-800 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-900'

  async function handleLogout() {
    await logout()
    await navigate({ to: '/' })
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700">
              <AppIcon />
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

          <nav className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="flex flex-wrap gap-2">
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
            </div>

            {!isLoading && !isAuthenticated ? (
              <div className="flex flex-wrap gap-2 sm:border-l sm:border-stone-200 sm:pl-3">
                <Link
                  to="/login"
                  className={loginLinkClassName}
                  activeProps={{ className: `${loginLinkClassName} bg-emerald-800` }}
                >
                  Anmelden
                </Link>
              </div>
            ) : null}

            {!isLoading && isAuthenticated ? (
              <>
                <div className="flex flex-wrap items-center gap-2 border-t border-stone-200 pt-3 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
                  <Link
                    to="/my-projects"
                    className={accountLinkClassName}
                    activeProps={{ className: `${accountLinkClassName} bg-emerald-100 text-emerald-950` }}
                  >
                    Meine Projekte
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={buttonClassName}
                  >
                    Abmelden
                  </button>
                </div>
                <span className="w-fit rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600">
                  {user.username}
                </span>
              </>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
