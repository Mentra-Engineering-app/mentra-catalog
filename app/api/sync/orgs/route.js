import { pullOrganizations } from '@/lib/mentra-sync'
import { getCompanies } from '@/lib/db'

export async function POST() {
  try {
    const stats = await pullOrganizations()
    return Response.json(stats)
  } catch (error) {
    console.error('Error pulling organizations:', error)
    return Response.json({ error: 'Failed to pull organizations' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const companies = await getCompanies()
    return Response.json({
      total: companies.length,
      linked: companies.filter((c) => c.mentra_org_id).length,
      unlinked: companies.filter((c) => !c.mentra_org_id).length,
      companies: companies.map((c) => ({
        id: c.id,
        name: c.name,
        mentra_org_id: c.mentra_org_id,
        linked: !!c.mentra_org_id,
      })),
    })
  } catch (error) {
    console.error('Error getting org sync status:', error)
    return Response.json({ error: 'Failed to get org sync status' }, { status: 500 })
  }
}
