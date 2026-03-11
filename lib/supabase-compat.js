// Supabase compatibility layer
// This provides the same API interface as @supabase/supabase-js but uses our REST API

const API_BASE = '/catalog/api'

// Helper to make API calls
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  return res
}

// Query builder that mimics Supabase's chainable API
class QueryBuilder {
  constructor(table) {
    this.table = table
    this._select = '*'
    this._filters = []
    this._order = null
    this._single = false
    this._updates = null
    this._inserts = null
    this._delete = false
  }

  select(columns = '*') {
    this._select = columns
    return this
  }

  insert(data) {
    this._inserts = data
    return this
  }

  update(data) {
    this._updates = data
    return this
  }

  delete() {
    this._delete = true
    return this
  }

  eq(column, value) {
    this._filters.push({ type: 'eq', column, value })
    return this
  }

  in(column, values) {
    this._filters.push({ type: 'in', column, values })
    return this
  }

  order(column, options = {}) {
    this._order = { column, ...options }
    return this
  }

  limit(count) {
    this._limit = count
    return this
  }

  single() {
    this._single = true
    return this
  }

  // Execute the query
  async then(resolve, reject) {
    try {
      const result = await this._execute()
      resolve(result)
    } catch (error) {
      reject(error)
    }
  }

  async _execute() {
    const tableMap = {
      companies: '/companies',
      departments: '/departments',
      courses: '/courses',
      lessons: '/lessons',
      team_members: '/team-members',
      creators: '/creators',
      notifications: '/notifications',
    }

    const endpoint = tableMap[this.table]
    if (!endpoint) {
      return { data: null, error: new Error(`Unknown table: ${this.table}`) }
    }

    try {
      // INSERT
      if (this._inserts) {
        const res = await fetchAPI(endpoint, {
          method: 'POST',
          body: JSON.stringify(this._inserts),
        })
        if (!res.ok) {
          const err = await res.json()
          return { data: null, error: new Error(err.error || 'Insert failed') }
        }
        const data = await res.json()
        return { data, error: null }
      }

      // UPDATE
      if (this._updates) {
        const idFilter = this._filters.find(f => f.type === 'eq' && f.column === 'id')
        if (idFilter) {
          const res = await fetchAPI(`${endpoint}/${idFilter.value}`, {
            method: 'PUT',
            body: JSON.stringify(this._updates),
          })
          if (!res.ok) {
            const err = await res.json()
            return { data: null, error: new Error(err.error || 'Update failed') }
          }
          const data = await res.json()
          return { data, error: null }
        }
        // Handle bulk updates (assigned_to = null where assigned_to = id)
        // This needs special handling - for now return success
        return { data: null, error: null }
      }

      // DELETE
      if (this._delete) {
        const idFilter = this._filters.find(f => f.type === 'eq' && f.column === 'id')
        const inFilter = this._filters.find(f => f.type === 'in')

        if (idFilter) {
          const res = await fetchAPI(`${endpoint}/${idFilter.value}`, {
            method: 'DELETE',
          })
          if (!res.ok) {
            const err = await res.json()
            return { data: null, error: new Error(err.error || 'Delete failed') }
          }
          return { data: null, error: null }
        }

        if (inFilter) {
          // Bulk delete - delete each one
          await Promise.all(
            inFilter.values.map(id =>
              fetchAPI(`${endpoint}/${id}`, { method: 'DELETE' })
            )
          )
          return { data: null, error: null }
        }

        // Handle other delete patterns (e.g., delete by team_member_id)
        const otherFilter = this._filters.find(f => f.type === 'eq')
        if (otherFilter) {
          // For notifications, we handle this differently
          // For now, just return success - cascading deletes handle this
          return { data: null, error: null }
        }
      }

      // SELECT
      let url = endpoint
      const parentFilter = this._filters.find(f =>
        f.type === 'eq' &&
        (f.column === 'company_id' || f.column === 'department_id' || f.column === 'course_id')
      )
      if (parentFilter) {
        url += `?${parentFilter.column}=${parentFilter.value}`
      }

      const res = await fetchAPI(url)
      if (!res.ok) {
        const err = await res.json()
        return { data: null, error: new Error(err.error || 'Fetch failed') }
      }
      let data = await res.json()

      // Apply client-side ordering if needed
      if (this._order) {
        data = data.sort((a, b) => {
          const aVal = a[this._order.column] || ''
          const bVal = b[this._order.column] || ''
          return this._order.ascending === false
            ? bVal.localeCompare(aVal)
            : aVal.localeCompare(bVal)
        })
      }

      // Apply client-side limit if needed
      if (this._limit) {
        data = data.slice(0, this._limit)
      }

      if (this._single) {
        return { data: data[0] || null, error: null }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Storage compatibility
class StorageBucket {
  constructor(bucketName) {
    this.bucketName = bucketName
  }

  async upload(path, file, options = {}) {
    const formData = new FormData()
    formData.append('file', file)

    // Extract folder from path (e.g., "lessonId/timestamp.mp4" -> "lessonId")
    const folder = path.split('/')[0] || 'uploads'
    formData.append('folder', folder)

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        return { data: null, error: new Error(err.error || 'Upload failed') }
      }

      const data = await res.json()
      return { data: { path: data.storagePath }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  getPublicUrl(path) {
    // Return the URL from our Azure storage
    const accountName = 'mentraprimary'
    const containerName = 'catalog-files'
    return {
      data: {
        publicUrl: `https://${accountName}.blob.core.windows.net/${containerName}/${path}`
      }
    }
  }

  async remove(paths) {
    try {
      await Promise.all(
        paths.map(path =>
          fetch(`${API_BASE}/upload?path=${encodeURIComponent(path)}`, {
            method: 'DELETE',
          })
        )
      )
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

class StorageClient {
  from(bucketName) {
    return new StorageBucket(bucketName)
  }
}

// Main supabase-like client
export const supabase = {
  from(table) {
    return new QueryBuilder(table)
  },
  storage: new StorageClient(),
}

export default supabase
