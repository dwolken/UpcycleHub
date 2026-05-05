import { Link } from '@tanstack/react-router'

const variants = {
  neutral: {
    panel: 'border-stone-200 bg-white',
    marker: 'border-stone-200 bg-stone-50 text-stone-600',
    eyebrow: 'Hinweis',
  },
  empty: {
    panel: 'border-stone-200 bg-white',
    marker: 'border-amber-200 bg-amber-50 text-amber-800',
    eyebrow: 'Leer',
  },
  error: {
    panel: 'border-red-200 bg-white',
    marker: 'border-red-200 bg-red-50 text-red-700',
    eyebrow: 'Fehler',
  },
  success: {
    panel: 'border-emerald-200 bg-white',
    marker: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    eyebrow: 'Erledigt',
  },
}

const actionVariants = {
  primary:
    'bg-emerald-700 text-white shadow-sm hover:bg-emerald-800',
  secondary:
    'border border-stone-300 bg-white text-stone-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800',
}

function StatusMessage({
  actions = [],
  children,
  title = '',
  variant = 'neutral',
  link = null,
}) {
  const currentVariant = variants[variant] || variants.neutral
  const visibleActions = link ? [link, ...actions] : actions

  return (
    <section
      className={`rounded-lg border p-5 shadow-sm md:p-6 ${currentVariant.panel}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${currentVariant.marker}`}
        >
          {currentVariant.eyebrow}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {title ? (
            <h2 className="text-xl font-semibold text-stone-950">{title}</h2>
          ) : null}
          <p className="max-w-2xl text-sm leading-6 text-stone-600">
            {children}
          </p>

          {visibleActions.length > 0 ? (
            <div className="flex flex-wrap gap-3 pt-1">
              {visibleActions.map((action) => {
                const actionClassName = `rounded-md px-4 py-2 text-sm font-medium transition ${
                  actionVariants[action.variant || 'secondary']
                }`

                if (action.onClick) {
                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={action.onClick}
                      className={actionClassName}
                    >
                      {action.label}
                    </button>
                  )
                }

                return (
                  <Link
                    key={`${action.to}-${action.label}`}
                    to={action.to}
                    params={action.params}
                    className={actionClassName}
                  >
                    {action.label}
                  </Link>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function LoadingState({ children = 'Daten werden geladen.' }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600 shadow-sm">
      {children}
    </section>
  )
}

export function AuthRequiredState({ children, title = 'Anmeldung erforderlich' }) {
  return (
    <StatusMessage
      title={title}
      variant="neutral"
      actions={[
        { to: '/login', label: 'Anmelden', variant: 'primary' },
        { to: '/register', label: 'Registrieren' },
      ]}
    >
      {children || 'Bitte melde dich an, um fortzufahren.'}
    </StatusMessage>
  )
}

export function NotFoundState({ children, title = 'Seite nicht gefunden.' }) {
  return (
    <StatusMessage
      title={title}
      variant="error"
      actions={[
        { to: '/projects', label: 'Zu den Projekten', variant: 'primary' },
        { to: '/', label: 'Zur Startseite' },
      ]}
    >
      {children || 'Der gesuchte Inhalt ist nicht verfügbar.'}
    </StatusMessage>
  )
}

export function EmptyState({ actions = [], children, title = 'Noch nichts da.' }) {
  return (
    <StatusMessage title={title} variant="empty" actions={actions}>
      {children}
    </StatusMessage>
  )
}

export function ErrorState({ actions = [], children, title = 'Das hat nicht geklappt.' }) {
  return (
    <StatusMessage title={title} variant="error" actions={actions}>
      {children}
    </StatusMessage>
  )
}

export function ForbiddenState({ actions = [], children }) {
  return (
    <StatusMessage
      title="Diese Aktion ist nicht erlaubt."
      variant="error"
      actions={actions}
    >
      {children || 'Du hast dafür keine Berechtigung.'}
    </StatusMessage>
  )
}

export function SuccessState({ children }) {
  return (
    <StatusMessage title="Erfolgreich abgeschlossen" variant="success">
      {children}
    </StatusMessage>
  )
}

export default StatusMessage
