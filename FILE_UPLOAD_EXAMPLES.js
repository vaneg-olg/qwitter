/**
 * File Upload Usage Examples
 * 
 * This file demonstrates various ways to use the file upload functionality
 * in the Qwitter application.
 */

// ============================================================================
// EXAMPLE 1: Using the File Upload Service Directly
// ============================================================================

import { uploadFile, deleteFile, validateFile, formatFileSize } from 'src/services/fileUploadService'

export async function example1_DirectServiceUsage() {
  try {
    // Get file from user
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.onchange = async (e) => {
      const file = e.target.files[0]

      // Validate file
      const validation = validateFile(file)
      if (!validation.isValid) {
        console.error(validation.error)
        return
      }

      // Upload file
      const uploadedData = await uploadFile(file, 'my-custom-path')

      console.log('File uploaded successfully!')
      console.log('Download URL:', uploadedData.url)
      console.log('File path:', uploadedData.path)
      console.log('File size:', formatFileSize(uploadedData.size))

      // Store uploadedData in Firestore
      // db.collection('items').add({
      //   name: 'My Item',
      //   file: uploadedData
      // })
    }
    fileInput.click()
  } catch (error) {
    console.error('Upload failed:', error)
  }
}

// ============================================================================
// EXAMPLE 2: Using the FileUploadWidget Component
// ============================================================================

// In your Vue component:
// <template>
//   <div>
//     <FileUploadWidget
//       ref="uploader"
//       @file-selected="onFileSelected"
//       @error="onUploadError"
//       color="primary"
//       icon="add_photo_alternate"
//       label="Upload Photo"
//       accept="image/*"
//     />
//
//     <q-btn
//       @click="submitForm"
//       label="Submit"
//       color="primary"
//     />
//   </div>
// </template>

import FileUploadWidget from 'src/components/FileUploadWidget.vue'

export const example2VueComponentUsage = {
  components: { FileUploadWidget },
  data() {
    return {
      uploadedFile: null
    }
  },
  methods: {
    onFileSelected(file) {
      this.uploadedFile = file
      console.log('File selected:', file.name)
    },
    onUploadError(errorMessage) {
      this.$q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top'
      })
    },
    async submitForm() {
      if (!this.uploadedFile) {
        console.log('No file selected')
        return
      }

      try {
        const uploadedData = await uploadFile(this.uploadedFile)
        console.log('Upload successful:', uploadedData)

        // Clear the uploader
        this.$refs.uploader.clearFile()
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }
  }
}

// ============================================================================
// EXAMPLE 3: Multiple File Uploads with Batch Processing
// ============================================================================

export async function example3_BatchFileUpload(files) {
  const uploadPromises = files.map(file => uploadFile(file, 'batch-uploads'))

  try {
    const results = await Promise.all(uploadPromises)
    console.log('All files uploaded successfully:', results)
    return results
  } catch (error) {
    console.error('Some files failed to upload:', error)
    throw error
  }
}

// ============================================================================
// EXAMPLE 4: Validation with Custom Options
// ============================================================================

export function example4_CustomValidation() {
  const customValidationOptions = {
    maxSize: 5 * 1024 * 1024, // 5MB limit
    allowedTypes: ['image/jpeg', 'image/png'] // Only JPEG and PNG
  }

  const file = new File(['test'], 'test.txt', { type: 'text/plain' })

  const validation = validateFile(file, customValidationOptions)

  if (!validation.isValid) {
    console.log('Validation failed:', validation.error)
    // Output: "File type not allowed"
  }
}

// ============================================================================
// EXAMPLE 5: Conditional File Upload in Vue Component
// ============================================================================

