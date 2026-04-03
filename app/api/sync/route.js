import { syncAllApprovedLessons } from '@/lib/mentra-sync'
import { getUnsyncedApprovedLessons } from '@/lib/db'

export async function POST() {
  try {
    const results = await syncAllApprovedLessons()
    return Response.json(results)
  } catch (error) {
    console.error('Error syncing lessons:', error)
    return Response.json({ error: 'Failed to sync lessons' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const unsynced = await getUnsyncedApprovedLessons()
    return Response.json({
      unsynced_count: unsynced.length,
      lessons: unsynced.map((l) => ({
        id: l.id,
        title: l.title,
        course_name: l.course_name,
        company_name: l.company_name,
        has_mentra_org: !!l.mentra_org_id,
      })),
    })
  } catch (error) {
    console.error('Error getting sync status:', error)
    return Response.json({ error: 'Failed to get sync status' }, { status: 500 })
  }
}
