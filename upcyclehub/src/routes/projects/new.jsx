/* eslint-disable react-refresh/only-export-components */

import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { createProject, getProjects } from '../../api/projects.js'
import { useAuth } from '../../auth/AuthContext.jsx'

export const Route = createFileRoute('/projects/new')({
  component: NewProjectPage,
})

const emptyMaterial = {
  name: '',
  amount: '',
  unit: '',
  note: '',
}

const emptyStep = {
  text: '',
}

const initialForm = {
  title: '',
  categoryId: '',
  difficultyId: '',
  summary: '',
  description: '',
  estimatedMinutes: '',
  imageUrl: '',
  materials: [{ ...emptyMaterial }],
  steps: [{ ...emptyStep }],
}

function uniqueById(items) {
  return [
    ...new Map(
      items
        .filter((item) => item?.id && item?.name)
        .map((item) => [item.id, item]),
    ).values(),
  ].sort((a, b) => a.name.localeCompare(b.name))
}

function validateForm(form) {
  if (!form.title.trim()) {
    return 'Bitte gib einen Projekttitel ein.'
  }

  if (!form.categoryId) {
    return 'Bitte wähle eine Kategorie aus.'
  }

  if (!form.difficultyId) {
    return 'Bitte wähle eine Schwierigkeit aus.'
  }

  if (!form.summary.trim()) {
    return 'Bitte schreibe eine kurze Zusammenfassung.'
  }

  if (!form.description.trim()) {
    return 'Bitte beschreibe dein Projekt.'
  }

  if (!Number.isInteger(Number(form.estimatedMinutes)) || Number(form.estimatedMinutes) < 1) {
    return 'Bitte gib eine gültige Dauer in Minuten ein.'
  }

  if (!form.imageUrl.trim()) {
    return 'Bitte gib eine Bild-URL oder einen Bildpfad ein.'
  }

  const materials = form.materials
    .map((material) => material.name.trim())
    .filter(Boolean)

  if (materials.length === 0) {
    return 'Bitte gib mindestens ein Material ein.'
  }

  if (new Set(materials.map((material) => material.toLowerCase())).size !== materials.length) {
    return 'Bitte führe jedes Material nur einmal an.'
  }

  if (!form.steps.some((step) => step.text.trim())) {
    return 'Bitte gib mindestens einen Arbeitsschritt ein.'
  }

  return ''
}

function NewProjectPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [projects, setProjects] = useState([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return
    }

    setIsLoadingOptions(true)
    setError('')

    getProjects()
      .then((data) => setProjects(data))
      .catch(() =>
        setError('Kategorien und Schwierigkeitsstufen konnten nicht geladen werden.'),
      )
      .finally(() => setIsLoadingOptions(false))
  }, [isAuthenticated, isLoading])

  const categories = useMemo(
    () => uniqueById(projects.map((project) => project.category)),
    [projects],
  )
  const difficulties = useMemo(
    () => uniqueById(projects.map((project) => project.difficulty)),
    [projects],
  )

  function updateField(name, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function updateMaterial(index, name, value) {
    setForm((currentForm) => ({
      ...currentForm,
      materials: currentForm.materials.map((material, materialIndex) =>
        materialIndex === index ? { ...material, [name]: value } : material,
      ),
    }))
  }

  function addMaterial() {
    setForm((currentForm) => ({
      ...currentForm,
      materials: [...currentForm.materials, { ...emptyMaterial }],
    }))
  }

  function removeMaterial(index) {
    setForm((currentForm) => ({
      ...currentForm,
      materials:
        currentForm.materials.length === 1
          ? currentForm.materials
          : currentForm.materials.filter((_, materialIndex) => materialIndex !== index),
    }))
  }

  function updateStep(index, value) {
    setForm((currentForm) => ({
      ...currentForm,
      steps: currentForm.steps.map((step, stepIndex) =>
        stepIndex === index ? { text: value } : step,
      ),
    }))
  }

  function addStep() {
    setForm((currentForm) => ({
      ...currentForm,
      steps: [...currentForm.steps, { ...emptyStep }],
    }))
  }

  function removeStep(index) {
    setForm((currentForm) => ({
      ...currentForm,
      steps:
        currentForm.steps.length === 1
          ? currentForm.steps
          : currentForm.steps.filter((_, stepIndex) => stepIndex !== index),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationError = validateForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const createdProject = await createProject({
        title: form.title,
        categoryId: Number(form.categoryId),
        difficultyId: Number(form.difficultyId),
        summary: form.summary,
        description: form.description,
        estimatedMinutes: Number(form.estimatedMinutes),
        imageUrl: form.imageUrl,
        materials: form.materials,
        steps: form.steps,
      })

      await navigate({
        to: '/projects/$id',
        params: { id: String(createdProject.id) },
      })
    } catch (submitError) {
      setError(submitError.message || 'Das Projekt konnte nicht erstellt werden.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <p className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600">
        Anmeldung wird geprüft.
      </p>
    )
  }

  if (!isAuthenticated) {
    return (
      <section className="space-y-5 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-stone-950">
            Anmeldung erforderlich
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-stone-600">
            Melde dich an oder erstelle ein Konto, um ein eigenes Upcycling-Projekt
            anzulegen.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/login"
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
          >
            Anmelden
          </Link>
          <Link
            to="/register"
            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
          >
            Registrieren
          </Link>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Link
          to="/my-projects"
          className="inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-900"
        >
          Zurück zu meinen Projekten
        </Link>
        <h1 className="text-3xl font-semibold text-stone-950">
          Projekt erstellen
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-stone-600">
          Lege eine saubere Anleitung mit Materialien und Schritten an.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-xl font-semibold text-stone-950">Grunddaten</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-stone-700 md:col-span-2">
              Titel
              <input
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-stone-700">
              Kategorie
              <select
                value={form.categoryId}
                onChange={(event) => updateField('categoryId', event.target.value)}
                disabled={isLoadingOptions}
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600 disabled:bg-stone-100"
              >
                <option value="">Kategorie wählen</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-stone-700">
              Schwierigkeit
              <select
                value={form.difficultyId}
                onChange={(event) => updateField('difficultyId', event.target.value)}
                disabled={isLoadingOptions}
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600 disabled:bg-stone-100"
              >
                <option value="">Schwierigkeit wählen</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty.id} value={difficulty.id}>
                    {difficulty.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-stone-700">
              Dauer in Minuten
              <input
                type="number"
                min="1"
                value={form.estimatedMinutes}
                onChange={(event) =>
                  updateField('estimatedMinutes', event.target.value)
                }
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-stone-700">
              Bild-URL oder Bildpfad
              <input
                value={form.imageUrl}
                onChange={(event) => updateField('imageUrl', event.target.value)}
                placeholder="/images/projects/mein-projekt.jpg"
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-stone-700 md:col-span-2">
              Zusammenfassung
              <textarea
                value={form.summary}
                onChange={(event) => updateField('summary', event.target.value)}
                rows="3"
                className="w-full resize-y rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal leading-6 text-stone-900 outline-none transition focus:border-emerald-600"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-stone-700 md:col-span-2">
              Beschreibung
              <textarea
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                rows="5"
                className="w-full resize-y rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal leading-6 text-stone-900 outline-none transition focus:border-emerald-600"
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-stone-950">Materialien</h2>
            <button
              type="button"
              onClick={addMaterial}
              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
            >
              Material hinzufügen
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {form.materials.map((material, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-md border border-stone-200 bg-stone-50 p-4 md:grid-cols-[1.2fr_0.7fr_0.7fr_1.2fr_auto]"
              >
                <label className="space-y-2 text-sm font-medium text-stone-700">
                  Name
                  <input
                    value={material.name}
                    onChange={(event) =>
                      updateMaterial(index, 'name', event.target.value)
                    }
                    className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-stone-700">
                  Menge
                  <input
                    value={material.amount}
                    onChange={(event) =>
                      updateMaterial(index, 'amount', event.target.value)
                    }
                    className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-stone-700">
                  Einheit
                  <input
                    value={material.unit}
                    onChange={(event) =>
                      updateMaterial(index, 'unit', event.target.value)
                    }
                    className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-stone-700">
                  Hinweis
                  <input
                    value={material.note}
                    onChange={(event) =>
                      updateMaterial(index, 'note', event.target.value)
                    }
                    className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition focus:border-emerald-600"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => removeMaterial(index)}
                  disabled={form.materials.length === 1}
                  className="self-end rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Entfernen
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-stone-950">Schritte</h2>
            <button
              type="button"
              onClick={addStep}
              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
            >
              Schritt hinzufügen
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {form.steps.map((step, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-md border border-stone-200 bg-stone-50 p-4 md:grid-cols-[auto_1fr_auto]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-800">
                  {index + 1}
                </span>
                <textarea
                  value={step.text}
                  onChange={(event) => updateStep(index, event.target.value)}
                  rows="3"
                  className="w-full resize-y rounded-md border border-stone-300 bg-white px-3 py-2 text-sm leading-6 text-stone-900 outline-none transition focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  disabled={form.steps.length === 1}
                  className="self-start rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Entfernen
                </button>
              </div>
            ))}
          </div>
        </section>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting || isLoadingOptions}
            className="rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Projekt wird erstellt' : 'Projekt erstellen'}
          </button>
          <Link
            to="/my-projects"
            className="rounded-md border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </div>
  )
}
