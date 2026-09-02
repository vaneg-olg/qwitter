# File Upload Feature - Quick Reference

## Import the Service

```javascript
import { uploadFile, deleteFile, validateFile, formatFileSize } from 'src/services/fileUploadService'
```

## Core Functions

### Upload a File

```javascript
// Basic upload
const result = await uploadFile(file)
console.log(result.url)  // Download URL
console.log(result.path) // Storage path

// Upload to custom path
const result = await uploadFile(file, 'my-collection/files')
```

### Delete a File

```javascript
await deleteFile('qweets/files/1234567890_photo.jpg')
```

### Validate a File

```javascript
const validation = validateFile(file, {
  maxSize: 10 * 1024 * 1024,  // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
})

if (!validation.isValid) {
  console.error(validation.error)
}
```

### Format File Size

```javascript
const size = formatFileSize(5 * 1024 * 1024) // "5 MB"
```

## Use the Component

```vue
<template>
  <FileUploadWidget
    @file-selected="handleFileSelected"
    @error="handleError"
    label="Upload File"
  />
</template>

<script>
import FileUploadWidget from 'src/components/FileUploadWidget.vue'
import { uploadFile } from 'src/services/fileUploadService'

export default {
  components: { FileUploadWidget },
  methods: {
    async handleFileSelected(file) {
      const result = await uploadFile(file)
      console.log('Uploaded:', result.url)
    },
    handleError(message) {
      console.error(message)
    }
  }
}
</script>
```

## Complete Example

```vue
<template>
  <q-page>
    <!-- File Input -->
    <FileUploadWidget
      icon="cloud_upload"
      label="Upload File"
      @file-selected="onFileSelected"
      @error="showError"
    />
    
    <!-- Display Result -->
    <div v-if="uploadResult" class="q-mt-md">
      <p>File: {{ uploadResult.filename }}</p>
      <p>Size: {{ formatFileSize(uploadResult.size) }}</p>
      <a :href="uploadResult.url" target="_blank">Download</a>
    </div>
  </q-page>
</template>

<script>
import FileUploadWidget from 'src/components/FileUploadWidget.vue'
import { uploadFile, formatFileSize } from 'src/services/fileUploadService'

export default {
  components: { FileUploadWidget },
  data() {
    return {
      uploadResult: null
    }
  },
  methods: {
    formatFileSize,
    async onFileSelected(file) {
      try {
        this.uploadResult = await uploadFile(file)
        this.$q.notify({
          type: 'positive',
          message: 'File uploaded successfully!'
        })
      } catch (error) {
        this.showError('Upload failed: ' + error.message)
      }
    },
    showError(message) {
      this.$q.notify({
        type: 'negative',
        message
      })
    }
  }
}
</script>
```

## Configuration

### Custom File Types

```javascript
const validation = validateFile(file, {
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword']
})
```

### Custom Size Limit

```javascript
const validation = validateFile(file, {
  maxSize: 50 * 1024 * 1024  // 50MB
})
```

### Custom Storage Path

```javascript
const result = await uploadFile(file, 'documents/contracts')
```

## API Reference

### uploadFile(file, path)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| file | File | Required | File to upload |
| path | string | 'qweets/files' | Storage path |

**Returns**: Promise<{url, path, filename, size, type}>

### deleteFile(path)

| Parameter | Type | Description |
|-----------|------|-------------|
| path | string | Full storage path |

**Returns**: Promise<void>

### validateFile(file, options)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| file | File | Required | File to validate |
| options.maxSize | number | 10MB | Max file size |
| options.allowedTypes | array | See service | Allowed MIME types |

**Returns**: {isValid, error}

### formatFileSize(bytes)

| Parameter | Type | Description |
|-----------|------|-------------|
| bytes | number | Size in bytes |

**Returns**: string (e.g., "2.5 MB")

## File Structure

```
src/
├── services/
│   └── fileUploadService.js    # Main service module
├── components/
│   └── FileUploadWidget.vue    # Reusable UI component
├── pages/
│   └── PageHome.vue            # Integration example
└── boot/
    └── firebase.js             # Firebase configuration
```

## Verify Installation

```bash
node tests/verify-file-upload.js
```

Expected output:
```
✅ All verification checks passed!
```

## Common Patterns

### Show upload progress
```javascript
const fileRef = storage.ref(fullPath)
fileRef.put(file, metadata).on('state_changed',
  (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
    console.log(progress + '% done')
  },
  (error) => console.error(error),
  () => console.log('Complete')
)
```

### Handle authentication
```javascript
try {
  const result = await uploadFile(file)
} catch (error) {
  if (error.code === 'storage/unauthenticated') {
    // User must log in
  }
}
```

### Store file metadata
```javascript
const result = await uploadFile(file)
await db.collection('files').add({
  url: result.url,
  path: result.path,
  filename: result.filename,
  size: result.size,
  type: result.type,
  uploadedAt: new Date(),
  uploadedBy: currentUser.uid
})
```

## Firebase Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /qweets/files/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.resource.size < 10 * 1024 * 1024;
      allow delete: if request.auth != null;
    }
  }
}
```

## Troubleshooting

**Q: File won't upload**
- A: Check Firebase Storage is enabled and rules allow writes

**Q: Preview not showing**
- A: Ensure file is a valid image type (MIME type starts with 'image/')

**Q: Upload is slow**
- A: Check file size and network speed

**Q: "File type not allowed"**
- A: Add MIME type to allowedTypes in validateFile options

**Q: "File size exceeds limit"**
- A: Increase maxSize option or upload smaller file

---

For complete documentation, see: [FILE_UPLOAD_IMPLEMENTATION.md](FILE_UPLOAD_IMPLEMENTATION.md)
