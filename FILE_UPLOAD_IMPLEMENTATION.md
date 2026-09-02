# File Upload Feature - Complete Implementation Guide

## Overview

The Qwitter application now includes a complete, production-ready file upload feature that allows users to upload files to Firebase Storage and attach them to their qweets (tweets).

## What's Implemented

### 1. **File Upload Service** (`src/services/fileUploadService.js`)

A comprehensive service module that handles all file upload operations:

#### Functions Available

```javascript
// Import the service
import { uploadFile, deleteFile, validateFile, formatFileSize } from 'src/services/fileUploadService'
```

##### `uploadFile(file, path = 'qweets/files')`
- **Purpose**: Upload a file to Firebase Storage
- **Parameters**:
  - `file` (File): The file object to upload
  - `path` (string): Storage path (default: 'qweets/files')
- **Returns**: Promise resolving to object with:
  - `url`: Download URL for the file
  - `path`: Full storage path
  - `filename`: Generated unique filename
  - `size`: File size in bytes
  - `type`: MIME type
- **Example**:
```javascript
const result = await uploadFile(file)
console.log(result.url) // Use this to display the file
```

##### `deleteFile(path)`
- **Purpose**: Delete a file from Firebase Storage
- **Parameters**: 
  - `path` (string): Full storage path to the file
- **Returns**: Promise that resolves when deletion is complete
- **Example**:
```javascript
await deleteFile('qweets/files/1234567890_photo.jpg')
```

##### `validateFile(file, options = {})`
- **Purpose**: Validate a file before upload
- **Parameters**:
  - `file` (File): File to validate
  - `options` (object):
    - `maxSize` (number): Maximum file size in bytes (default: 10MB)
    - `allowedTypes` (array): Allowed MIME types
- **Returns**: Object with:
  - `isValid` (boolean): Whether the file is valid
  - `error` (string): Error message if invalid
- **Example**:
```javascript
const validation = validateFile(file, {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png']
})

if (!validation.isValid) {
  console.error(validation.error)
}
```

##### `formatFileSize(bytes)`
- **Purpose**: Convert bytes to human-readable format
- **Parameters**: 
  - `bytes` (number): Size in bytes
- **Returns**: Formatted string (e.g., "2.5 MB")
- **Example**:
```javascript
const size = formatFileSize(file.size) // "2.5 MB"
```

### 2. **File Upload Widget Component** (`src/components/FileUploadWidget.vue`)

A reusable Vue component that provides a UI for file uploads:

#### Features
- File selection with accept attribute
- Real-time file preview for images
- File size display
- File validation with error feedback
- Customizable button styling and colors
- Easy parent component integration via events

#### Usage Example

```vue
<template>
  <div>
    <FileUploadWidget
      @file-selected="handleFileSelected"
      @file-cleared="handleFileCleared"
      @error="handleError"
      label="Upload Photo"
      icon="image"
      color="primary"
      accept="image/*"
      :maxSize="5 * 1024 * 1024"
      :allowedTypes="['image/jpeg', 'image/png', 'image/gif']"
    />
  </div>
</template>

<script>
import FileUploadWidget from 'src/components/FileUploadWidget.vue'
import { uploadFile } from 'src/services/fileUploadService'

export default {
  components: { FileUploadWidget },
  methods: {
    async handleFileSelected(file) {
      try {
        const result = await uploadFile(file)
        console.log('File uploaded:', result.url)
      } catch (error) {
        console.error('Upload failed:', error)
      }
    },
    handleFileCleared() {
      console.log('File cleared')
    },
    handleError(message) {
      this.$q.notify({ type: 'negative', message })
    }
  }
}
</script>
```

#### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | String | 'image/*,.pdf,.txt' | File input accept attribute |
| `color` | String | 'grey' | Button color |
| `icon` | String | 'attach_file' | Button icon |
| `label` | String | '' | Button label |
| `size` | String | 'md' | Button size |
| `flat` | Boolean | true | Flat button style |
| `round` | Boolean | false | Round button style |
| `disabled` | Boolean | false | Disable button |
| `chipColor` | String | 'primary' | File chip color |
| `maxSize` | Number | 10MB | Maximum file size |
| `allowedTypes` | Array | See defaults | Allowed file types |

#### Component Events

| Event | Payload | Description |
|-------|---------|-------------|
| `file-selected` | File object | Emitted when a file is selected |
| `file-cleared` | None | Emitted when the selected file is cleared |
| `error` | String | Error message | Emitted when validation fails |

### 3. **PageHome Integration** (`src/pages/PageHome.vue`)

The home page demonstrates complete file upload integration:

#### Features
- File input in the qweet composer
- Real-time file preview before posting
- Validation before upload
- Display uploaded files with qweets
- Error handling and notifications
- Image and document support

#### Key Methods

```javascript
// Handle file selection
onFileSelected(event) {
  const file = event.target.files[0]
  const validation = validateFile(file)
  
  if (!validation.isValid) {
    // Show error
    return
  }
  
  // Store and preview file
  this.uploadedFile = file
}

// Create qweet with file
async addNewQweet() {
  let newQweet = {
    content: this.newQweetContent,
    date: Date.now(),
    liked: false
  }
  
  // Upload file if present
  if (this.uploadedFile) {
    const uploadedFileData = await uploadFile(this.uploadedFile)
    newQweet.file = {
      url: uploadedFileData.url,
      path: uploadedFileData.path,
      filename: uploadedFileData.filename,
      size: uploadedFileData.size,
      type: uploadedFileData.type
    }
  }
  
  // Save to Firestore
  await db.collection('qweets').add(newQweet)
}
```

