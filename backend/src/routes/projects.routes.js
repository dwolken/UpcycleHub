const express = require('express')
const db = require('../db')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

function getMaterials(projectId) {
  return db
    .prepare(
      `
      SELECT
        m.m_id AS id,
        m.m_name AS name,
        pm.pm_amount AS amount,
        pm.pm_unit AS unit,
        pm.pm_note AS note
      FROM project_materials pm
      JOIN materials m ON m.m_id = pm.pm_m_id
      WHERE pm.pm_p_id = ?
      ORDER BY pm.pm_id
      `,
    )
    .all(projectId)
}

function getSteps(projectId) {
  return db
    .prepare(
      `
      SELECT ps_step_number AS stepNumber, ps_text AS text
      FROM project_steps
      WHERE ps_p_id = ?
      ORDER BY ps_step_number
      `,
    )
    .all(projectId)
}

function mapProject(row, includeDetails = false) {
  const project = {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    estimatedMinutes: row.estimatedMinutes,
    imageUrl: row.imageUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    category: {
      id: row.categoryId,
      name: row.categoryName,
    },
    difficulty: {
      id: row.difficultyId,
      name: row.difficultyName,
    },
    materials: getMaterials(row.id),
  }

  if (includeDetails) {
    project.steps = getSteps(row.id)
  }

  return project
}

router.get('/', (req, res) => {
  const { category, difficulty, material, q } = req.query
  const conditions = []
  const params = {}

  if (category) {
    conditions.push('LOWER(c.c_name) = LOWER(@category)')
    params.category = category
  }

  if (difficulty) {
    conditions.push('LOWER(d.d_name) = LOWER(@difficulty)')
    params.difficulty = difficulty
  }

  if (material) {
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM project_materials pm_filter
        JOIN materials m_filter ON m_filter.m_id = pm_filter.pm_m_id
        WHERE pm_filter.pm_p_id = p.p_id
          AND LOWER(m_filter.m_name) = LOWER(@material)
      )
    `)
    params.material = material
  }

  if (q) {
    conditions.push(`
      (
        LOWER(p.p_title) LIKE LOWER(@search)
        OR LOWER(p.p_summary) LIKE LOWER(@search)
        OR LOWER(p.p_description) LIKE LOWER(@search)
        OR EXISTS (
          SELECT 1
          FROM project_materials pm_search
          JOIN materials m_search ON m_search.m_id = pm_search.pm_m_id
          WHERE pm_search.pm_p_id = p.p_id
            AND LOWER(m_search.m_name) LIKE LOWER(@search)
        )
      )
    `)
    params.search = `%${q}%`
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const rows = db
    .prepare(
      `
      SELECT
        p.p_id AS id,
        p.p_title AS title,
        p.p_slug AS slug,
        p.p_summary AS summary,
        p.p_description AS description,
        p.p_estimated_minutes AS estimatedMinutes,
        p.p_image_url AS imageUrl,
        p.p_created_at AS createdAt,
        p.p_updated_at AS updatedAt,
        c.c_id AS categoryId,
        c.c_name AS categoryName,
        d.d_id AS difficultyId,
        d.d_name AS difficultyName
      FROM projects p
      JOIN categories c ON c.c_id = p.p_c_id
      JOIN difficulties d ON d.d_id = p.p_d_id
      ${where}
      ORDER BY p.p_created_at DESC, p.p_id DESC
      `,
    )
    .all(params)

  res.json({
    data: rows.map((row) => mapProject(row)),
  })
})

router.get('/mine', requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `
      SELECT
        p.p_id AS id,
        p.p_title AS title,
        p.p_slug AS slug,
        p.p_summary AS summary,
        p.p_description AS description,
        p.p_estimated_minutes AS estimatedMinutes,
        p.p_image_url AS imageUrl,
        p.p_created_at AS createdAt,
        p.p_updated_at AS updatedAt,
        c.c_id AS categoryId,
        c.c_name AS categoryName,
        d.d_id AS difficultyId,
        d.d_name AS difficultyName
      FROM projects p
      JOIN categories c ON c.c_id = p.p_c_id
      JOIN difficulties d ON d.d_id = p.p_d_id
      WHERE p.p_u_id = ?
      ORDER BY p.p_created_at DESC, p.p_id DESC
      `,
    )
    .all(req.session.userId)

  res.json({
    data: rows.map((row) => mapProject(row)),
  })
})

router.get('/:id', (req, res, next) => {
  const row = db
    .prepare(
      `
      SELECT
        p.p_id AS id,
        p.p_title AS title,
        p.p_slug AS slug,
        p.p_summary AS summary,
        p.p_description AS description,
        p.p_estimated_minutes AS estimatedMinutes,
        p.p_image_url AS imageUrl,
        p.p_created_at AS createdAt,
        p.p_updated_at AS updatedAt,
        c.c_id AS categoryId,
        c.c_name AS categoryName,
        d.d_id AS difficultyId,
        d.d_name AS difficultyName
      FROM projects p
      JOIN categories c ON c.c_id = p.p_c_id
      JOIN difficulties d ON d.d_id = p.p_d_id
      WHERE p.p_id = ?
      `,
    )
    .get(req.params.id)

  if (!row) {
    const error = new Error('Projekt wurde nicht gefunden.')
    error.status = 404
    return next(error)
  }

  return res.json({
    data: mapProject(row, true),
  })
})

module.exports = router
