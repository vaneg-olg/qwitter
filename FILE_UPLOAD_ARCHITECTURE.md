# File Upload Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │               PageHome.vue                                 │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Qweet Composer                                      │  │ │
│  │  │  ├─ Text Input (280 chars)                          │  │ │
│  │  │  ├─ Attach File Button (📎)                         │  │ │
│  │  │  ├─ File Preview Panel                              │  │ │
│  │  │  └─ Qweet Button                                    │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Qweet Display                                       │  │ │
│  │  │  ├─ Text Content                                     │  │ │
│  │  │  ├─ File Display (Image or Link)                    │  │ │
│  │  │  └─ Interaction Buttons (Like, Retweet, Delete)     │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │               FileUploadWidget.vue (Reusable)              │ │
│  │  ├─ File Input (Hidden)                                    │ │
│  │  ├─ Upload Button                                          │ │
│  │  ├─ File Preview                                           │ │
│  │  └─ Validation Display                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            fileUploadService.js                            │ │
│  │                                                              │ │
│  │  • uploadFile(file, path)                                 │ │
│  │    └─ Generates unique filename                            │ │
│  │    └─ Uploads to Firebase Storage                          │ │
│  │    └─ Returns download URL + metadata                      │ │
│  │                                                              │ │
│  │  • validateFile(file, options)                            │ │
│  │    └─ Checks file size                                     │ │
│  │    └─ Validates file type                                  │ │
│  │    └─ Returns validation result                            │ │
│  │                                                              │ │
│  │  • formatFileSize(bytes)                                  │ │
│  │    └─ Converts to human-readable format                    │ │
│  │                                                              │ │
│  │  • deleteFile(path)                                       │ │
│  │    └─ Removes file from storage                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND SERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐      ┌──────────────────────────────┐ │
│  │  Cloud Storage      │      │  Cloud Firestore             │ │
│  │                     │      │                              │ │
│  │  /qweets/files/     │      │  /qweets/{qweetId}           │ │
│  │  ├─ image.jpg       │      │  {                            │ │
│  │  ├─ doc.pdf         │      │    content: string,          │ │
│  │  └─ note.txt        │      │    date: timestamp,          │ │
│  │                     │      │    liked: boolean,           │ │
│  │  (File storage)     │      │    file: {                   │ │
│  │                     │      │      url: string,            │ │
│  │                     │      │      path: string,           │ │
│  │                     │      │      filename: string,       │ │
│  │                     │      │      size: number,           │ │
│  │                     │      │      type: string            │ │
│  │                     │      │    }                         │ │
│  │                     │      │  }                            │ │
│  │                     │      │                              │ │
│  │                     │      │  (Metadata storage)          │ │
│  └─────────────────────┘      └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Upload Flow

```
User clicks file icon
        ↓
File picker opens (browser native)
        ↓
User selects file
        ↓
[PageHome.vue] onFileSelected()
        ↓
validateFile() ← Check size & type
        ↓
Is valid? → NO → Show error notification → End
        ↓ YES
Display file preview
        ↓
User clicks "Qweet"
        ↓
[PageHome.vue] addNewQweet()
        ↓
uploadFile() ← Send to Firebase Storage
        ↓
Firebase Storage processes upload
        ↓
Get download URL
        ↓
Save to Firestore: {content, file{url, path, ...}, date}
        ↓
Show success notification
        ↓
Reset form (clear text, file)
        ↓
Real-time listener updates qweet list
        ↓
Display qweet with file in feed
```

### Display Flow

```
Cloud Firestore updates
        ↓
Real-time listener detects change
        ↓
[PageHome.vue] mounted() onSnapshot()
        ↓
Qweet data received including file metadata
        ↓
[PageHome.vue] checks if qweet.file exists
        ↓
File exists? → NO → Display text only
        ↓ YES
isImageURL(file.url)? → YES → Display image thumbnail
        ↓ NO
Display document link
        ↓
User sees qweet with file
```

### Delete Flow

