// Client-side API helper for mentra-catalog
// This replaces the Supabase client with fetch calls to our API routes

const API_BASE = '/catalog/api'

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }

  return res.json()
}

// Companies
export async function fetchCompanies() {
  return fetchAPI('/companies')
}

export async function createCompany(data) {
  return fetchAPI('/companies', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCompany(id, data) {
  return fetchAPI(`/companies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteCompany(id) {
  return fetchAPI(`/companies/${id}`, { method: 'DELETE' })
}

// Departments
export async function fetchDepartments(companyId = null) {
  const params = companyId ? `?company_id=${companyId}` : ''
  return fetchAPI(`/departments${params}`)
}

export async function createDepartment(data) {
  return fetchAPI('/departments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateDepartment(id, data) {
  return fetchAPI(`/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteDepartment(id) {
  return fetchAPI(`/departments/${id}`, { method: 'DELETE' })
}

// Courses
export async function fetchCourses(departmentId = null) {
  const params = departmentId ? `?department_id=${departmentId}` : ''
  return fetchAPI(`/courses${params}`)
}

export async function createCourse(data) {
  return fetchAPI('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCourse(id, data) {
  return fetchAPI(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteCourse(id) {
  return fetchAPI(`/courses/${id}`, { method: 'DELETE' })
}

// Lessons
export async function fetchLessons(courseId = null) {
  const params = courseId ? `?course_id=${courseId}` : ''
  return fetchAPI(`/lessons${params}`)
}

export async function createLesson(data) {
  return fetchAPI('/lessons', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateLesson(id, data) {
  return fetchAPI(`/lessons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteLesson(id) {
  return fetchAPI(`/lessons/${id}`, { method: 'DELETE' })
}

// Team Members
export async function fetchTeamMembers() {
  return fetchAPI('/team-members')
}

export async function createTeamMember(data) {
  return fetchAPI('/team-members', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deleteTeamMember(id) {
  return fetchAPI(`/team-members/${id}`, { method: 'DELETE' })
}

// Creators
export async function fetchCreators() {
  return fetchAPI('/creators')
}

export async function createCreator(data) {
  return fetchAPI('/creators', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deleteCreator(id) {
  return fetchAPI(`/creators/${id}`, { method: 'DELETE' })
}

// Notifications
export async function fetchNotifications(limit = 50) {
  return fetchAPI(`/notifications?limit=${limit}`)
}

export async function createNotification(data) {
  return fetchAPI('/notifications', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function markNotificationRead(id) {
  return fetchAPI(`/notifications/${id}`, { method: 'PUT' })
}

export async function deleteNotification(id) {
  return fetchAPI(`/notifications/${id}`, { method: 'DELETE' })
}

// File Upload
export async function uploadFile(file, folder, note = '') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)
  formData.append('note', note)

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(error.error || 'Upload failed')
  }

  return res.json()
}

export async function deleteFile(storagePath) {
  return fetchAPI(`/upload?path=${encodeURIComponent(storagePath)}`, {
    method: 'DELETE',
  })
}

// Send notification email (uses existing route)
export async function sendNotificationEmail(data) {
  return fetchAPI('/send-notification', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export default {
  // Companies
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  // Departments
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  // Courses
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  // Lessons
  fetchLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  // Team Members
  fetchTeamMembers,
  createTeamMember,
  deleteTeamMember,
  // Creators
  fetchCreators,
  createCreator,
  deleteCreator,
  // Notifications
  fetchNotifications,
  createNotification,
  markNotificationRead,
  deleteNotification,
  // Files
  uploadFile,
  deleteFile,
  // Email
  sendNotificationEmail,
}
