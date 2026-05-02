const fs = require('fs')
const path = require('path')
const express = require('express')
const multer = require('multer')
const db = require('../db')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()
const uploadDirectory = path.join(__dirname, '..', '..', 'public', 'images', 'projects')
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

fs.mkdirSync(uploadDirectory, { recursive: true })

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, uploadDirectory)
    },
    filename(req, file, cb) {
      const extension = path.extname(file.originalname).toLowerCase()
      const baseName = path
        .basename(file.originalname, extension)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      const safeBaseName = baseName || 'projektbild'
      const uniquePart = `${Date.now()}-${Math.round(Math.random() * 1e9)}`

      cb(null, `${safeBaseName}-${uniquePart}${extension}`)
    },
  }),
  fileFilter(req, file, cb) {
    if (!allowedImageTypes.has(file.mimetype)) {
      const error = new Error('Bitte waehle eine gueltige Bilddatei aus.')
      error.status = 400
      cb(error)
      return
    }

    cb(null, true)
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})

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

function getProjectRow(projectId) {
  return db
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
      WHERE p.p_id = ?
      `,
    )
    .get(projectId)
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

  if (includeDetails) {
    project.steps = getSteps(row.id)
  }

  return project
}

function cleanText(value) {
  return String(value || '').trim()
}

function sendValidationError(res, message) {
  return res.status(400).json({ message })
}

function deleteUploadedFile(file) {
  if (file?.path) {
    fs.unlink(file.path, () => {})
  }
}

function deleteProjectImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith('/images/projects/')) {
    return
  }

  const fileName = path.basename(imageUrl)
  const looksLikeUploadedProjectImage =
    /-\d{13}-\d+\.(jpe?g|png|webp|gif)$/i.test(fileName)

  if (!looksLikeUploadedProjectImage) {
    return
  }

  const filePath = path.join(uploadDirectory, fileName)
  const resolvedUploadDirectory = path.resolve(uploadDirectory)
  const resolvedFilePath = path.resolve(filePath)

  if (!resolvedFilePath.startsWith(`${resolvedUploadDirectory}${path.sep}`)) {
    return
  }

  fs.unlink(resolvedFilePath, () => {})
}

function parseArrayField(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (!value) {
    return []
  }

  try {
    const parsedValue = JSON.parse(value)
    return Array.isArray(parsedValue) ? parsedValue : null
  } catch {
    return null
  }
}

function uploadProjectImage(req, res, next) {
  upload.single('image')(req, res, (error) => {
    if (!error) {
      return next()
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'Das Bild darf maximal 5 MB gross sein.',
      })
    }

    return res.status(error.status || 400).json({
      message: error.message || 'Das Bild konnte nicht hochgeladen werden.',
    })
  })
}

function createSlug(title) {
  return (
    title
      .toLowerCase()
      .replace(/ß/g, 'ss')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'projekt'
  )
}

function createUniqueSlug(title, ignoredProjectId = null) {
  const baseSlug = createSlug(title)
  let slug = baseSlug
  let counter = 2

  const slugExists = db.prepare(
    ignoredProjectId
      ? 'SELECT 1 FROM projects WHERE p_slug = ? AND p_id != ?'
      : 'SELECT 1 FROM projects WHERE p_slug = ?',
  )

  while (
    ignoredProjectId ? slugExists.get(slug, ignoredProjectId) : slugExists.get(slug)
  ) {
    slug = `${baseSlug}-${counter}`
    counter += 1
  }

  return slug
}

function validateProjectPayload(body) {
  const title = cleanText(body?.title)
  const summary = cleanText(body?.summary)
  const description = cleanText(body?.description)
  const imageUrl = cleanText(body?.imageUrl)
  const categoryId = Number(body?.categoryId)
  const difficultyId = Number(body?.difficultyId)
  const estimatedMinutes = Number(body?.estimatedMinutes)
  const materials = parseArrayField(body?.materials)
  const steps = parseArrayField(body?.steps)

  if (!title) {
    return { error: 'Bitte gib einen Projekttitel ein.' }
  }

  if (!Number.isInteger(categoryId) || categoryId < 1) {
    return { error: 'Bitte waehle eine Kategorie aus.' }
  }

  if (!Number.isInteger(difficultyId) || difficultyId < 1) {
    return { error: 'Bitte waehle eine Schwierigkeit aus.' }
  }

  if (!summary) {
    return { error: 'Bitte gib eine kurze Zusammenfassung ein.' }
  }

  if (!description) {
    return { error: 'Bitte beschreibe dein Projekt.' }
  }

  if (!Number.isInteger(estimatedMinutes) || estimatedMinutes < 1) {
    return { error: 'Bitte gib eine gueltige Dauer in Minuten ein.' }
  }

  if (!imageUrl) {
    return { error: 'Bitte waehle ein Bild aus.' }
  }

  if (!materials || !steps) {
    return { error: 'Die Projektdaten konnten nicht gelesen werden.' }
  }

  const cleanedMaterials = materials
    .map((material) => ({
      name: cleanText(material?.name),
      amount: cleanText(material?.amount) || null,
      unit: cleanText(material?.unit) || null,
      note: cleanText(material?.note) || null,
    }))
    .filter((material) => material.name)

  if (cleanedMaterials.length === 0) {
    return { error: 'Bitte gib mindestens ein Material ein.' }
  }

  const materialNames = new Set()
  const hasDuplicateMaterial = cleanedMaterials.some((material) => {
    const normalizedName = material.name.toLowerCase()
    if (materialNames.has(normalizedName)) {
      return true
    }
    materialNames.add(normalizedName)
    return false
  })

  if (hasDuplicateMaterial) {
    return { error: 'Bitte fuehre jedes Material nur einmal an.' }
  }

  const cleanedSteps = steps
    .map((step) => cleanText(step?.text ?? step))
    .filter(Boolean)

  if (cleanedSteps.length === 0) {
    return { error: 'Bitte gib mindestens einen Schritt ein.' }
  }

  return {
    project: {
      title,
      categoryId,
      difficultyId,
      summary,
      description,
      estimatedMinutes,
      imageUrl,
      materials: cleanedMaterials,
      steps: cleanedSteps,
    },
  }
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
      ${where}
      ORDER BY p.p_created_at DESC, p.p_id DESC
      `,
    )
    .all(params)

  res.json({
    data: rows.map((row) => mapProject(row)),
  })
})

