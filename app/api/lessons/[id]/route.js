import { updateLesson, deleteLesson } from '@/lib/db'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()

    const lesson = await updateLesson(id, body)
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
