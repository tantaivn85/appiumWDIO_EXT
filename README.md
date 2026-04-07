# appiumWDIO_EXT Appium + TypeScript

Automation for the UAT App in appiumWDIO_EXT.

## Quick start

1. Start an Android emulator.
2. Provide the APK:
   - Local runs: place `Andr.2.6.0.UAT.apk` at the repository root.
   - CI runs: set the `E2E_APK_URL` GitHub secret to a direct download URL for the APK.
2. Install dependencies:
   - `npm install`
3. Start Appium:
   - `npm run appium`
4. Run tests:
   - `npm test`
    - `npm run test:device-state`
   - `npm run test:pixel9`
   - `E2E_EMAIL=****** E2E_PASSWORD=****** npm run test:pixel9`
   - `E2E_EMAIL=****** E2E_PASSWORD=****** npm run test:pixel9:spec -- ./tests/launch.spec.ts`
   - `E2E_EMAIL=****** E2E_PASSWORD=****** npm run test:pixel9:spec:shortreport -- ./tests/launch.spec.ts`

## Appium Inspector

Use this project configuration in Appium Inspector:

- Remote Host: `127.0.0.1`
- Remote Port: `4723`
- Remote Path: `/wd/hub`
- Automation Name: `UiAutomator2`
- Platform Name: `Android`
- Device Name: `Android Emulator`
- App Package: `com.exo.uat`
- App Activity: `com.exo.stg.ui.main.MainActivity`

Desired Capabilities JSON:

```json
{
   "platformName": "Android",
   "appium:automationName": "UiAutomator2",
   "appium:deviceName": "Android Emulator",
   "appium:appPackage": "com.exo.uat",
   "appium:appActivity": "com.exo.stg.ui.main.MainActivity",
   "appium:autoGrantPermissions": true,
   "appium:newCommandTimeout": 120
}
```

Optional overrides:

- Add `"appium:udid": "emulator-5554"` when targeting a specific running emulator/device.
- Add `"appium:avd": "Pixel_9"` only when you want Appium to boot that AVD for you.

Before connecting Inspector:

1. Start the emulator.
2. Start Appium with `npm run appium`.
3. Make sure the app is already installed on the emulator, because this project uses `appPackage` and `appActivity` rather than `appium:app`.

## HTML Report

- JUnit XML is written to `reports/junit`.
- Generate HTML from JUnit locally:
   - `npm run report:html`
- Open report at:
   - `reports/html/index.html`
- In CI, the HTML report is uploaded as `html-report` artifact.

## Environment overrides

- `APP_PATH`: override APK path (default: ./Andr.2.6.0.UAT.apk)
- `E2E_APK_URL`: CI-only direct download URL for the APK when `Andr.2.6.0.UAT.apk` is not present in the repo
- `APP_PACKAGE`: process.env.APP_PACKAGE ?? "com.exo.uat";
- `APP_ACTIVITY`: com.exo.stg.ui.main.MainActivity
const deviceName = process.env.DEVICE_NAME ?? "Android Emulator";
- `DEVICE_NAME`: override device name (default: Android Emulator)
- `AVD_NAME`: start a specific Android emulator AVD
- `UDID`: target a specific connected device
- `HOME_LOCATOR_STRATEGY`: locator strategy for the home element (default: id)
- `HOME_LOCATOR_VALUE`: locator value for the home element (default: android:id/content)
- `HOME_LOCATOR_TIMEOUT`: wait timeout in ms (default: 20000)

## CI Reports

- WDIO now writes JUnit XML reports to `reports/junit`.
- GitHub Actions uploads them as the `junit-report` artifact.
- Appium logs are uploaded as the `appium-logs` artifact.

## Telegram Notifications (Optional)

Add these GitHub repository secrets to receive a post-run message:

- `TELEGRAM_BOT_TOKEN`: Bot token from BotFather
- `TELEGRAM_CHAT_ID`: Target chat ID (user/group/channel)

If Telegram responds with `migrate_to_chat_id`, your group was upgraded to a supergroup. Set `TELEGRAM_CHAT_ID` to the new value (usually starts with `-100...`).

Each run posts:

- overall status (success/failure)
- test totals/failures/skipped (from JUnit XML)
- link to the GitHub Actions run