router.post('/', requireAuth, uploadProjectImage, (req, res, next) => {
  const imageUrl = req.file ? `/images/projects/${req.file.filename}` : ''
  const validation = validateProjectPayload({
    ...req.body,
    imageUrl,
  })

  if (validation.error) {
    deleteUploadedFile(req.file)
    return sendValidationError(res, validation.error)
  }

  const project = validation.project
  const categoryExists = db
    .prepare('SELECT 1 FROM categories WHERE c_id = ?')
    .get(project.categoryId)
  const difficultyExists = db
    .prepare('SELECT 1 FROM difficulties WHERE d_id = ?')
    .get(project.difficultyId)

  if (!categoryExists) {
    deleteUploadedFile(req.file)
    return sendValidationError(res, 'Die ausgewaehlte Kategorie ist ungueltig.')
  }

  if (!difficultyExists) {
    deleteUploadedFile(req.file)
    return sendValidationError(
      res,
      'Die ausgewaehlte Schwierigkeit ist ungueltig.',
    )
  }

  try {
    const createProject = db.transaction(() => {
      const result = db
        .prepare(
          `
          INSERT INTO projects (
            p_u_id,
            p_c_id,
            p_d_id,
            p_title,
            p_slug,
            p_summary,
            p_description,
            p_estimated_minutes,
            p_image_url
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
        )
        .run(
          req.session.userId,
          project.categoryId,
          project.difficultyId,
          project.title,
          createUniqueSlug(project.title),
          project.summary,
          project.description,
          project.estimatedMinutes,
          project.imageUrl,
        )

      const projectId = result.lastInsertRowid
      const findMaterial = db.prepare(
        'SELECT m_id FROM materials WHERE LOWER(m_name) = LOWER(?)',
      )
      const insertMaterial = db.prepare(
        'INSERT INTO materials (m_name) VALUES (?)',
      )
      const insertProjectMaterial = db.prepare(
        `
        INSERT INTO project_materials (
          pm_p_id,
          pm_m_id,
          pm_amount,
          pm_unit,
          pm_note
        )
        VALUES (?, ?, ?, ?, ?)
        `,
      )
      const insertStep = db.prepare(
        `
        INSERT INTO project_steps (ps_p_id, ps_step_number, ps_text)
        VALUES (?, ?, ?)
        `,
      )

      project.materials.forEach((material) => {
        const existingMaterial = findMaterial.get(material.name)
        const materialId =
          existingMaterial?.m_id ||
          insertMaterial.run(material.name).lastInsertRowid

        insertProjectMaterial.run(
          projectId,
          materialId,
          material.amount,
          material.unit,
          material.note,
        )
      })

      project.steps.forEach((step, index) => {
        insertStep.run(projectId, index + 1, step)
      })

      return projectId
    })

    const projectId = createProject()
    const createdProject = getProjectRow(projectId)

    return res.status(201).json({
      data: mapProject(createdProject, true),
    })
  } catch (error) {
    deleteUploadedFile(req.file)
    return next(error)
  }
})

router.get('/mine', requireAuth, (req, res) => {
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
    .all(req.session.userId)

  res.json({
    data: rows.map((row) => mapProject(row)),
  })
})

router.put('/:id', requireAuth, uploadProjectImage, (req, res, next) => {
  const existingProject = db
    .prepare('SELECT p_id, p_u_id, p_image_url FROM projects WHERE p_id = ?')
    .get(req.params.id)

  if (!existingProject) {
    deleteUploadedFile(req.file)
    return res.status(404).json({
      message: 'Projekt wurde nicht gefunden.',
    })
  }

  if (existingProject.p_u_id !== req.session.userId) {
    deleteUploadedFile(req.file)
    return res.status(403).json({
      message: 'Du darfst dieses Projekt nicht bearbeiten.',
    })
  }

  const imageUrl = req.file
    ? `/images/projects/${req.file.filename}`
    : existingProject.p_image_url
  const validation = validateProjectPayload({
    ...req.body,
    imageUrl,
  })

  if (validation.error) {
    deleteUploadedFile(req.file)
    return sendValidationError(res, validation.error)
  }

  const project = validation.project
  const categoryExists = db
    .prepare('SELECT 1 FROM categories WHERE c_id = ?')
    .get(project.categoryId)
  const difficultyExists = db
    .prepare('SELECT 1 FROM difficulties WHERE d_id = ?')
    .get(project.difficultyId)

  if (!categoryExists) {
    deleteUploadedFile(req.file)
    return sendValidationError(res, 'Die ausgewaehlte Kategorie ist ungueltig.')
  }

  if (!difficultyExists) {
    deleteUploadedFile(req.file)
    return sendValidationError(
      res,
      'Die ausgewaehlte Schwierigkeit ist ungueltig.',
    )
  }

  try {
    const updateProject = db.transaction(() => {
      db.prepare(
        `
        UPDATE projects
        SET
          p_c_id = ?,
          p_d_id = ?,
          p_title = ?,
          p_slug = ?,
          p_summary = ?,
          p_description = ?,
          p_estimated_minutes = ?,
          p_image_url = ?,
          p_updated_at = CURRENT_TIMESTAMP
        WHERE p_id = ?
        `,
      ).run(
        project.categoryId,
        project.difficultyId,
        project.title,
        createUniqueSlug(project.title, existingProject.p_id),
        project.summary,
        project.description,
        project.estimatedMinutes,
        project.imageUrl,
        existingProject.p_id,
      )

      db.prepare('DELETE FROM project_materials WHERE pm_p_id = ?').run(
        existingProject.p_id,
      )
      db.prepare('DELETE FROM project_steps WHERE ps_p_id = ?').run(
        existingProject.p_id,
      )

      const findMaterial = db.prepare(
        'SELECT m_id FROM materials WHERE LOWER(m_name) = LOWER(?)',
      )
      const insertMaterial = db.prepare(
        'INSERT INTO materials (m_name) VALUES (?)',
      )
      const insertProjectMaterial = db.prepare(
        `
        INSERT INTO project_materials (
          pm_p_id,
          pm_m_id,
          pm_amount,
          pm_unit,
          pm_note
        )
        VALUES (?, ?, ?, ?, ?)
        `,
      )
      const insertStep = db.prepare(
        `
        INSERT INTO project_steps (ps_p_id, ps_step_number, ps_text)
        VALUES (?, ?, ?)
        `,
      )

      project.materials.forEach((material) => {
        const existingMaterial = findMaterial.get(material.name)
        const materialId =
          existingMaterial?.m_id ||
          insertMaterial.run(material.name).lastInsertRowid

        insertProjectMaterial.run(
          existingProject.p_id,
          materialId,
          material.amount,
          material.unit,
          material.note,
        )
      })

      project.steps.forEach((step, index) => {
        insertStep.run(existingProject.p_id, index + 1, step)
      })
    })

    updateProject()

    return res.json({
      data: mapProject(getProjectRow(existingProject.p_id), true),
    })
  } catch (error) {
    deleteUploadedFile(req.file)
    return next(error)
  }
})

router.delete('/:id', requireAuth, (req, res, next) => {
  const existingProject = db
    .prepare('SELECT p_id, p_u_id, p_image_url FROM projects WHERE p_id = ?')
    .get(req.params.id)

  if (!existingProject) {
    return res.status(404).json({
      message: 'Projekt wurde nicht gefunden.',
    })
  }

  if (existingProject.p_u_id !== req.session.userId) {
    return res.status(403).json({
      message: 'Loeschen nicht erlaubt.',
    })
  }

  try {
    const deleteProject = db.transaction(() => {
      db.prepare('DELETE FROM projects WHERE p_id = ?').run(
        existingProject.p_id,
      )
    })

    deleteProject()
    deleteProjectImage(existingProject.p_image_url)

    return res.json({
      message: 'Projekt wurde geloescht.',
      data: {
        id: existingProject.p_id,
      },
    })
  } catch (error) {
    return next(error)
  }
})

router.get('/:id', (req, res, next) => {
  const row = getProjectRow(req.params.id)

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
