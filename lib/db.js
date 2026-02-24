import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
})

// Helper to execute queries
export async function query(text, params) {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  if (process.env.NODE_ENV === 'development') {
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount })
  }
  return res
}

// Get a client from the pool for transactions
export async function getClient() {
  return pool.connect()
}

// Companies
export async function getCompanies() {
  const res = await query('SELECT * FROM companies ORDER BY created_at')
  return res.rows
}

export async function createCompany({ name, is_evergreen = false }) {
  const res = await query(
    'INSERT INTO companies (name, is_evergreen) VALUES ($1, $2) RETURNING *',
    [name, is_evergreen]
  )
  return res.rows[0]
}

export async function updateCompany(id, { name }) {
  const res = await query(
    'UPDATE companies SET name = $1 WHERE id = $2 RETURNING *',
    [name, id]
  )
  return res.rows[0]
}

export async function deleteCompany(id) {
  await query('DELETE FROM companies WHERE id = $1', [id])
}

// Departments
export async function getDepartments(companyId = null) {
  if (companyId) {
    const res = await query(
      'SELECT * FROM departments WHERE company_id = $1 ORDER BY created_at',
      [companyId]
    )
    return res.rows
  }
  const res = await query('SELECT * FROM departments ORDER BY created_at')
  return res.rows
}

export async function createDepartment({ name, company_id }) {
  const res = await query(
    'INSERT INTO departments (name, company_id) VALUES ($1, $2) RETURNING *',
    [name, company_id]
  )
  return res.rows[0]
}

export async function updateDepartment(id, { name }) {
  const res = await query(
    'UPDATE departments SET name = $1 WHERE id = $2 RETURNING *',
    [name, id]
  )
  return res.rows[0]
}

export async function deleteDepartment(id) {
  await query('DELETE FROM departments WHERE id = $1', [id])
}

// Courses
export async function getCourses(departmentId = null) {
  if (departmentId) {
    const res = await query(
      'SELECT * FROM courses WHERE department_id = $1 ORDER BY created_at',
      [departmentId]
    )
    return res.rows
  }
  const res = await query('SELECT * FROM courses ORDER BY created_at')
  return res.rows
}

export async function createCourse({ name, department_id }) {
  const res = await query(
    'INSERT INTO courses (name, department_id) VALUES ($1, $2) RETURNING *',
    [name, department_id]
  )
  return res.rows[0]
}

export async function updateCourse(id, updates) {
  const fields = []
  const values = []
  let paramIndex = 1

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex++}`)
    values.push(updates.name)
  }
  if (updates.course_files !== undefined) {
    fields.push(`course_files = $${paramIndex++}`)
    values.push(JSON.stringify(updates.course_files))
  }

  if (fields.length === 0) return null

  values.push(id)
  const res = await query(
    `UPDATE courses SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  )
  return res.rows[0]
}

export async function deleteCourse(id) {
  await query('DELETE FROM courses WHERE id = $1', [id])
}

// Team Members
export async function getTeamMembers() {
  const res = await query('SELECT * FROM team_members ORDER BY created_at')
  return res.rows
}

export async function createTeamMember({ name, email }) {
  const res = await query(
    'INSERT INTO team_members (name, email) VALUES ($1, $2) RETURNING *',
    [name, email || null]
  )
  return res.rows[0]
}

export async function deleteTeamMember(id) {
  await query('DELETE FROM team_members WHERE id = $1', [id])
}

// Creators
export async function getCreators() {
  const res = await query('SELECT * FROM creators ORDER BY created_at')
  return res.rows
}

export async function createCreator({ name, email }) {
  const res = await query(
    'INSERT INTO creators (name, email) VALUES ($1, $2) RETURNING *',
    [name, email || null]
  )
  return res.rows[0]
}

export async function deleteCreator(id) {
  await query('DELETE FROM creators WHERE id = $1', [id])
}

// Lessons
export async function getLessons(courseId = null) {
  if (courseId) {
    const res = await query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY created_at',
      [courseId]
    )
    return res.rows
  }
  const res = await query('SELECT * FROM lessons ORDER BY created_at')
  return res.rows
}

export async function createLesson({ title, course_id, assigned_to, created_by }) {
  const res = await query(
    `INSERT INTO lessons (title, course_id, assigned_to, created_by, script_status, video_status, has_question)
     VALUES ($1, $2, $3, $4, 'Not Started', 'Not Started', false) RETURNING *`,
    [title, course_id, assigned_to || null, created_by || null]
  )
  return res.rows[0]
}

export async function updateLesson(id, updates) {
  const fields = []
  const values = []
  let paramIndex = 1

  const allowedFields = [
    'title', 'script_status', 'video_status', 'script_content', 'video_url',
    'assigned_to', 'created_by', 'date_assigned', 'due_date', 'date_completed',
    'has_question', 'question_note', 'approved'
  ]
  const jsonFields = ['quiz_content', 'lesson_files', 'review_data']

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      fields.push(`${field} = $${paramIndex++}`)
      values.push(updates[field])
    }
  }

  for (const field of jsonFields) {
    if (updates[field] !== undefined) {
      fields.push(`${field} = $${paramIndex++}`)
      values.push(JSON.stringify(updates[field]))
    }
  }

  if (fields.length === 0) return null

  values.push(id)
  const res = await query(
    `UPDATE lessons SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  )
  return res.rows[0]
}

export async function deleteLesson(id) {
  await query('DELETE FROM lessons WHERE id = $1', [id])
}

// Notifications
export async function getNotifications(limit = 50) {
  const res = await query(
    'SELECT * FROM notifications ORDER BY created_at DESC LIMIT $1',
    [limit]
  )
  return res.rows
}

export async function createNotification({ team_member_id, message }) {
  const res = await query(
    'INSERT INTO notifications (team_member_id, message) VALUES ($1, $2) RETURNING *',
    [team_member_id || null, message]
  )
  return res.rows[0]
}

export async function markNotificationRead(id) {
  const res = await query(
    'UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *',
    [id]
  )
  return res.rows[0]
}

export async function deleteNotification(id) {
  await query('DELETE FROM notifications WHERE id = $1', [id])
}

export default pool
