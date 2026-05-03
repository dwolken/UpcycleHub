import { useState } from 'react'
import { deleteProject } from '../api/projects.js'

function DeleteProjectButton({ projectId, projectTitle, onDeleted }) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setIsDeleting(true)
    setError('')

    try {
      await deleteProject(projectId)
      await onDeleted?.(projectId)
    } catch (deleteError) {
      setError(deleteError.message || 'Projekt konnte nicht gelöscht werden.')
      setIsDeleting(false)
    }
  }

  function closeConfirmation() {
    setIsConfirming(false)
    setError('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsConfirming(true)
          setError('')
        }}
        className="font-medium text-red-700 hover:text-red-900"
      >
        Löschen
      </button>

      {isConfirming ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-project-title-${projectId}`}
        >
          <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-5 shadow-xl">
            <div className="space-y-2">
              <h2
                id={`delete-project-title-${projectId}`}
                className="text-lg font-semibold text-stone-950"
              >
                Projekt wirklich löschen?
              </h2>
              <p className="text-sm leading-6 text-stone-600">
                Dieses Projekt wird dauerhaft entfernt.
              </p>
              <p className="text-sm font-medium text-stone-800">
                {projectTitle}
              </p>
            </div>

            {error ? (
              <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirmation}
                disabled={isDeleting}
                className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Wird gelöscht' : 'Endgültig löschen'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default DeleteProjectButton