export const example5_ConditionalUpload = {
  data() {
    return {
      form: {
        title: '',
        description: '',
        file: null
      },
      isUploading: false
    }
  },
  methods: {
    async submitForm() {
      // Validate form
      if (!this.form.title || !this.form.description) {
        this.$q.notify({
          type: 'warning',
          message: 'Please fill in all required fields'
        })
        return
      }

      this.isUploading = true

      try {
        let fileData = null

        // Only upload file if one is selected
        if (this.form.file) {
          const validation = validateFile(this.form.file)
          if (!validation.isValid) {
            throw new Error(validation.error)
          }

          fileData = await uploadFile(this.form.file)
        }

        // Create database entry
        const dbEntry = {
          title: this.form.title,
          description: this.form.description,
          createdAt: Date.now(),
          file: fileData || null
        }

        // Save to Firestore
        // await db.collection('items').add(dbEntry)

        this.$q.notify({
          type: 'positive',
          message: 'Item created successfully!'
        })

        // Reset form
        this.form = { title: '', description: '', file: null }
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Failed to create item'
        })
      } finally {
        this.isUploading = false
      }
    }
  }
}

// ============================================================================
// EXAMPLE 6: File Deletion and Cleanup
// ============================================================================

export async function example6_DeleteFile(qweet) {
  try {
    if (qweet.file) {
      // Delete file from storage
      await deleteFile(qweet.file.path)
      console.log('File deleted from storage')
    }

    // Delete qweet from Firestore
    // await db.collection('qweets').doc(qweet.id).delete()
    console.log('Qweet deleted from database')
  } catch (error) {
    console.error('Error deleting qweet:', error)
  }
}

// ============================================================================
// EXAMPLE 7: File Size Formatting
// ============================================================================

export function example7_FileSizeFormatting() {
  console.log(formatFileSize(0)) // "0 Bytes"
  console.log(formatFileSize(512)) // "512 Bytes"
  console.log(formatFileSize(1024)) // "1 KB"
  console.log(formatFileSize(1024 * 1024)) // "1 MB"
  console.log(formatFileSize(1024 * 1024 * 1024)) // "1 GB"
  console.log(formatFileSize(2621440)) // "2.5 MB"
}

// ============================================================================
// EXAMPLE 8: Image Upload with Preview
// ============================================================================

export const example8_ImageUploadPreview = {
  data() {
    return {
      imageFile: null,
      imagePreview: null
    }
  },
  methods: {
    onImageSelected(file) {
      this.imageFile = file

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        this.imagePreview = e.target.result
      }
      reader.readAsDataURL(file)
    },
    async uploadImage() {
      if (!this.imageFile) return

      try {
        const uploadedData = await uploadFile(
          this.imageFile,
          'user-profiles'
        )

        // Update user profile with image URL
        // await updateUserProfile({
        //   photoURL: uploadedData.url
        // })

        this.$q.notify({
          type: 'positive',
          message: 'Image uploaded successfully!'
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to upload image'
        })
      }
    }
  }
}

// ============================================================================
// EXAMPLE 9: Drag and Drop File Upload (Future Enhancement)
// ============================================================================

export const example9_DragDropSetup = {
  methods: {
    setupDragDrop() {
      const dropZone = this.$refs.dropZone

      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault()
        dropZone.classList.add('drag-over')
      })

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over')
      })

      dropZone.addEventListener('drop', async (e) => {
        e.preventDefault()
        dropZone.classList.remove('drag-over')

        const files = e.dataTransfer.files
        for (let file of files) {
          await this.handleFileUpload(file)
        }
      })
    },
    async handleFileUpload(file) {
      const validation = validateFile(file)
      if (!validation.isValid) {
        console.error(validation.error)
        return
      }

      try {
        const uploadedData = await uploadFile(file)
        console.log('File uploaded:', uploadedData)
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }
  }
}

// ============================================================================
// EXAMPLE 10: File Upload with Progress Tracking (Future Enhancement)
// ============================================================================

export async function example10_UploadWithProgress(file, onProgress) {
  try {
    const { storage } = require('src/boot/firebase')
    const fileRef = storage.ref(`uploads/${Date.now()}_${file.name}`)

    // Create upload task
    const uploadTask = fileRef.put(file)

    // Track progress
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        console.log(`Upload progress: ${progress}%`)
        if (onProgress) {
          onProgress(progress)
        }
      },
      (error) => {
        console.error('Upload error:', error)
      },
      async () => {
        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL()
        console.log('Upload complete! URL:', downloadURL)
      }
    )
  } catch (error) {
    console.error('Setup failed:', error)
  }
}
