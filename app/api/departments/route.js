import { getDepartments, createDepartment } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')

    const departments = await getDepartments(companyId)
    return Response.json(departments)
  } catch (error) {
    console.error('Error fetching departments:', error)
    return Response.json({ error: 'Failed to fetch departments' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, company_id } = body

    if (!name?.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!company_id) {
      return Response.json({ error: 'Company ID is required' }, { status: 400 })
    }

    const department = await createDepartment({ name: name.trim(), company_id })
    return Response.json(department)
  } catch (error) {
    console.error('Error creating department:', error)
    return Response.json({ error: 'Failed to create department' }, { status: 500 })
  }
}
