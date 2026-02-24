import { updateDepartment, deleteDepartment } from '@/lib/db'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name } = body

    if (!name?.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }

    const department = await updateDepartment(id, { name: name.trim() })
    return Response.json(department)
  } catch (error) {
    console.error('Error updating department:', error)
    return Response.json({ error: 'Failed to update department' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await deleteDepartment(id)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting department:', error)
    return Response.json({ error: 'Failed to delete department' }, { status: 500 })
  }
}
