import { uploadFileWithMetadata, deleteFile } from '@/lib/storage'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const folder = formData.get('folder') || 'uploads'
    const note = formData.get('note') || ''

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadFileWithMetadata(
      folder,
      file.name,
      buffer,
      file.type
    )

    return Response.json({
      ...result,
      note
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return Response.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const storagePath = searchParams.get('path')

    if (!storagePath) {
      return Response.json({ error: 'Storage path is required' }, { status: 400 })
    }

    await deleteFile(storagePath)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return Response.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
