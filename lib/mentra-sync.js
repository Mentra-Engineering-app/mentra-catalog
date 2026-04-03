/**
 * BFF sync service — pushes approved Catalog lessons to Mentra's Django API
 * and pulls Mentra organizations into the Catalog companies table.
 */
import {
  createSyncLog,
  updateSyncLog,
  getSyncLogForLesson,
  getUnsyncedApprovedLessons,
  getCompanyByMentraOrgId,
  updateCompanyMentraOrgId,
  createCompany,
  getCompanies,
} from './db.js'

const MENTRA_API_URL = process.env.MENTRA_API_URL || 'http://localhost:8000/api/v1'
const CATALOG_API_KEY = process.env.CATALOG_API_KEY || ''

function headers() {
  return {
    'Content-Type': 'application/json',
    'X-Catalog-Api-Key': CATALOG_API_KEY,
  }
}

/**
 * Push a single lesson to Mentra's ingest endpoint.
 * Returns { success: boolean, data?, error? }
 */
export async function pushLessonToMentra(lesson) {
  // Ensure the company is linked to a Mentra org
  if (!lesson.mentra_org_id) {
    return {
      success: false,
      error: 'Company not linked to a Mentra Organization. Sync organizations first.',
    }
  }

  const syncLog = await createSyncLog(lesson.id)

  try {
    const payload = {
      catalog_lesson_id: lesson.id,
      catalog_course_id: lesson.course_id,
      catalog_course_name: lesson.course_name,
      catalog_department_name: lesson.department_name,
      catalog_company_name: lesson.company_name,
      title: lesson.title,
      content: lesson.script_content || '',
      video_url: lesson.video_url || null,
      quiz_content: lesson.quiz_content || [],
      creator_name: lesson.creator_name || '',
      status: 'draft',
      mentra_org_id: lesson.mentra_org_id,
    }

    const response = await fetch(`${MENTRA_API_URL}/catalog/ingest/lesson/`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (response.ok) {
      await updateSyncLog(syncLog.id, {
        sync_status: 'synced',
        mentra_microtraining_id: data.id,
        error_message: null,
      })
      return { success: true, data }
    } else {
      const errorMsg = JSON.stringify(data)
      await updateSyncLog(syncLog.id, {
        sync_status: 'failed',
        error_message: errorMsg,
      })
      return { success: false, error: errorMsg }
    }
  } catch (err) {
    await updateSyncLog(syncLog.id, {
      sync_status: 'failed',
      error_message: err.message,
    })
    return { success: false, error: err.message }
  }
}

/**
 * Sync all unsynced approved lessons to Mentra.
 * Returns { synced: number, failed: number, errors: array }
 */
export async function syncAllApprovedLessons() {
  const lessons = await getUnsyncedApprovedLessons()
  const results = { synced: 0, failed: 0, errors: [] }

  for (const lesson of lessons) {
    const result = await pushLessonToMentra(lesson)
    if (result.success) {
      results.synced++
    } else {
      results.failed++
      results.errors.push({ lesson_id: lesson.id, title: lesson.title, error: result.error })
    }
  }

  return results
}

/**
 * Pull Mentra organizations and sync to Catalog companies table.
 * Returns { created: number, updated: number, total: number }
 */
export async function pullOrganizations() {
  const response = await fetch(`${MENTRA_API_URL}/catalog/organizations/`, {
    method: 'GET',
    headers: headers(),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch organizations: ${response.status}`)
  }

  const orgs = await response.json()
  const companies = await getCompanies()
  const stats = { created: 0, updated: 0, total: orgs.length }

  for (const org of orgs) {
    // Check if a company already tracks this mentra org
    const existing = await getCompanyByMentraOrgId(org.id)

    if (existing) {
      // Update name if changed
      if (existing.name !== org.name) {
        const { query } = await import('./db.js')
        await query('UPDATE companies SET name = $1 WHERE id = $2', [org.name, existing.id])
        stats.updated++
      }
    } else {
      // Check if a company with the same name exists but isn't linked
      const nameMatch = companies.find(
        (c) => c.name.toLowerCase() === org.name.toLowerCase() && !c.mentra_org_id
      )

      if (nameMatch) {
        await updateCompanyMentraOrgId(nameMatch.id, org.id)
        stats.updated++
      } else {
        const newCompany = await createCompany({ name: org.name })
        await updateCompanyMentraOrgId(newCompany.id, org.id)
        stats.created++
      }
    }
  }

  return stats
}
