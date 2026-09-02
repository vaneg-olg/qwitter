# File Upload Quick Start Guide

This guide will help you get started with the file upload feature in Qwitter.

## For End Users

### How to Upload a File with Your Qweet

1. **Open Qwitter** and navigate to the home feed
2. **Click the attachment icon** (📎) next to the text input
3. **Select a file** from your device:
   - Images (JPEG, PNG, GIF)
   - PDF documents
   - Text files
   - Up to 10MB in size
4. **Review the preview** (optional) - images will show a preview
5. **Type your message** (optional) - you can post just a file, or add text too
6. **Click "Qweet"** to post with the file attached

### Tips
- Files are stored securely in the cloud
- Large files may take a moment to upload
- You can still interact with qweets (like, retweet) even with files

---

## For Developers

### Integration Points

If you want to integrate file uploads in your own components:

#### Option 1: Using the FileUploadWidget Component (Recommended)

```vue
<template>
  <div>
    <FileUploadWidget
      @file-selected="handleFileSelected"
      @error="handleError"
      color="primary"
      icon="attach_file"
      accept="image/*"
    />
  </div>
</template>

<script>
import FileUploadWidget from 'src/components/FileUploadWidget.vue'
import { uploadFile } from 'src/services/fileUploadService'

export default {
  components: { FileUploadWidget },
  methods: {
    handleFileSelected(file) {
      console.log('File ready to upload:', file.name)
    },
    handleError(error) {
      console.error('File error:', error)
    },
    async uploadMyFile() {
      const widget = this.$refs.uploader
      const file = widget.getFile()
      if (file) {
        const result = await uploadFile(file)
        console.log('Uploaded to:', result.url)
      }
    }
  }
}
</script>
```

#### Option 2: Using the Service Directly

```javascript
import { uploadFile, validateFile } from 'src/services/fileUploadService'

// Get file from user input
const file = event.target.files[0]

// Validate
const validation = validateFile(file)
if (!validation.isValid) {
  console.error(validation.error)
  return
}

// Upload
try {
  const result = await uploadFile(file, 'my-collection/files')
  console.log('Download URL:', result.url)
  
  // Save URL to database
  db.collection('items').add({
    fileUrl: result.url,
    fileName: result.filename,
    fileSize: result.size
  })
} catch (error) {
  console.error('Upload failed:', error)
}
```

### Configuration

#### Custom File Size Limit

In PageHome.vue (or any component using file uploads):

```javascript
const maxSize = 5 * 1024 * 1024 // 5MB instead of 10MB

// Pass to component
<FileUploadWidget
  :max-size="maxSize"
/>

// Or pass to service validation
const validation = validateFile(file, { maxSize: 5 * 1024 * 1024 })
```

#### Custom Allowed File Types

```javascript
const allowedTypes = [
  'image/jpeg',
  'image/png',
  'video/mp4'
]

// Pass to component
<FileUploadWidget
  :allowed-types="allowedTypes"
/>

// Or pass to service validation
const validation = validateFile(file, { allowedTypes })
```

### Key Files

| File | Purpose |
|------|---------|
| `src/services/fileUploadService.js` | Core upload logic and utilities |
| `src/components/FileUploadWidget.vue` | Reusable UI component |
| `src/pages/PageHome.vue` | Main feed with integrated uploads |
| `src/boot/firebase.js` | Firebase configuration (includes Storage) |

### Common Tasks

#### Upload a file
```javascript
const result = await uploadFile(file, 'uploads/docs')
const downloadUrl = result.url
```

#### Validate a file before upload
```javascript
const validation = validateFile(file)
if (validation.isValid) {
  // Safe to upload
} else {
  console.error(validation.error)
}
```

#### Format file size for display
```javascript
import { formatFileSize } from 'src/services/fileUploadService'

console.log(formatFileSize(2621440)) // "2.5 MB"
```

#### Delete a file
```javascript
import { deleteFile } from 'src/services/fileUploadService'

await deleteFile('uploads/docs/1234567890_document.pdf')
```

### Error Handling

The system automatically handles and reports errors:

```javascript
try {
  const result = await uploadFile(file)
} catch (error) {
  if (error.code === 'storage/unauthorized') {
    console.error('Not authorized to upload')
  } else if (error.code === 'storage/quota-exceeded') {
    console.error('Storage quota exceeded')
  } else if (error.code === 'storage/invalid-argument') {
    console.error('Invalid file')
  } else {
    console.error('Unknown error:', error)
  }
}
```

### Testing the Feature Locally

1. **Set up Firebase Storage** (see README.md)
2. **Run the app**: `quasar dev`
3. **Test upload**: Click attachment icon and select a file
4. **Verify**: Check Firebase Storage console to see uploaded files
5. **Check database**: Verify file metadata in Firestore

### Storage Path Structure

Files are organized in Firebase Storage as:
```
qweets/files/
├── 1234567890_image.jpg
├── 1234567891_document.pdf
└── 1234567892_note.txt
```

Format: `{timestamp}_{original_filename}`

### Database Schema

Files are stored in qweet documents:

```javascript
{
  content: "Check this out!",
  date: 1611653238221,
  liked: false,
  file: {
    url: "https://firebasestorage.googleapis.com/...",
    path: "qweets/files/1234567890_image.jpg",
    filename: "1234567890_image.jpg",
    size: 245632,
    type: "image/jpeg"
  }
}
```

### Security Considerations

✅ **Already implemented:**
- File size validation (max 10MB)
- File type validation
- Authentication required for upload
- Read access for all (public viewing)

🔧 **To implement:**
- Virus scanning for uploaded files
- Content moderation
- User file quotas
- Automatic cleanup of orphaned files

### Troubleshooting

**"File type not allowed"**
- Check the accepted file types in the validation
- Ensure MIME type matches (e.g., 'image/jpeg' not 'jpg')

**"File size exceeds limit"**
- Default limit is 10MB
- Reduce file size or adjust `maxSize` parameter
- Compress images before uploading

**Upload fails silently**
- Check browser console for errors
- Verify Firebase Storage rules allow write access
- Check internet connection

**Files not showing after upload**
- Verify file URL is accessible
- Check file permissions in Firebase Storage
- Ensure database record was created

---

## Architecture Overview

```
User Action
    ↓
FileUploadWidget Component
    ↓
uploadFile() Service Function
    ↓
Firebase Storage (Upload)
    ↓
Get Download URL
    ↓
Save metadata to Firestore
    ↓
Display in Qweet
```

## Next Steps

- Review the detailed API in [FILE_UPLOAD_DOCUMENTATION.md](FILE_UPLOAD_DOCUMENTATION.md)
- Check usage examples in [FILE_UPLOAD_EXAMPLES.js](FILE_UPLOAD_EXAMPLES.js)
- Explore the service: `src/services/fileUploadService.js`
- Explore the component: `src/components/FileUploadWidget.vue`

---

For questions or issues, refer to the main documentation or check the Firebase Storage documentation at https://firebase.google.com/docs/storage
