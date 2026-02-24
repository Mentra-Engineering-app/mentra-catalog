import { deleteTeamMember } from '@/lib/db'

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await deleteTeamMember(id)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return Response.json({ error: 'Failed to delete team member' }, { status: 500 })
  }
}
