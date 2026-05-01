/* eslint-disable react-refresh/only-export-components */

import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordConfirmation: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(name, value) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }))
  }

  function validateForm() {
    const username = formData.username.trim()

    if (!username) {
      return 'Bitte gib einen Benutzernamen ein.'
    }

    if (username.length < 3) {
      return 'Der Benutzername muss mindestens 3 Zeichen lang sein.'
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Der Benutzername darf nur Buchstaben, Zahlen und Unterstriche enthalten.'
    }

    if (!formData.password) {
      return 'Bitte gib ein Passwort ein.'
    }

    if (formData.password.length < 6) {
      return 'Das Passwort ist zu kurz.'
    }

    if (!formData.passwordConfirmation) {
      return 'Bitte bestätige dein Passwort.'
    }

    if (formData.password !== formData.passwordConfirmation) {
      return 'Passwort und Bestätigung stimmen nicht überein.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        username: formData.username,
        password: formData.password,
      })
      await navigate({ to: '/my-projects' })
    } catch (registerError) {
      setError(registerError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-stone-950">Registrieren</h1>
        <p className="text-sm leading-6 text-stone-600">
          Erstelle ein Konto mit Benutzername und Passwort.
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
            autoComplete="new-password"
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-stone-700">
          Passwort bestätigen
          <input
            type="password"
            value={formData.passwordConfirmation}
            onChange={(event) =>
              updateField('passwordConfirmation', event.target.value)
            }
            autoComplete="new-password"
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
          {isSubmitting ? 'Registrierung läuft' : 'Registrieren'}
        </button>
      </form>

      <p className="text-sm text-stone-600">
        Schon registriert?{' '}
        <Link
          to="/login"
          className="font-medium text-emerald-700 hover:text-emerald-900"
        >
          Anmelden
        </Link>
      </p>
    </section>
  )
}
