import { getCreators, createCreator } from '@/lib/db'

export async function GET() {
  try {
    const creators = await getCreators()
    return Response.json(creators)
  } catch (error) {
    console.error('Error fetching creators:', error)
    return Response.json({ error: 'Failed to fetch creators' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email } = body

    if (!name?.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }

    const creator = await createCreator({ name: name.trim(), email })
    return Response.json(creator)
  } catch (error) {
    console.error('Error creating creator:', error)
    return Response.json({ error: 'Failed to create creator' }, { status: 500 })
  }
}
