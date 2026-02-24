import { getCourses, createCourse } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('department_id')

    const courses = await getCourses(departmentId)
    return Response.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return Response.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, department_id } = body

    if (!name?.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!department_id) {
      return Response.json({ error: 'Department ID is required' }, { status: 400 })
    }

    const course = await createCourse({ name: name.trim(), department_id })
    return Response.json(course)
  } catch (error) {
    console.error('Error creating course:', error)
    return Response.json({ error: 'Failed to create course' }, { status: 500 })
  }
}
