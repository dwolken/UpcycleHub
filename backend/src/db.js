const path = require('path')
const Database = require('better-sqlite3')
const { normalizeSearchText } = require('./utils/search')

const dbPath = path.join(__dirname, '..', 'data', 'upcyclehub.db')
const db = new Database(dbPath)

db.pragma('foreign_keys = ON')

db.function('search_normalize', { deterministic: true }, normalizeSearchText)
db.normalizeSearchText = normalizeSearchText

module.exports = db
