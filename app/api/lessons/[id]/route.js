import { updateLesson, deleteLesson, query } from '@/lib/db'
import { pushLessonToMentra } from '@/lib/mentra-sync'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if this update is approving the lesson
    const isApproving = body.approved === true

    const lesson = await updateLesson(id, body)

    // Auto-sync to Mentra when a lesson is approved
    if (isApproving && lesson) {
      try {
        const fullLesson = await query(`
          SELECT l.*, c.name as course_name, c.id as course_id,
                 d.name as department_name, d.id as department_id,
                 comp.name as company_name, comp.id as company_id, comp.mentra_org_id,
                 cr.name as creator_name
          FROM lessons l
          JOIN courses c ON l.course_id = c.id
          JOIN departments d ON c.department_id = d.id
          JOIN companies comp ON d.company_id = comp.id
          LEFT JOIN creators cr ON l.created_by = cr.id
          WHERE l.id = $1
        `, [id])

        if (fullLesson.rows.length > 0) {
          const syncResult = await pushLessonToMentra(fullLesson.rows[0])
          if (!syncResult.success) {
            console.warn(`Auto-sync failed for lesson ${id}:`, syncResult.error)
          }
        }
      } catch (syncError) {
        // Don't fail the update if sync fails — lesson is still approved locally
        console.error('Auto-sync error:', syncError)
      }
    }

    return Response.json(lesson)
  } catch (error) {
    console.error('Error updating lesson:', error)
    return Response.json({ error: 'Failed to update lesson' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await deleteLesson(id)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return Response.json({ error: 'Failed to delete lesson' }, { status: 500 })
  }
}
