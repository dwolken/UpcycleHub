/* eslint-disable react-refresh/only-export-components */

import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { getProject, getProjects, updateProject } from '../../api/projects.js'
import { useAuth } from '../../auth/AuthContext.jsx'

export const Route = createFileRoute('/projects/$id/edit')({
  component: EditProjectPage,
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

function projectToForm(project) {
  return {
    title: project.title || '',
    categoryId: String(project.category?.id || ''),
    difficultyId: String(project.difficulty?.id || ''),
    summary: project.summary || '',
    description: project.description || '',
    estimatedMinutes: String(project.estimatedMinutes || ''),
    imageFile: null,
    materials: project.materials?.length
      ? project.materials.map((material) => ({
          name: material.name || '',
          amount: material.amount || '',
          unit: material.unit || '',
          note: material.note || '',
        }))
      : [{ ...emptyMaterial }],
    steps: project.steps?.length
      ? project.steps.map((step) => ({ text: step.text || '' }))
      : [{ ...emptyStep }],
  }
}

function validateForm(form, hasCurrentImage) {
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
    errors.fields.categoryId = 'Bitte waehle eine Kategorie.'
  }

  if (!form.difficultyId) {
    errors.fields.difficultyId = 'Bitte waehle eine Schwierigkeit.'
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
    errors.fields.estimatedMinutes = 'Bitte gib eine gueltige Dauer ein.'
  }

  if (!form.imageFile && !hasCurrentImage) {
    errors.fields.imageFile = 'Bitte waehle ein Bild aus.'
  } else if (form.imageFile && !allowedImageTypes.includes(form.imageFile.type)) {
    errors.fields.imageFile = 'Bitte waehle eine gueltige Bilddatei aus.'
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
      : 'Bitte fuege mindestens ein Material hinzu.'
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
    errors.steps.section = 'Bitte fuege mindestens einen Schritt hinzu.'
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

function EditProjectPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, user } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [project, setProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [isLoadingProject, setIsLoadingProject] = useState(false)
  const [errors, setErrors] = useState(emptyValidationErrors)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return
    }

    setIsLoadingProject(true)
    setErrors(emptyValidationErrors)

    Promise.all([getProject(id), getProjects()])
      .then(([projectData, projectsData]) => {
        setProject(projectData)
        setProjects(projectsData)
        setForm(projectToForm(projectData))
        setImagePreviewUrl('')
      })
      .catch(() =>
        setErrors({
          ...emptyValidationErrors,
          form: 'Das Projekt konnte nicht geladen werden.',
        }),
      )
      .finally(() => setIsLoadingProject(false))
  }, [id, isAuthenticated, isLoading])

  const categories = useMemo(
    () =>
      uniqueById([
        ...projects.map((projectItem) => projectItem.category),
        project?.category,
      ]),
    [project, projects],
  )
  const difficulties = useMemo(
    () =>
      uniqueById([
        ...projects.map((projectItem) => projectItem.difficulty),
        project?.difficulty,
      ]),
    [project, projects],
  )

  const isOwner = Boolean(project?.owner?.id && user?.id === project.owner.id)

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

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
    }

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
            ? 'Bitte waehle eine gueltige Bilddatei aus.'
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

    const validationErrors = validateForm(form, Boolean(project?.imageUrl))
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

      if (form.imageFile) {
        projectData.append('image', form.imageFile)
      }

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

      const updatedProject = await updateProject(id, projectData)

      await navigate({
        to: '/projects/$id',
        params: { id: String(updatedProject.id) },
      })
    } catch (submitError) {
      setErrors({
        ...emptyValidationErrors,
        form: submitError.message || 'Das Projekt konnte nicht gespeichert werden.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <p className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600">
        Anmeldung wird geprueft.
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
            Melde dich an oder erstelle ein Konto, um dein Projekt zu bearbeiten.
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

  if (isLoadingProject) {
    return (
      <p className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600">
        Projekt wird geladen.
      </p>
    )
  }

  if (errors.form && !project) {
    return (
      <section className="space-y-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-stone-600">{errors.form}</p>
        <Link
          to="/my-projects"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
        >
          Zurueck zu meinen Projekten
        </Link>
      </section>
    )
  }

  if (project && !isOwner) {
    return (
      <section className="space-y-4 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-stone-950">
          Bearbeitung nicht erlaubt
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-stone-600">
          Du kannst nur Projekte bearbeiten, die du selbst erstellt hast.
        </p>
        <Link
          to="/projects/$id"
          params={{ id: String(project.id) }}
          className="inline-flex rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
        >
          Zur Projektseite
        </Link>
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
          Zurueck zu meinen Projekten
        </Link>
        <h1 className="text-3xl font-semibold text-stone-950">
          Projekt bearbeiten
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-stone-600">
          Aktualisiere Grunddaten, Materialien und Schritte deines Projekts.
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
                aria-invalid={Boolean(errors.fields.categoryId)}
                className={fieldClassName(errors.fields.categoryId)}
              >
                <option value="">Kategorie waehlen</option>
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
                aria-invalid={Boolean(errors.fields.difficultyId)}
                className={fieldClassName(errors.fields.difficultyId)}
              >
                <option value="">Schwierigkeit waehlen</option>
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
              Projektbild ersetzen
              <input
                type="file"
                accept={allowedImageTypes.join(',')}
                onChange={handleImageChange}
                aria-invalid={Boolean(errors.fields.imageFile)}
                className={`${fieldClassName(errors.fields.imageFile)} file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-emerald-800`}
              />
              <ErrorText>{errors.fields.imageFile}</ErrorText>
            </label>

            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium text-stone-700">
                {imagePreviewUrl ? 'Neues Bild' : 'Aktuelles Bild'}
              </p>
              {imagePreviewUrl || project?.imageUrl ? (
                <img
                  src={imagePreviewUrl || project.imageUrl}
                  alt="Projektbild"
                  className="aspect-[16/9] w-full rounded-md border border-stone-200 object-cover"
                />
              ) : (
                <p className="rounded-md border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                  Es ist noch kein Bild hinterlegt.
                </p>
              )}
              {!imagePreviewUrl && project?.imageUrl ? (
                <p className="text-sm font-normal text-stone-500">
                  Ohne neue Datei bleibt dieses Bild erhalten.
                </p>
              ) : null}
            </div>

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
              Material hinzufuegen
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
              Schritt hinzufuegen
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
            disabled={isSubmitting}
            className="rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Projekt wird gespeichert' : 'Aenderungen speichern'}
          </button>
          <Link
            to="/projects/$id"
            params={{ id }}
            className="rounded-md border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </div>
  )
}
