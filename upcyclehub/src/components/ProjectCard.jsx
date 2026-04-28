import { Link } from '@tanstack/react-router'

function ProjectCard({ project }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2 text-xs font-medium">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">
          {project.category.name}
        </span>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
          {project.difficulty.name}
        </span>
      </div>

      <h2 className="mt-4 text-xl font-semibold text-stone-950">
        {project.title}
      </h2>
      <p className="mt-3 flex-1 text-sm leading-6 text-stone-600">
        {project.summary}
      </p>

      <div className="mt-5 flex items-center justify-between gap-4 text-sm">
        <span className="text-stone-500">
          {project.estimatedMinutes} Minuten
        </span>
        <Link
          to="/projects/$id"
          params={{ id: String(project.id) }}
          className="font-medium text-emerald-700 hover:text-emerald-900"
        >
          Details ansehen
        </Link>
      </div>
    </article>
  )
}

export default ProjectCard
