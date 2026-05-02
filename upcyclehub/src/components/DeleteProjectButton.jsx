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
      setError(deleteError.message || 'Projekt konnte nicht geloescht werden.')
      setIsDeleting(false)
    }
  }

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsConfirming(true)
          setError('')
        }}
        className="font-medium text-red-700 hover:text-red-900"
      >
        Loeschen
      </button>
    )
  }

  return (
    <div className="w-full rounded-md border border-red-200 bg-red-50 p-3 text-sm">
      <p className="font-medium text-red-900">
        Projekt wirklich loeschen?
      </p>
      <p className="mt-1 text-red-700">
        {projectTitle} wird dauerhaft entfernt.
      </p>

      {error ? <p className="mt-2 text-red-700">{error}</p> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-md bg-red-700 px-3 py-1.5 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? 'Wird geloescht' : 'Endgueltig loeschen'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsConfirming(false)
            setError('')
          }}
          disabled={isDeleting}
          className="rounded-md border border-stone-300 bg-white px-3 py-1.5 font-medium text-stone-700 transition hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Abbrechen
        </button>
      </div>
    </div>
  )
}

export default DeleteProjectButton
