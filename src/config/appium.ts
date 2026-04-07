//import path from "node:path";

// const appPath =
//   process.env.APP_PATH ?? path.resolve(__dirname, "../../Andr.2.6.0.UAT.apk");
const appPackage = process.env.APP_PACKAGE ?? "com.exo.uat";
const appActivity = process.env.APP_ACTIVITY ?? "com.exo.stg.ui.main.MainActivity";
const deviceName = process.env.DEVICE_NAME ?? "Android Emulator";
const udid = process.env.UDID;
const avdName = process.env.AVD_NAME;
const serverUrl = new URL(
  process.env.APPIUM_SERVER_URL ?? "http://127.0.0.1:4723/wd/hub"
);

const capabilities: Record<string, unknown> = {
  platformName: "Android",
  browserName: "",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": deviceName,
  // "appium:app": appPath,
  "appium:appPackage": appPackage,
  "appium:appActivity": appActivity,
  "appium:autoGrantPermissions": true,
  "appium:newCommandTimeout": 120,
  // "appium:noReset": false,
  // "appium:fullReset": false
};

if (udid) {
  capabilities["appium:udid"] = udid;
}

if (avdName) {
  capabilities["appium:avd"] = avdName;
}

export const appiumOptions = {
  hostname: serverUrl.hostname,
  port: Number(serverUrl.port || 4723),
  path: serverUrl.pathname,
  logLevel: "info",
  capabilities
};
