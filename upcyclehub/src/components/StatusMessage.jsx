import { Link } from '@tanstack/react-router'

const variants = {
  neutral: 'border-stone-200 bg-white text-stone-600',
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
}

function StatusMessage({ children, title = '', variant = 'neutral', link = null }) {
  return (
    <section className={`space-y-3 rounded-lg border p-5 shadow-sm ${variants[variant]}`}>
      {title ? (
        <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
      ) : null}
      <p className="text-sm leading-6">{children}</p>
      {link ? (
        <Link
          to={link.to}
          params={link.params}
          className="inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-900"
        >
          {link.label}
        </Link>
      ) : null}
    </section>
  )
}

export default StatusMessage