```
User clicks delete button
        ↓
[PageHome.vue] deleteQweet()
        ↓
Delete from Firestore
        ↓
Real-time listener detects removal
        ↓
Qweet removed from UI
        ↓
File remains in Storage (manual cleanup not implemented)
        ↓
Note: In production, implement cascade delete to clean up files
```

## Component Hierarchy

```
App.vue
  └─ router-view
      └─ MainLayout.vue
          └─ PageHome.vue
              ├─ File Input (hidden)
              ├─ Qweet Composer
              │   ├─ Avatar
              │   ├─ Text Input
              │   ├─ File Icon
              │   ├─ File Preview (conditional)
              │   │   └─ File Chip
              │   │   └─ Image Preview (conditional)
              │   └─ Qweet Button
              │
              └─ Qweet Feed
                  └─ Qweet Item (repeating)
                      ├─ Avatar
                      ├─ Header (Name, Handle, Date)
                      ├─ Content Text
                      ├─ File Display (conditional)
                      │   ├─ Image Display (if image)
                      │   └─ Document Link (if document)
                      └─ Action Buttons (Comment, Retweet, Like, Delete)
```

## Module Dependencies

```
PageHome.vue
    ├─ imports: db from 'src/boot/firebase'
    ├─ imports: formatDistance from 'date-fns'
    ├─ imports: uploadFile, formatFileSize from 'src/services/fileUploadService'
    └─ uses: Quasar components (q-page, q-input, q-btn, etc.)

FileUploadWidget.vue
    ├─ imports: validateFile, formatFileSize from 'src/services/fileUploadService'
    └─ uses: Quasar components (q-btn, q-chip, etc.)

fileUploadService.js
    ├─ imports: storage from 'src/boot/firebase'
    └─ exports: uploadFile, deleteFile, validateFile, formatFileSize

firebase.js
    ├─ imports: firebase, firebase/firestore, firebase/storage
    └─ exports: db, storage (default: db)
```

## Error Handling Flows

```
Upload Error Path
    ↓
Exception thrown
    ↓
catch(error)
    ↓
console.error()
    ↓
User notification (q.notify)
    ↓
isUploading = false
    ↓
User can retry

File too large
    ↓
validateFile() catches it
    ↓
validation.error = "File size exceeds..."
    ↓
User notification
    ↓
File not selected

Invalid file type
    ↓
validateFile() catches it
    ↓
validation.error = "File type not allowed"
    ↓
User notification
    ↓
File rejected
```

## State Management

### PageHome.vue Component State

```javascript
data: {
  newQweetContent: '',      // User's qweet text
  uploadedFile: null,       // Currently selected file (File object)
  filePreviewURL: null,     // Data URL for image preview
  isUploading: boolean,     // Upload in progress indicator
  qweets: []                // Array of qweet objects from Firestore
}
```

### Qweet Document Structure (Firestore)

```javascript
{
  id: string,               // Document ID (auto-generated)
  content: string,          // Qweet text (max 280 chars)
  date: timestamp,          // Creation timestamp
  liked: boolean,           // User's like status
  file?: {                  // Optional file attachment
    url: string,            // Firebase Storage download URL
    path: string,           // Storage path
    filename: string,       // Unique filename with timestamp
    size: number,           // File size in bytes
    type: string            // MIME type
  }
}
```

## Configuration Points

```javascript
// File size limit (in fileUploadService.js)
const maxSize = 10 * 1024 * 1024  // 10MB

// Allowed file types (in fileUploadService.js)
const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain'
]

// Storage path (in uploadFile function)
const path = 'qweets/files'

// Accept attribute (in PageHome.vue)
accept="image/*,.pdf,.txt"
```

## Security Model

```
User Action
    ↓
✓ File size validated (client-side)
✓ File type validated (client-side)
    ↓
Upload to Firebase Storage
    ↓
Firebase checks:
    ✓ User authenticated (if required by rules)
    ✓ File size limit (5th Firebase rules)
    ✓ Write permission (storage rules)
    ↓
File stored safely
    ✓ HTTPS encryption in transit
    ✓ Unique path prevents overwrites
    ✓ Metadata in Firestore
```

---

This architecture provides a clean separation of concerns, maintainability, and extensibility for the file upload feature.
