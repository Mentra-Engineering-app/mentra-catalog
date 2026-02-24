import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'

const accountName = process.env.AZURE_STORAGE_ACCOUNT
const accountKey = process.env.AZURE_STORAGE_KEY
const containerName = process.env.AZURE_STORAGE_CONTAINER || 'catalog-files'

let blobServiceClient = null
let containerClient = null

function getContainerClient() {
  if (!containerClient) {
    if (!accountName || !accountKey) {
      throw new Error('Azure Storage credentials not configured')
    }
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey)
    blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    )
    containerClient = blobServiceClient.getContainerClient(containerName)
  }
  return containerClient
}

/**
 * Upload a file to Azure Blob Storage
 * @param {string} blobName - The name/path for the blob (e.g., "lesson-id/filename.mp4")
 * @param {Buffer|Blob|ArrayBuffer} data - The file data
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<{url: string, storagePath: string}>}
 */
export async function uploadFile(blobName, data, contentType) {
  const container = getContainerClient()
  const blockBlobClient = container.getBlockBlobClient(blobName)

  await blockBlobClient.upload(data, data.length || data.byteLength || data.size, {
    blobHTTPHeaders: { blobContentType: contentType }
  })

  return {
    url: blockBlobClient.url,
    storagePath: blobName
  }
}

/**
 * Upload a file from a stream/buffer with automatic content type detection
 * @param {string} folder - Folder path (e.g., lesson ID or course ID)
 * @param {string} filename - Original filename
 * @param {Buffer} buffer - File buffer
 * @param {string} contentType - MIME type
 * @returns {Promise<{url: string, storagePath: string, filename: string, size: number, type: string}>}
 */
export async function uploadFileWithMetadata(folder, filename, buffer, contentType) {
  const timestamp = Date.now()
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const blobName = `${folder}/${timestamp}_${safeName}`

  const { url, storagePath } = await uploadFile(blobName, buffer, contentType)

  return {
    url,
    storagePath,
    filename,
    size: buffer.length || buffer.byteLength,
    type: contentType,
    uploadedAt: new Date().toISOString()
  }
}

/**
 * Delete a file from Azure Blob Storage
 * @param {string} blobName - The blob name/path to delete
 */
export async function deleteFile(blobName) {
  const container = getContainerClient()
  const blockBlobClient = container.getBlockBlobClient(blobName)
  await blockBlobClient.deleteIfExists()
}

/**
 * Delete multiple files
 * @param {string[]} blobNames - Array of blob names to delete
 */
export async function deleteFiles(blobNames) {
  await Promise.all(blobNames.map(name => deleteFile(name)))
}

/**
 * Get the public URL for a blob
 * @param {string} blobName - The blob name/path
 * @returns {string} The public URL
 */
export function getBlobUrl(blobName) {
  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`
}

/**
 * Check if a blob exists
 * @param {string} blobName - The blob name/path
 * @returns {Promise<boolean>}
 */
export async function blobExists(blobName) {
  const container = getContainerClient()
  const blockBlobClient = container.getBlockBlobClient(blobName)
  return blockBlobClient.exists()
}

/**
 * List all blobs in a folder
 * @param {string} prefix - The folder prefix
 * @returns {Promise<string[]>} Array of blob names
 */
export async function listBlobs(prefix) {
  const container = getContainerClient()
  const blobs = []

  for await (const blob of container.listBlobsFlat({ prefix })) {
    blobs.push(blob.name)
  }

  return blobs
}

export default {
  uploadFile,
  uploadFileWithMetadata,
  deleteFile,
  deleteFiles,
  getBlobUrl,
  blobExists,
  listBlobs
}
