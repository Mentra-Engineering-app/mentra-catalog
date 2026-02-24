import { deleteCreator } from '@/lib/db'

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await deleteCreator(id)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting creator:', error)
    return Response.json({ error: 'Failed to delete creator' }, { status: 500 })
  }
}
