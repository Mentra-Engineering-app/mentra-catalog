import { getLessons, createLesson } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('course_id')

    const lessons = await getLessons(courseId)
    return Response.json(lessons)
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return Response.json({ error: 'Failed to fetch lessons' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { title, course_id, assigned_to, created_by } = body

    if (!title?.trim()) {
      return Response.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!course_id) {
      return Response.json({ error: 'Course ID is required' }, { status: 400 })
    }

    const lesson = await createLesson({
      title: title.trim(),
      course_id,
      assigned_to,
      created_by
    })
    return Response.json(lesson)
  } catch (error) {
    console.error('Error creating lesson:', error)
    return Response.json({ error: 'Failed to create lesson' }, { status: 500 })
  }
}
