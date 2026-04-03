import { pushLessonToMentra } from '@/lib/mentra-sync'
import { query } from '@/lib/db'

export async function POST(request, { params }) {
  try {
    const { id } = await params

    // Fetch the full lesson with joins
    const res = await query(`
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

    if (res.rows.length === 0) {
      return Response.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const lesson = res.rows[0]

    if (!lesson.approved) {
      return Response.json({ error: 'Lesson is not approved' }, { status: 400 })
    }

    const result = await pushLessonToMentra(lesson)

    if (result.success) {
      return Response.json(result.data)
    } else {
      return Response.json({ error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error('Error syncing lesson:', error)
    return Response.json({ error: 'Failed to sync lesson' }, { status: 500 })
  }
}
