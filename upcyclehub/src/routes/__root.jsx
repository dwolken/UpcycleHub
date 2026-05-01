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
  const buttonClassName =
    'rounded-md px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-950'

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

          <nav className="flex flex-wrap gap-2">
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
            {!isLoading && !isAuthenticated ? (
              <Link
                to="/login"
                className={loginLinkClassName}
                activeProps={{ className: `${loginLinkClassName} bg-emerald-800` }}
              >
                Anmelden
              </Link>
            ) : null}
            {!isLoading && isAuthenticated ? (
              <>
                <span className="px-3 py-2 text-sm font-medium text-stone-700">
                  {user.username}
                </span>
                <Link
                  to="/my-projects"
                  className={linkClassName}
                  activeProps={{ className: `${linkClassName} bg-emerald-50 text-emerald-800` }}
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
