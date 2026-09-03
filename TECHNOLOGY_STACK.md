# Qwitter Technology Stack

## Overview
Qwitter is a **Cross-Platform Twitter Clone** built with modern web technologies, supporting Web, Desktop (Electron), iOS (Cordova), and Android (Cordova) platforms.

## Core Framework & Build Tools
- **Framework**: [Quasar Framework v1](https://quasar.dev/) - A full-stack Vue.js framework
- **Build Tool**: Quasar CLI with Webpack
- **Runtime**: Node.js >= 10.18.1

## Frontend Technologies
- **UI Framework**: [Vue.js](https://vuejs.org/) (via Quasar)
- **Language**: JavaScript (ES6)
  - TypeScript support disabled (`supportTS: false` in quasar.conf.js)
  - No transpilation by default for better performance
- **Routing**: Vue Router
- **Styling**: SASS/SCSS
  - PostCSS with Autoprefixer for vendor prefixing
  - Quasar theming system (Material Icons theme)
- **Icon Sets**: 
  - Font Awesome v5
  - Material Icons
- **CSS Framework**: Quasar's Material Design components

## Backend & Database
- **Backend**: Firebase (v8.2.4)
  - Firestore for real-time database
  - Authentication via Firebase (inferred)
- **Database**: Cloud Firestore (NoSQL)

## Date/Time
- **Library**: date-fns v2 (date utilities)

## Platform Support

### Web
- Development: `quasar dev`
- Production: `quasar build`
- Deployment: SPA (Single Page Application) with hash-based routing

### Desktop (Electron)
- **Version**: Electron v9.4.1
- **Bundler**: electron-packager v14.2.1
- **Build Mode**: Development with `quasar dev -m electron`
- **Production Build**: `quasar build -m electron`
- **Dev Tools**: Devtron v1.4.0, electron-debug v3.2.0, electron-devtools-installer v3.1.1
- **Supported Platforms**: Windows (win32), macOS (darwin/mas), Linux

### Mobile - Cordova
- **iOS**: Quasar CLI with Cordova
  - Requires Xcode
  - Device simulation available
- **Android**: Quasar CLI with Cordova
  - Requires Android SDK setup
  - Supports virtual device testing

### PWA (Progressive Web App)
- Configured with Workbox
- Standalone display mode
- Portrait orientation
- Service worker generation

## Dependencies Summary

### Production Dependencies
- `quasar`: ^1.0.0 - UI Framework
- `@quasar/extras`: ^1.0.0 - Icon packs and fonts
- `firebase`: ^8.2.4 - Backend services
- `date-fns`: ^2.16.1 - Date utilities
- `core-js`: ^3.6.5 - Polyfills for older browsers

### Development Dependencies
- `@quasar/app`: ^2.0.0 - Quasar CLI
- `electron`: ^9.4.1 - Desktop framework
- `electron-packager`: ^14.2.1 - Packaging tool
- Electron dev tools and debuggers
- Babel (@quasar/babel-preset-app)

## Project Structure
```
src/
├── assets/          - Static assets
├── boot/            - Boot plugins (Firebase initialization)
├── css/             - Global styles (SASS)
├── layouts/         - Layout components
├── pages/           - Page components
├── router/          - Vue Router configuration
├── App.vue          - Root component
└── index.template.html - HTML template

src-electron/       - Electron main process code
src-cordova/        - Cordova mobile app code
```

## Browser Support (browserslist)
- Last 10 Chrome versions
- Last 10 Firefox versions
- Last 4 Edge versions
- Last 7 Safari versions
- Last 8 Android versions
- Last 8 ChromeAndroid versions
- Last 8 FirefoxAndroid versions
- Last 10 iOS versions
- Last 5 Opera versions

## Build & Development Configuration
- **Module System**: ES6 modules
- **Bundler**: Webpack (via Quasar)
- **Code Transpilation**: Babel (preset: @quasar/babel-preset-app)
- **Path Aliases** (jsconfig.json):
  - `src/*` - Source files
  - `components/*` - Components directory
  - `layouts/*` - Layouts directory
  - `pages/*` - Pages directory
  - `assets/*` - Assets directory
  - `boot/*` - Boot files
- **CSS Naming**: app.sass, quasar.variables.sass

## Version Info
- **App Version**: 0.0.1
- **Package Managers**: npm >= 6.13.4, yarn >= 1.21.1

## Notable Features
1. **Multi-platform**: Single codebase for web, desktop, and mobile
2. **Real-time Database**: Firebase Firestore integration
3. **Material Design**: Built-in Material Design components
4. **Responsive**: Material Icons and responsive UI framework
5. **Development Mode**: Hot module reloading and dev tools included
