const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

const dbPath = path.join(__dirname, '..', 'data', 'upcyclehub.db')
const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql')
const seedPath = path.join(__dirname, '..', 'sql', 'seed.sql')

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const db = new Database(dbPath)
db.pragma('foreign_keys = ON')

const schema = fs.readFileSync(schemaPath, 'utf8')
const seed = fs.readFileSync(seedPath, 'utf8')

db.exec(schema)
db.exec(seed)
db.close()

console.log('Datenbank wurde erstellt und mit Beispieldaten gefuellt.')
