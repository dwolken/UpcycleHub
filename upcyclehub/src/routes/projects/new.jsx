/* eslint-disable react-refresh/only-export-components */

import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { toUserMessage } from '../../api/apiErrors.js'
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
  imageFile: null,
  materials: [{ ...emptyMaterial }],
  steps: [{ ...emptyStep }],
}

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const emptyValidationErrors = {
  fields: {},
  materials: {
    section: '',
    rows: [],
  },
  steps: {
    section: '',
    rows: [],
  },
  form: '',
}

const inputClassName =
  'w-full rounded-md border bg-white px-3 py-2 text-sm font-normal text-stone-900 outline-none transition'
const textareaClassName =
  'w-full resize-y rounded-md border bg-white px-3 py-2 text-sm font-normal leading-6 text-stone-900 outline-none transition'

function fieldClassName(message) {
  return message
    ? `${inputClassName} border-red-300 focus:border-red-600`
    : `${inputClassName} border-stone-300 focus:border-emerald-600`
}

function textareaFieldClassName(message) {
  return message
    ? `${textareaClassName} border-red-300 focus:border-red-600`
    : `${textareaClassName} border-stone-300 focus:border-emerald-600`
}

function ErrorText({ children }) {
  if (!children) {
    return null
  }

  return <p className="text-sm font-normal text-red-700">{children}</p>
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
  const errors = {
    fields: {},
    materials: {
      section: '',
      rows: form.materials.map(() => ({})),
    },
    steps: {
      section: '',
      rows: form.steps.map(() => ''),
    },
    form: '',
  }

  if (!form.title.trim()) {
    errors.fields.title = 'Bitte gib einen Titel ein.'
  }

  if (!form.categoryId) {
    errors.fields.categoryId = 'Bitte wähle eine Kategorie.'
  }

  if (!form.difficultyId) {
    errors.fields.difficultyId = 'Bitte wähle eine Schwierigkeit.'
  }

  if (!form.summary.trim()) {
    errors.fields.summary = 'Bitte gib eine kurze Zusammenfassung ein.'
  }

  if (!form.description.trim()) {
    errors.fields.description = 'Bitte gib eine Beschreibung ein.'
  }

  if (
    !Number.isInteger(Number(form.estimatedMinutes)) ||
    Number(form.estimatedMinutes) < 1
  ) {
    errors.fields.estimatedMinutes = 'Bitte gib eine gültige Dauer ein.'
  }

  if (!form.imageFile) {
    errors.fields.imageFile = 'Bitte wähle ein Bild aus.'
  } else if (!allowedImageTypes.includes(form.imageFile.type)) {
    errors.fields.imageFile = 'Bitte wähle eine gültige Bilddatei aus.'
  }

  const filledMaterialNames = []
  let hasCompleteMaterial = false

  form.materials.forEach((material, index) => {
    const name = material.name.trim()
    const amount = material.amount.trim()
    const unit = material.unit.trim()
    const note = material.note.trim()
    const hasAnyMaterialInput = Boolean(name || amount || unit || note)
    const rowErrors = errors.materials.rows[index]

    if (!hasAnyMaterialInput) {
      return
    }

    if (!name) {
      rowErrors.name = 'Bitte gib einen Materialnamen ein.'
    }

    if (!amount) {
      rowErrors.amount = 'Bitte gib eine Menge ein.'
    }

    if (name && amount) {
      hasCompleteMaterial = true
      filledMaterialNames.push({ name: name.toLowerCase(), index })
    }
  })

  if (!hasCompleteMaterial) {
    const hasAnyMaterialInput = form.materials.some((material) =>
      [material.name, material.amount, material.unit, material.note].some(
        (value) => value.trim(),
      ),
    )

    errors.materials.section = hasAnyMaterialInput
      ? ''
      : 'Bitte füge mindestens ein Material hinzu.'
  }

  const seenMaterialNames = new Map()
  filledMaterialNames.forEach((material) => {
    if (seenMaterialNames.has(material.name)) {
      errors.materials.rows[material.index].name =
        'Dieses Material ist doppelt eingetragen.'
      errors.materials.rows[seenMaterialNames.get(material.name)].name =
        'Dieses Material ist doppelt eingetragen.'
      return
    }

    seenMaterialNames.set(material.name, material.index)
  })

  let hasCompleteStep = false

  form.steps.forEach((step, index) => {
    if (step.text.trim()) {
      hasCompleteStep = true
      return
    }

    errors.steps.rows[index] = 'Bitte beschreibe den Schritt.'
  })

  if (!hasCompleteStep) {
    errors.steps.section = 'Bitte füge mindestens einen Schritt hinzu.'
  }

  return errors
}

