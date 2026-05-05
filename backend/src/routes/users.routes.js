const express = require('express')
const db = require('../db')
const { sendError } = require('../utils/apiResponses')

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

function mapProject(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    estimatedMinutes: row.estimatedMinutes,
    imageUrl: row.imageUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    owner: {
      id: row.ownerId,
      username: row.ownerUsername,
    },
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
}

router.get('/:username/projects', (req, res) => {
  const user = db
    .prepare(
      `
      SELECT
        u_id AS id,
        u_username AS username
      FROM users
      WHERE u_username = ?
      `,
    )
    .get(req.params.username)

  if (!user) {
    return sendError(res, 'Benutzer wurde nicht gefunden.', 404)
  }

  const rows = db
    .prepare(
      `
      SELECT
        p.p_id AS id,
        p.p_u_id AS ownerId,
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
        d.d_name AS difficultyName,
        u.u_username AS ownerUsername
      FROM projects p
      JOIN categories c ON c.c_id = p.p_c_id
      JOIN difficulties d ON d.d_id = p.p_d_id
      JOIN users u ON u.u_id = p.p_u_id
      WHERE p.p_u_id = ?
      ORDER BY p.p_created_at DESC, p.p_id DESC
      `,
    )
    .all(user.id)

  return res.json({
    data: {
      user,
      projects: rows.map((row) => mapProject(row)),
    },
  })
})

module.exports = router
