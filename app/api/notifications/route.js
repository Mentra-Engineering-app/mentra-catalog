import { getNotifications, createNotification } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const notifications = await getNotifications(limit)
    return Response.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return Response.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { team_member_id, message } = body

    if (!message?.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    const notification = await createNotification({
      team_member_id,
      message: message.trim()
    })
    return Response.json(notification)
  } catch (error) {
    console.error('Error creating notification:', error)
    return Response.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}
