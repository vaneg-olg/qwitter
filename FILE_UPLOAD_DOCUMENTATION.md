# File Upload Functionality

This document describes the file upload features added to Qwitter, allowing users to upload and share files with their qweets.

## Overview

The file upload system enables users to:
- Upload files (images, PDFs, text documents) along with their qweets
- Preview selected files before posting
- View uploaded files in qweets (image thumbnails and document links)
- Manage file uploads with automatic validation

## Components

### 1. File Upload Service (`src/services/fileUploadService.js`)

The core service handling all file operations.

#### Functions

##### `uploadFile(file, path = 'qweets/files')`

Uploads a file to Firebase Storage.

**Parameters:**
- `file` (File): The file object to upload
- `path` (string): Storage path (default: 'qweets/files')

**Returns:** Promise that resolves to an object containing:
- `url` (string): Download URL for the file
- `path` (string): Full storage path
- `filename` (string): Unique filename
- `size` (number): File size in bytes
- `type` (string): MIME type

**Example:**
```javascript
import { uploadFile } from 'src/services/fileUploadService'

const file = event.target.files[0]
const uploadedData = await uploadFile(file)
console.log(uploadedData.url) // Download URL
```

##### `deleteFile(path)`

Deletes a file from Firebase Storage.

**Parameters:**
- `path` (string): Full storage path of the file

**Returns:** Promise that resolves when deletion is complete

**Example:**
```javascript
import { deleteFile } from 'src/services/fileUploadService'

await deleteFile('qweets/files/1234567890_document.pdf')
```

##### `formatFileSize(bytes)`

Converts bytes to human-readable format.

**Parameters:**
- `bytes` (number): File size in bytes

**Returns:** Formatted string (e.g., "2.5 MB")

**Example:**
```javascript
import { formatFileSize } from 'src/services/fileUploadService'

console.log(formatFileSize(1024)) // "1 KB"
console.log(formatFileSize(2621440)) // "2.5 MB"
```

##### `validateFile(file, options = {})`

Validates file before upload.

**Parameters:**
- `file` (File): File to validate
- `options` (object): Validation options
  - `maxSize` (number): Maximum file size in bytes (default: 10MB)
  - `allowedTypes` (array): Allowed MIME types

**Returns:** Object with:
- `isValid` (boolean): Whether file is valid
- `error` (string): Error message if invalid

**Example:**
```javascript
import { validateFile } from 'src/services/fileUploadService'

const result = validateFile(file, {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png']
})

if (!result.isValid) {
  console.error(result.error)
}
```

### 2. File Upload Widget Component (`src/components/FileUploadWidget.vue`)

A reusable Vue component for file upload UI.

#### Props

- `accept` (string): File types to accept (default: 'image/*,.pdf,.txt')
- `color` (string): Button color (default: 'grey')
- `icon` (string): Button icon (default: 'attach_file')
- `label` (string): Button label (default: '')
- `size` (string): Button size (default: 'md')
- `flat` (boolean): Flat button style (default: true)
- `round` (boolean): Round button (default: false)
- `disabled` (boolean): Disable button (default: false)
- `chipColor` (string): File chip color (default: 'primary')
- `maxSize` (number): Maximum file size in bytes (default: 10MB)
- `allowedTypes` (array): Allowed MIME types (default: images, PDF, text)

#### Events

- `file-selected(file)`: Emitted when a file is selected
- `file-cleared()`: Emitted when selected file is cleared
- `error(message)`: Emitted when validation fails

#### Methods

- `triggerFileInput()`: Programmatically open file picker
- `getFile()`: Get currently selected file
- `setFile(file)`: Set file programmatically
- `clearFile()`: Clear selected file

#### Usage Example

```vue
<template>
  <div>
    <FileUploadWidget
      ref="uploader"
      @file-selected="handleFileSelected"
      @error="handleError"
      color="primary"
      icon="add_photo_alternate"
      accept="image/*"
    />
  </div>
</template>

<script>
import FileUploadWidget from 'src/components/FileUploadWidget.vue'

export default {
  components: { FileUploadWidget },
  methods: {
    handleFileSelected(file) {
      console.log('File selected:', file.name)
    },
    handleError(message) {
      this.$q.notify({
        type: 'negative',
        message: message
      })
    }
  }
}
</script>
```

### 3. Updated PageHome Component

The home page now includes integrated file upload functionality.

#### Features

- **File picker button** in the qweet input field
- **File preview** for selected files before posting
- **Automatic image preview** in the selection area
- **File validation** with error notifications
- **Upload progress** with loading state
- **File display in qweets** - images show as thumbnails, documents as links

#### How to Use

1. Click the attachment icon in the qweet input field
2. Select a file from your device
3. Preview the file (optional)
4. Click "Qweet" to post with the file attached

## Firebase Storage Setup

To use the file upload functionality, you need to set up Firebase Storage:

1. Go to your Firebase project console
2. Navigate to Storage
3. Set up Cloud Storage with appropriate security rules

### Recommended Security Rules

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

## File Size Limits

- Default maximum: 10MB
- Configurable via `maxSize` prop or service options
- Can be different for different use cases

## Supported File Types

**Default supported types:**
- Images: JPEG, PNG, GIF
- Documents: PDF
- Text: Plain text files

**Customizable:**
Pass `allowedTypes` array to configure supported MIME types

## Error Handling

The system includes built-in error handling for:
- File too large
- Invalid file type
- Upload failures
- Network errors

Errors are displayed to users via Quasar notifications.

## Database Schema

Files are stored as nested objects in qweet documents:

```javascript
{
  content: "Check out this image!",
  date: 1611653238221,
  liked: false,
  file: {
    url: "https://...",
    path: "qweets/files/1234567890_image.jpg",
    filename: "1234567890_image.jpg",
    size: 245632,
    type: "image/jpeg"
  }
}
```

## Best Practices

1. **Validate files** before uploading using the validation service
2. **Handle errors gracefully** with user-friendly messages
3. **Show progress** during uploads for better UX
4. **Limit file sizes** to prevent storage bloat
5. **Delete files** when qweets are deleted (requires implementing cascade delete)
6. **Use appropriate access levels** in Firebase Security Rules

## Future Enhancements

Potential improvements for the file upload system:
- Multiple file uploads per qweet
- Drag and drop file upload
- File type icons for non-image files
- Upload progress bars
- Thumbnail generation for videos
- Image compression before upload
- File encryption for privacy
- Automatic cleanup of orphaned files