## Firebase Setup Requirements

### 1. Enable Firebase Storage
1. Go to Firebase Console
2. Select your Qwitter project
3. Navigate to **Storage** section
4. Click **Get Started**
5. Choose a location and click **Done**

### 2. Configure Security Rules

Update Firebase Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /qweets/files/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.size < 10 * 1024 * 1024;
      allow delete: if request.auth != null;
    }
  }
}
```

### 3. Update Firebase Config

Ensure your `src/boot/firebase.js` includes:

```javascript
import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/storage"

firebase.initializeApp(firebaseConfig)

let db = firebase.firestore()
let storage = firebase.storage()

export { db, storage }
export default db
```

## Supported File Types

By default, the following file types are supported:
- **Images**: JPEG, PNG, GIF
- **Documents**: PDF
- **Text**: Plain text files

Default maximum file size: **10 MB**

These can be customized in the `validateFile` options.

## Usage Examples

### Example 1: Basic File Upload

```javascript
import { uploadFile } from 'src/services/fileUploadService'

// In a component method
async uploadUserFile() {
  const file = this.$refs.fileInput.files[0]
  
  try {
    const result = await uploadFile(file, 'user-uploads')
    console.log('File uploaded to:', result.url)
    // Store result.url in your database
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

### Example 2: Validate Before Upload

```javascript
import { validateFile, uploadFile } from 'src/services/fileUploadService'

async handleFileUpload(file) {
  const validation = validateFile(file, {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
  })
  
  if (!validation.isValid) {
    this.$q.notify({
      type: 'negative',
      message: validation.error
    })
    return
  }
  
  // Proceed with upload
  const result = await uploadFile(file)
  console.log('Success:', result)
}
```

### Example 3: Batch Upload

```javascript
import { uploadFile } from 'src/services/fileUploadService'

async uploadMultipleFiles(files) {
  const uploadPromises = Array.from(files).map(file => 
    uploadFile(file, 'batch-upload')
  )
  
  const results = await Promise.all(uploadPromises)
  return results
}
```

### Example 4: Display Uploaded File

```javascript
// In template
<div v-if="qweet.file" class="file-display">
  <!-- Image files -->
  <img v-if="isImageFile(qweet.file)" :src="qweet.file.url" />
  
  <!-- Other files -->
  <a v-else :href="qweet.file.url" target="_blank">
    {{ qweet.file.filename }}
  </a>
</div>
```

## Error Handling

Common errors and handling:

```javascript
try {
  const result = await uploadFile(file)
} catch (error) {
  if (error.code === 'storage/unauthenticated') {
    console.error('User not authenticated')
  } else if (error.code === 'storage/unauthorized') {
    console.error('User not authorized to upload')
  } else if (error.code === 'storage/retry-limit-exceeded') {
    console.error('Upload failed: too many retries')
  } else {
    console.error('Upload failed:', error.message)
  }
}
```

## Testing the Implementation

A verification script is provided at `tests/verify-file-upload.js`:

```bash
node tests/verify-file-upload.js
```

This script verifies:
- Service functions are properly exported
- Component correctly imports and uses the service
- Integration in PageHome is correct
- Firebase setup is complete
- All core logic functions work correctly

## Best Practices

1. **Always validate files** before uploading:
   ```javascript
   const validation = validateFile(file)
   if (!validation.isValid) return
   ```

2. **Show file previews** for images to improve UX:
   ```javascript
   if (file.type.startsWith('image/')) {
     const reader = new FileReader()
     reader.onload = (e) => {
       this.previewURL = e.target.result
     }
     reader.readAsDataURL(file)
   }
   ```

3. **Handle uploads asynchronously** with proper feedback:
   ```javascript
   this.isUploading = true
   try {
     const result = await uploadFile(file)
   } finally {
     this.isUploading = false
   }
   ```

4. **Provide user feedback** during upload:
   ```javascript
   this.$q.notify({
     type: 'positive',
     message: 'File uploaded successfully!'
   })
   ```

5. **Implement cleanup** for deleted items:
   ```javascript
   async deleteQweet(qweet) {
     if (qweet.file) {
       await deleteFile(qweet.file.path)
     }
     await db.collection('qweets').doc(qweet.id).delete()
   }
   ```

## Performance Considerations

1. **File size limits**: 10MB default, adjustable per use case
2. **Allowed types**: Restrict to necessary types to prevent misuse
3. **Storage paths**: Organize files by user/type for easier management
4. **Caching**: Browser caches downloaded images automatically
5. **Bandwidth**: Large files use more bandwidth; consider compression

## Troubleshooting

| Issue | Solution |
|-------|----------|
| File won't upload | Check Firebase Storage rules, ensure app is authenticated |
| File too large | Increase `maxSize` option or ask user to compress |
| Wrong file type | Verify `allowedTypes` includes the file's MIME type |
| Preview not showing | Ensure file is valid image type, check browser console |
| Upload very slow | Check file size, network speed, Firebase location |

## Summary

The file upload feature is fully implemented and includes:
- ✅ Service layer for all upload operations
- ✅ Reusable UI component for file selection
- ✅ Real-world integration in the qweet composer
- ✅ Firebase Storage integration
- ✅ Complete validation and error handling
- ✅ User-friendly file previews
- ✅ Comprehensive documentation and examples
- ✅ Verification tests to ensure functionality

Users can now seamlessly attach files to their qweets and share them with others!
