# Qwitter (qwitter)

A Cross-Platform Twitter Clone created with Quasar Framework, VueJS & Firebase

## Features

- Create and share text-based "qweets" (tweets)
- **NEW: Upload and share files with your qweets** 📎
  - Support for images, PDFs, and text documents
  - Automatic file validation and preview
  - Seamless integration with Firestore
- Like/unlike qweets
- Delete your own qweets
- Real-time updates with Firestore
- Cross-platform support (Web, Desktop, iOS, Android)

## File Upload Feature

Qwitter now supports file uploads! Users can attach files to their qweets.

### Supported File Types
- Images: JPEG, PNG, GIF
- Documents: PDF
- Text: Plain text files
- Maximum file size: 10MB (configurable)

### How to Use
1. Click the attachment icon (📎) in the qweet composition area
2. Select a file from your device
3. Preview the file (automatic for images)
4. Click "Qweet" to post

### Setup File Upload Feature

#### 1. Enable Firebase Storage
- Go to your Firebase project console
- Navigate to the **Storage** section
- Click **Get Started** to create a Storage bucket
- Choose a location and click **Done**

#### 2. Configure Storage Security Rules
In the Storage Rules tab, update the rules to:

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

#### 3. Update Firebase Config
Ensure your `src/boot/firebase.js` includes the storage import:

```javascript
import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/storage"
```

### Documentation

For detailed information about the file upload functionality, see:
- **[FILE_UPLOAD_DOCUMENTATION.md](FILE_UPLOAD_DOCUMENTATION.md)** - Complete API documentation
- **[FILE_UPLOAD_EXAMPLES.js](FILE_UPLOAD_EXAMPLES.js)** - Usage examples and code snippets

## Setup Firebase (General)
- Create a new Firebase project named Qwitter
- Create a Web App named Qwitter
- Copy the config from the code sample that appears and add it to src/boot/firebase.js
- Create a Cloud Firestore database - make sure you choose "Start in test mode"
- **Enable Cloud Storage** (see File Upload Feature section above)

## Install the dependencies
```bash
npm install
```

## Web Version

### Start in development mode
```bash
quasar dev
```

### Build for production
```bash
quasar build
```

## Desktop Version (Electron)

### Start in development mode
```bash
quasar dev -m electron
```

### Build for production
To build for different platforms, change the `electron > packager > platform` setting in `quasar.conf.js` to `win32`, `darwin`, `mas` or `linux` 
```bash
quasar build -m electron
```

## iOS Version (Cordova)

### Install Cordova globally
```bash
npm install -g cordova
```
or
```bash
sudo npm install -g cordova
```

### Install Xcode

[Install Xcode](https://developer.apple.com/download/more/)

### Start in development mode
```bash
quasar dev -m cordova -T ios
```

### Start on other Simulator Devices
```bash
cd src-cordova
cordova run ios --list
cd ..
quasar dev -m cordova -T ios -e "iPhone-12, 14.3"
```

### Build for production
```bash
quasar build -m cordova -T ios
```

## Android Version (Cordova)

### Install Cordova globally
```bash
npm install -g cordova
```
or
```bash
sudo npm install -g cordova
```

### Follow all steps on Quasar site

[Follow all steps on Quasar site](https://quasar.dev/quasar-cli/developing-cordova-apps/preparation#Android-setup)

### Launch Android Virtual Device
Android Studio > Configure > AVD Manager > Launch an AVD

### Start in development mode
```bash
quasar dev -m cordova -T android
```

### Build for production
```bash
quasar build -m cordova -T android
```

## Project Structure

```
src/
├── boot/
│   └── firebase.js              # Firebase configuration
├── services/
│   └── fileUploadService.js    # File upload utilities
├── components/
│   └── FileUploadWidget.vue    # Reusable upload component
├── pages/
│   ├── PageHome.vue            # Main qweet feed (with upload)
│   ├── PageAbout.vue
│   └── Error404.vue
└── ...
```

## Core Services & Components

### FileUploadService
Located in `src/services/fileUploadService.js`, provides:
- `uploadFile(file, path)` - Upload files to Firebase Storage
- `deleteFile(path)` - Delete files from storage
- `validateFile(file, options)` - Validate files before upload
- `formatFileSize(bytes)` - Human-readable file sizes

### FileUploadWidget
Located in `src/components/FileUploadWidget.vue`, a reusable component for file uploads with:
- File selection and preview
- Validation feedback
- Image preview display
- Event emissions for parent component integration
