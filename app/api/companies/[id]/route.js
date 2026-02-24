import { updateCompany, deleteCompany } from '@/lib/db'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name } = body

    if (!name?.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }

    const company = await updateCompany(id, { name: name.trim() })
    return Response.json(company)
  } catch (error) {
    console.error('Error updating company:', error)
    return Response.json({ error: 'Failed to update company' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await deleteCompany(id)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting company:', error)
    return Response.json({ error: 'Failed to delete company' }, { status: 500 })
  }
}
