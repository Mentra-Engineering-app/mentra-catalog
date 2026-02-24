import { updateCourse, deleteCourse } from '@/lib/db'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()

    const course = await updateCourse(id, body)
    return Response.json(course)
  } catch (error) {
    console.error('Error updating course:', error)
    return Response.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await deleteCourse(id)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting course:', error)
    return Response.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}
