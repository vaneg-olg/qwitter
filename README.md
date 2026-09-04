# Qwitter (qwitter)

A Cross-Platrom Twitter Clone created with Quasar Framework, VueJS & Firebase

## Setup Firebase
- Create a new Firebase project named Qwitter
- Create a Web App named Qwitter
- Copy the config from the code sample that appears and add it to src/boot/firebase.js
- Create a Cloud Firestore database - make sure you choose "Start in test mode"

## Install the dependencies
```bash
npm install
```

## Running Tests

Currently, the test suite is not yet configured. To add testing to this project:

1. **Install a test framework** (e.g., Jest):
```bash
npm install --save-dev jest @vue/test-utils vue-jest babel-jest
```

2. **Configure Jest** by adding a `jest.config.js` file to the root directory

3. **Write tests** in the `tests/unit/` directory with `.spec.js` extensions

4. **Update package.json** to use the test command:
```json
"test": "jest"
```

5. **Run the tests**:
```bash
npm test
```

For more information on testing Vue components, see the [Vue Test Utils documentation](https://vue-test-utils.vuejs.org/).

## Web Version

### Start  in development mode
```bash
quasar dev
```

### Build for production
```bash
quasar build
```

## Desktop Version (Electron)

### Start  in development mode
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

### Start  in development mode
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

### Start  in development mode
```bash
quasar dev -m cordova -T android
```

### Build for production
```bash
quasar build -m cordova -T android
```
