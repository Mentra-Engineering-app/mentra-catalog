import { getCompanies, createCompany } from '@/lib/db'

export async function GET() {
  try {
    const companies = await getCompanies()
    return Response.json(companies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return Response.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, is_evergreen } = body

    if (!name?.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }

    const company = await createCompany({ name: name.trim(), is_evergreen })
    return Response.json(company)
  } catch (error) {
    console.error('Error creating company:', error)
    return Response.json({ error: 'Failed to create company' }, { status: 500 })
  }
}
