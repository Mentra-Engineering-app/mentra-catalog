import { getTeamMembers, createTeamMember } from '@/lib/db'

export async function GET() {
  try {
    const teamMembers = await getTeamMembers()
    return Response.json(teamMembers)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return Response.json({ error: 'Failed to fetch team members' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email } = body

    if (!name?.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }

    const teamMember = await createTeamMember({ name: name.trim(), email })
    return Response.json(teamMember)
  } catch (error) {
    console.error('Error creating team member:', error)
    return Response.json({ error: 'Failed to create team member' }, { status: 500 })
  }
}
