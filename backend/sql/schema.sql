PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS project_steps;
DROP TABLE IF EXISTS project_materials;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS materials;
DROP TABLE IF EXISTS difficulties;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  u_id INTEGER PRIMARY KEY AUTOINCREMENT,
  u_username TEXT NOT NULL UNIQUE,
  u_password_hash TEXT NOT NULL,
  u_created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  c_id INTEGER PRIMARY KEY AUTOINCREMENT,
  c_name TEXT NOT NULL UNIQUE
);

CREATE TABLE difficulties (
  d_id INTEGER PRIMARY KEY AUTOINCREMENT,
  d_name TEXT NOT NULL UNIQUE
);

CREATE TABLE projects (
  p_id INTEGER PRIMARY KEY AUTOINCREMENT,
  p_u_id INTEGER NOT NULL,
  p_c_id INTEGER NOT NULL,
  p_d_id INTEGER NOT NULL,
  p_title TEXT NOT NULL,
  p_slug TEXT NOT NULL UNIQUE,
  p_summary TEXT NOT NULL,
  p_description TEXT NOT NULL,
  p_estimated_minutes INTEGER NOT NULL,
  p_image_url TEXT,
  p_created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  p_updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (p_u_id) REFERENCES users (u_id),
  FOREIGN KEY (p_c_id) REFERENCES categories (c_id),
  FOREIGN KEY (p_d_id) REFERENCES difficulties (d_id)
);

CREATE TABLE materials (
  m_id INTEGER PRIMARY KEY AUTOINCREMENT,
  m_name TEXT NOT NULL UNIQUE
);

CREATE TABLE project_materials (
  pm_id INTEGER PRIMARY KEY AUTOINCREMENT,
  pm_p_id INTEGER NOT NULL,
  pm_m_id INTEGER NOT NULL,
  FOREIGN KEY (pm_p_id) REFERENCES projects (p_id) ON DELETE CASCADE,
  FOREIGN KEY (pm_m_id) REFERENCES materials (m_id),
  UNIQUE (pm_p_id, pm_m_id)
);

CREATE TABLE project_steps (
  ps_id INTEGER PRIMARY KEY AUTOINCREMENT,
  ps_p_id INTEGER NOT NULL,
  ps_step_number INTEGER NOT NULL,
  ps_text TEXT NOT NULL,
  FOREIGN KEY (ps_p_id) REFERENCES projects (p_id) ON DELETE CASCADE,
  UNIQUE (ps_p_id, ps_step_number)
);
