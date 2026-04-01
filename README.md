# exoTrails Appium + TypeScript

Automation for the UAT App of exoTrail.

## Quick start

1. Start an Android emulator.
2. Install dependencies:
   - `npm install`
3. Start Appium:
   - `npm run appium`
4. Run tests:
   - `npm test`
   - `npm run test:pixel9`
   - `E2E_EMAIL=testgamevt+14@gmail.com E2E_PASSWORD=123456@Exo npm run test:pixel9`
   - `E2E_EMAIL=testgamevt+14@gmail.com E2E_PASSWORD='123456@Exo' npm run test:pixel9 -- --spec tests/lifecycle.spec.ts 2>&1 | grep -E "✓|✖|passing|failing|Spec Files"`

## Environment overrides

- `APP_PATH`: override APK path (default: ./app.apk)
- `APP_PACKAGE`: process.env.APP_PACKAGE ?? "com.exo.uat";
- `APP_ACTIVITY`: com.exo.stg.ui.main.MainActivity
const deviceName = process.env.DEVICE_NAME ?? "Android Emulator";
- `DEVICE_NAME`: override device name (default: Android Emulator)
- `AVD_NAME`: start a specific Android emulator AVD
- `UDID`: target a specific connected device
- `HOME_LOCATOR_STRATEGY`: locator strategy for the home element (default: id)
- `HOME_LOCATOR_VALUE`: locator value for the home element (default: android:id/content)
- `HOME_LOCATOR_TIMEOUT`: wait timeout in ms (default: 20000)
