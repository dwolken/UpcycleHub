/* eslint-disable react-refresh/only-export-components */

import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toUserMessage } from '../api/apiErrors.js'
import { useAuth } from '../auth/AuthContext.jsx'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

const emptyFieldErrors = {
  username: '',
  password: '',
}

const inputClassName =
  'w-full rounded-md border bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition'

function fieldClassName(error) {
  return error
    ? `${inputClassName} border-red-300 focus:border-red-600`
    : `${inputClassName} border-stone-300 focus:border-emerald-600`
}

function FieldError({ children }) {
  if (!children) {
    return null
  }

  return <p className="text-sm font-normal text-red-700">{children}</p>
}

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(name, value) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }))
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setFieldErrors(emptyFieldErrors)

    const nextFieldErrors = { ...emptyFieldErrors }
    if (!formData.username.trim()) {
      nextFieldErrors.username = 'Bitte gib einen Benutzernamen ein.'
    }

    if (!formData.password) {
      nextFieldErrors.password = 'Bitte gib ein Passwort ein.'
    }

    if (nextFieldErrors.username || nextFieldErrors.password) {
      setFieldErrors(nextFieldErrors)
      return
    }

    setIsSubmitting(true)

    try {
      await login(formData)
      await navigate({ to: '/my-projects' })
    } catch (loginError) {
      setError(
        toUserMessage(
          loginError,
          'Die Anmeldung konnte nicht abgeschlossen werden.',
        ),
      )
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
            aria-invalid={Boolean(fieldErrors.username)}
            className={fieldClassName(fieldErrors.username)}
          />
          <FieldError>{fieldErrors.username}</FieldError>
        </label>

        <label className="block space-y-2 text-sm font-medium text-stone-700">
          Passwort
          <input
            type="password"
            value={formData.password}
            onChange={(event) => updateField('password', event.target.value)}
            autoComplete="current-password"
            aria-invalid={Boolean(fieldErrors.password)}
            className={fieldClassName(fieldErrors.password)}
          />
          <FieldError>{fieldErrors.password}</FieldError>
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
          {isSubmitting ? 'Anmeldung läuft' : 'Anmelden'}
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
