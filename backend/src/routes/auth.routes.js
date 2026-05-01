const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('../db')

const router = express.Router()

function sendData(res, data, status = 200) {
  return res.status(status).json({ data })
}

function sendError(res, message, status) {
  return res.status(status).json({ message })
}

function mapUser(row) {
  return {
    id: row.u_id,
    username: row.u_username,
    createdAt: row.u_created_at,
  }
}

function validateUsername(username) {
  if (!username || username.length < 3 || username.length > 30) {
    return 'Der Benutzername muss zwischen 3 und 30 Zeichen lang sein.'
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Der Benutzername darf nur Buchstaben, Zahlen und Unterstriche enthalten.'
  }

  return ''
}

function validatePassword(password) {
  if (!password || password.length < 6) {
    return 'Das Passwort muss mindestens 6 Zeichen lang sein.'
  }

  return ''
}

function setLoggedInUser(req, userId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error)
        return
      }

      req.session.userId = userId
      resolve()
    })
  })
}

router.post('/register', async (req, res, next) => {
  try {
    const username = String(req.body?.username || '').trim()
    const password = String(req.body?.password || '')

    const usernameError = validateUsername(username)
    if (usernameError) {
      return sendError(res, usernameError, 400)
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      return sendError(res, passwordError, 400)
    }

    const existingUser = db
      .prepare('SELECT u_id FROM users WHERE LOWER(u_username) = LOWER(?)')
      .get(username)

    if (existingUser) {
      return sendError(res, 'Benutzername bereits vergeben.', 409)
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const result = db
      .prepare(
        `
        INSERT INTO users (u_username, u_password_hash)
        VALUES (?, ?)
        `,
      )
      .run(username, passwordHash)

    const user = db
      .prepare(
        `
        SELECT u_id, u_username, u_created_at
        FROM users
        WHERE u_id = ?
        `,
      )
      .get(result.lastInsertRowid)

    await setLoggedInUser(req, user.u_id)

    return sendData(res, mapUser(user), 201)
  } catch (error) {
    return next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const username = String(req.body?.username || '').trim()
    const password = String(req.body?.password || '')

    if (!username || !password) {
      return sendError(res, 'Benutzername und Passwort sind erforderlich.', 400)
    }

    const user = db
      .prepare(
        `
        SELECT u_id, u_username, u_password_hash, u_created_at
        FROM users
        WHERE LOWER(u_username) = LOWER(?)
        `,
      )
      .get(username)

    if (!user || !(await bcrypt.compare(password, user.u_password_hash))) {
      return sendError(res, 'Benutzername oder Passwort ist falsch.', 401)
    }

    await setLoggedInUser(req, user.u_id)

    return sendData(res, mapUser(user))
  } catch (error) {
    return next(error)
  }
})

router.post('/logout', (req, res, next) => {
  if (!req.session) {
    return sendData(res, null)
  }

  return req.session.destroy((error) => {
    if (error) {
      return next(error)
    }

    res.clearCookie('upcyclehub.sid')
    return sendData(res, null)
  })
})

router.get('/me', (req, res) => {
  if (!req.session?.userId) {
    return sendData(res, null)
  }

  const user = db
    .prepare(
      `
      SELECT u_id, u_username, u_created_at
      FROM users
      WHERE u_id = ?
      `,
    )
    .get(req.session.userId)

  if (!user) {
    req.session.userId = null
    return sendData(res, null)
  }

  return sendData(res, mapUser(user))
})

module.exports = router