function hasValidationErrors(errors) {
  return Boolean(
    errors.form ||
      Object.values(errors.fields).some(Boolean) ||
      errors.materials.section ||
      errors.materials.rows.some((row) => Object.values(row).some(Boolean)) ||
      errors.steps.section ||
      errors.steps.rows.some(Boolean),
  )
}

function NewProjectPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [projects, setProjects] = useState([])
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [errors, setErrors] = useState(emptyValidationErrors)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return
    }

    setIsLoadingOptions(true)
    setErrors(emptyValidationErrors)

    getProjects()
      .then((data) => setProjects(data))
      .catch((requestError) =>
        setErrors({
          ...emptyValidationErrors,
          form: toUserMessage(
            requestError,
            'Kategorien und Schwierigkeitsstufen konnten nicht geladen werden.',
          ),
        }),
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

  useEffect(
    () => () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    },
    [imagePreviewUrl],
  )

  function updateField(name, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
    setErrors((currentErrors) => ({
      ...currentErrors,
      fields: {
        ...currentErrors.fields,
        [name]: '',
      },
      form: '',
    }))
  }

  function updateImageFile(file) {
    setForm((currentForm) => ({
      ...currentForm,
      imageFile: file,
    }))

    if (file && allowedImageTypes.includes(file.type)) {
      setImagePreviewUrl(URL.createObjectURL(file))
    } else {
      setImagePreviewUrl('')
    }

    setErrors((currentErrors) => ({
      ...currentErrors,
      fields: {
        ...currentErrors.fields,
        imageFile:
          file && !allowedImageTypes.includes(file.type)
            ? 'Bitte wähle eine gültige Bilddatei aus.'
            : '',
      },
      form: '',
    }))
  }

  function handleImageChange(event) {
    updateImageFile(event.target.files?.[0] || null)
  }

  function updateMaterial(index, name, value) {
    setForm((currentForm) => ({
      ...currentForm,
      materials: currentForm.materials.map((material, materialIndex) =>
        materialIndex === index ? { ...material, [name]: value } : material,
      ),
    }))
    setErrors((currentErrors) => {
      const rows = [...currentErrors.materials.rows]
      rows[index] = {
        ...(rows[index] || {}),
        [name]: '',
      }

      return {
        ...currentErrors,
        materials: {
          section: '',
          rows,
        },
        form: '',
      }
    })
  }

  function addMaterial() {
    setForm((currentForm) => ({
      ...currentForm,
      materials: [...currentForm.materials, { ...emptyMaterial }],
    }))
    setErrors((currentErrors) => ({
      ...currentErrors,
      materials: {
        section: '',
        rows: [...currentErrors.materials.rows, {}],
      },
      form: '',
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
    setErrors((currentErrors) => ({
      ...currentErrors,
      materials: {
        section: '',
        rows:
          currentErrors.materials.rows.length <= 1
            ? currentErrors.materials.rows
            : currentErrors.materials.rows.filter(
                (_, materialIndex) => materialIndex !== index,
              ),
      },
      form: '',
    }))
  }

  function updateStep(index, value) {
    setForm((currentForm) => ({
      ...currentForm,
      steps: currentForm.steps.map((step, stepIndex) =>
        stepIndex === index ? { text: value } : step,
      ),
    }))
    setErrors((currentErrors) => {
      const rows = [...currentErrors.steps.rows]
      rows[index] = ''

      return {
        ...currentErrors,
        steps: {
          section: '',
          rows,
        },
        form: '',
      }
    })
  }

  function addStep() {
    setForm((currentForm) => ({
      ...currentForm,
      steps: [...currentForm.steps, { ...emptyStep }],
    }))
    setErrors((currentErrors) => ({
      ...currentErrors,
      steps: {
        section: '',
        rows: [...currentErrors.steps.rows, ''],
      },
      form: '',
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
    setErrors((currentErrors) => ({
      ...currentErrors,
      steps: {
        section: '',
        rows:
          currentErrors.steps.rows.length <= 1
            ? currentErrors.steps.rows
            : currentErrors.steps.rows.filter(
                (_, stepIndex) => stepIndex !== index,
              ),
      },
      form: '',
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateForm(form)
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setErrors(emptyValidationErrors)

    try {
      const projectData = new FormData()
      projectData.append('title', form.title.trim())
      projectData.append('categoryId', form.categoryId)
      projectData.append('difficultyId', form.difficultyId)
      projectData.append('summary', form.summary.trim())
      projectData.append('description', form.description.trim())
      projectData.append('estimatedMinutes', form.estimatedMinutes)
      projectData.append('image', form.imageFile)
      projectData.append(
        'materials',
        JSON.stringify(
          form.materials
            .filter((material) => material.name.trim())
            .map((material) => ({
              name: material.name.trim(),
              amount: material.amount.trim(),
              unit: material.unit.trim(),
              note: material.note.trim(),
            })),
        ),
      )
      projectData.append(
        'steps',
        JSON.stringify(
          form.steps
            .filter((step) => step.text.trim())
            .map((step) => ({ text: step.text.trim() })),
        ),
      )

      const createdProject = await createProject(projectData)

      await navigate({
        to: '/projects/$id',
        params: { id: String(createdProject.id) },
      })
    } catch (submitError) {
      setErrors({
        ...emptyValidationErrors,
        form: toUserMessage(
          submitError,
          'Das Projekt konnte nicht erstellt werden.',
          {
            401: 'Bitte melde dich an, um ein Projekt zu erstellen.',
            403: 'Diese Aktion ist nicht erlaubt.',
          },
        ),
      })
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
                aria-invalid={Boolean(errors.fields.title)}
                className={fieldClassName(errors.fields.title)}
              />
              <ErrorText>{errors.fields.title}</ErrorText>
            </label>

            <label className="space-y-2 text-sm font-medium text-stone-700">
              Kategorie
              <select
                value={form.categoryId}
                onChange={(event) => updateField('categoryId', event.target.value)}
                disabled={isLoadingOptions}
                aria-invalid={Boolean(errors.fields.categoryId)}
                className={`${fieldClassName(errors.fields.categoryId)} disabled:bg-stone-100`}
              >
                <option value="">Kategorie wählen</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ErrorText>{errors.fields.categoryId}</ErrorText>
            </label>

            <label className="space-y-2 text-sm font-medium text-stone-700">
              Schwierigkeit
              <select
                value={form.difficultyId}
                onChange={(event) => updateField('difficultyId', event.target.value)}
                disabled={isLoadingOptions}
                aria-invalid={Boolean(errors.fields.difficultyId)}
                className={`${fieldClassName(errors.fields.difficultyId)} disabled:bg-stone-100`}
              >
                <option value="">Schwierigkeit wählen</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty.id} value={difficulty.id}>
                    {difficulty.name}
                  </option>
                ))}
              </select>
              <ErrorText>{errors.fields.difficultyId}</ErrorText>
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
                aria-invalid={Boolean(errors.fields.estimatedMinutes)}
                className={fieldClassName(errors.fields.estimatedMinutes)}
              />
              <ErrorText>{errors.fields.estimatedMinutes}</ErrorText>
            </label>

            <label className="space-y-2 text-sm font-medium text-stone-700">
              Projektbild
              <input
                type="file"
                accept={allowedImageTypes.join(',')}
                onChange={handleImageChange}
                aria-invalid={Boolean(errors.fields.imageFile)}
                className={`${fieldClassName(errors.fields.imageFile)} file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-emerald-800`}
              />
              <ErrorText>{errors.fields.imageFile}</ErrorText>
            </label>

            {imagePreviewUrl ? (
              <div className="space-y-2 md:col-span-2">
                <p className="text-sm font-medium text-stone-700">Bildvorschau</p>
                <img
                  src={imagePreviewUrl}
                  alt="Vorschau des Projektbilds"
                  className="aspect-[16/9] w-full rounded-md border border-stone-200 object-cover"
                />
              </div>
            ) : null}

            <label className="space-y-2 text-sm font-medium text-stone-700 md:col-span-2">
              Zusammenfassung
              <textarea
                value={form.summary}
                onChange={(event) => updateField('summary', event.target.value)}
                rows="3"
                aria-invalid={Boolean(errors.fields.summary)}
                className={textareaFieldClassName(errors.fields.summary)}
              />
              <ErrorText>{errors.fields.summary}</ErrorText>
            </label>

            <label className="space-y-2 text-sm font-medium text-stone-700 md:col-span-2">
              Beschreibung
              <textarea
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                rows="5"
                aria-invalid={Boolean(errors.fields.description)}
                className={textareaFieldClassName(errors.fields.description)}
              />
              <ErrorText>{errors.fields.description}</ErrorText>
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
          <ErrorText>{errors.materials.section}</ErrorText>

          <div className="mt-5 space-y-4">
            {form.materials.map((material, index) => {
              const rowErrors = errors.materials.rows[index] || {}
              const hasRowError = Object.values(rowErrors).some(Boolean)

              return (
                <div
                  key={index}
                  className={`grid gap-3 rounded-md border bg-stone-50 p-4 md:grid-cols-[1.2fr_0.7fr_0.7fr_1.2fr_auto] ${
                    hasRowError ? 'border-red-200' : 'border-stone-200'
                  }`}
                >
                  <label className="space-y-2 text-sm font-medium text-stone-700">
                    Name
                    <input
                      value={material.name}
                      onChange={(event) =>
                        updateMaterial(index, 'name', event.target.value)
                      }
                      aria-invalid={Boolean(rowErrors.name)}
                      className={fieldClassName(rowErrors.name)}
                    />
                    <ErrorText>{rowErrors.name}</ErrorText>
                  </label>

                  <label className="space-y-2 text-sm font-medium text-stone-700">
                    Menge
                    <input
                      value={material.amount}
                      onChange={(event) =>
                        updateMaterial(index, 'amount', event.target.value)
                      }
                      aria-invalid={Boolean(rowErrors.amount)}
                      className={fieldClassName(rowErrors.amount)}
                    />
                    <ErrorText>{rowErrors.amount}</ErrorText>
                  </label>

                  <label className="space-y-2 text-sm font-medium text-stone-700">
                    Einheit
                    <input
                      value={material.unit}
                      onChange={(event) =>
                        updateMaterial(index, 'unit', event.target.value)
                      }
                      className={fieldClassName('')}
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-stone-700">
                    Hinweis
                    <input
                      value={material.note}
                      onChange={(event) =>
                        updateMaterial(index, 'note', event.target.value)
                      }
                      className={fieldClassName('')}
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
              )
            })}
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
          <ErrorText>{errors.steps.section}</ErrorText>

          <div className="mt-5 space-y-4">
            {form.steps.map((step, index) => {
              const stepError = errors.steps.rows[index]

              return (
                <div
                  key={index}
                  className={`grid gap-3 rounded-md border bg-stone-50 p-4 md:grid-cols-[auto_1fr_auto] ${
                    stepError ? 'border-red-200' : 'border-stone-200'
                  }`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-800">
                    {index + 1}
                  </span>
                  <label className="space-y-2">
                    <textarea
                      value={step.text}
                      onChange={(event) => updateStep(index, event.target.value)}
                      rows="3"
                      aria-invalid={Boolean(stepError)}
                      className={textareaFieldClassName(stepError)}
                    />
                    <ErrorText>{stepError}</ErrorText>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    disabled={form.steps.length === 1}
                    className="self-start rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Entfernen
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {errors.form ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errors.form}
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
