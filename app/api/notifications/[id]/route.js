import { markNotificationRead, deleteNotification } from '@/lib/db'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const notification = await markNotificationRead(id)
    return Response.json(notification)
  } catch (error) {
    console.error('Error updating notification:', error)
    return Response.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await deleteNotification(id)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return Response.json({ error: 'Failed to delete notification' }, { status: 500 })
  }
}
