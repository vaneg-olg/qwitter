/**
 * File Upload Service
 * Handles uploading files to Firebase Storage
 */

import { storage } from 'src/boot/firebase'

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - The path in storage where the file should be saved (e.g., 'qweets/files')
 * @returns {Promise<{url: string, path: string}>} - Returns object with download URL and storage path
 */
export async function uploadFile(file, path = 'qweets/files') {
  try {
    // Create a unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}_${file.name}`
    const fullPath = `${path}/${filename}`

    // Create a reference to the file location
    const fileRef = storage.ref(fullPath)

    // Upload the file
    const snapshot = await fileRef.put(file)

    // Get the download URL
    const downloadURL = await snapshot.ref.getDownloadURL()

    return {
      url: downloadURL,
      path: fullPath,
      filename: filename,
      size: file.size,
      type: file.type
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

/**
 * Delete a file from Firebase Storage
 * @param {string} path - The full path to the file in storage
 * @returns {Promise<void>}
 */
export async function deleteFile(path) {
  try {
    const fileRef = storage.ref(path)
    await fileRef.delete()
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

/**
 * Get file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate file for upload
 * @param {File} file - The file to validate
 * @param {object} options - Validation options
 * @returns {object} - Validation result { isValid: boolean, error?: string }
 */
export function validateFile(file, options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
  } = options

  if (!file) {
    return { isValid: false, error: 'No file selected' }
  }

  if (file.size > maxSize) {
    return { isValid: false, error: `File size exceeds ${formatFileSize(maxSize)} limit` }
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' }
  }

  return { isValid: true }
}
