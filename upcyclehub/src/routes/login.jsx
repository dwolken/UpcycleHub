/* eslint-disable react-refresh/only-export-components */

import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(name, value) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!formData.username.trim() || !formData.password) {
      setError('Bitte gib Benutzername und Passwort ein.')
      return
    }

    setIsSubmitting(true)

    try {
      await login(formData)
      await navigate({ to: '/my-projects' })
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-stone-950">Anmelden</h1>
        <p className="text-sm leading-6 text-stone-600">
          Melde dich mit deinem Benutzernamen an, um deine Projekte zu sehen.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
      >
        <label className="block space-y-2 text-sm font-medium text-stone-700">
          Benutzername
          <input
            type="text"
            value={formData.username}
            onChange={(event) => updateField('username', event.target.value)}
            autoComplete="username"
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-stone-700">
          Passwort
          <input
            type="password"
            value={formData.password}
            onChange={(event) => updateField('password', event.target.value)}
            autoComplete="current-password"
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600"
          />
        </label>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {isSubmitting ? 'Anmeldung laeuft' : 'Anmelden'}
        </button>
      </form>

      <p className="text-sm text-stone-600">
        Noch kein Konto?{' '}
        <Link
          to="/register"
          className="font-medium text-emerald-700 hover:text-emerald-900"
        >
          Registrieren
        </Link>
      </p>
    </section>
  )
}
