const APP_PACKAGE = process.env.APP_PACKAGE ?? "com.exo.uat";

/** Send app to background for `seconds`, then bring it back */
export async function backgroundAndResume(seconds: number): Promise<void> {
  await browser.background(seconds);
}

/** Kill the app process entirely */
export async function terminateApp(): Promise<void> {
  await browser.terminateApp(APP_PACKAGE);
}

/** Relaunch the app after termination */
export async function activateApp(): Promise<void> {
  await browser.activateApp(APP_PACKAGE);
}

/** Kill and relaunch – simulates OS tombstoning.
 *
 * Blocks until `android:id/content` is actually visible in the live view
 * hierarchy (up to 25 s). Polling the element directly — rather than
 * queryAppState — forces UiAutomator2 to re-index the new Activity window,
 * which is the step that must complete before any subsequent element lookup
 * can succeed.
 */
export async function killAndRelaunch(): Promise<void> {
  await terminateApp();
  await browser.pause(3000);
  await activateApp();

  await browser.waitUntil(
    async () => {
      try {
        const el = await $("id=android:id/content");
        return await el.isExisting();
      } catch {
        return false;
      }
    },
    { timeout: 25000, interval: 1500 },
  );

  // Dismiss any startup dialogs (crash reports, permission popups, etc.).
  await dismissAlertIfPresent();
}

/**
 * Set network connection mode (Android).
 * 0 = Airplane, 1 = WiFi only, 2 = Data only, 4 = WiFi+Data, 6 = All on
 */
export async function setNetworkMode(mode: number): Promise<void> {
  await browser.setNetworkConnection(mode as any);
}

/** Convenience: go offline */
export async function goOffline(): Promise<void> {
  await setNetworkMode(0);
}

/** Convenience: restore full connectivity */
export async function goOnline(): Promise<void> {
  await setNetworkMode(6);
}

/** Set GPS coordinates */
export async function setLocation(
  latitude: number,
  longitude: number,
  altitude = 0,
): Promise<void> {
  await browser.setGeoLocation({ latitude, longitude, altitude });
}

/** Set screen orientation */
export async function setOrientation(
  orientation: "LANDSCAPE" | "PORTRAIT",
): Promise<void> {
  await browser.setOrientation(orientation.toLowerCase() as "landscape" | "portrait");
}

/** Get current screen orientation */
export async function getOrientation(): Promise<string> {
  return await browser.getOrientation();
}

/**
 * Returns whether screen orientation changes are supported on this device/session.
 * Some CI emulator images keep rotation locked and reject orientation commands.
 */
export async function canRotateScreen(): Promise<boolean> {
  const current = (await getOrientation()).toUpperCase();
  const target = current === "PORTRAIT" ? "LANDSCAPE" : "PORTRAIT";

  try {
    await setOrientation(target as "LANDSCAPE" | "PORTRAIT");
    await browser.pause(500);
    const rotated = (await getOrientation()).toUpperCase() === target;

    await setOrientation(current as "LANDSCAPE" | "PORTRAIT");
    return rotated;
  } catch {
    try {
      await setOrientation(current as "LANDSCAPE" | "PORTRAIT");
    } catch {
      // Ignore restore failure on unsupported devices.
    }
    return false;
  }
}

/** Check if the soft keyboard is currently shown */
export async function isKeyboardShown(): Promise<boolean> {
  return browser.isKeyboardShown();
}

/** Dismiss the soft keyboard if open */
export async function hideKeyboard(): Promise<void> {
  if (await isKeyboardShown()) {
    await browser.hideKeyboard();
  }
}

/**
 * Grant a runtime permission via adb.
 * e.g. grantPermission("android.permission.CAMERA")
 */
export async function grantPermission(permission: string): Promise<void> {
  await browser.execute("mobile: changePermissions", {
    action: "grant",
    permissions: permission,
  });
}

/**
 * Revoke a runtime permission via adb.
 * e.g. revokePermission("android.permission.CAMERA")
 */
export async function revokePermission(permission: string): Promise<void> {
  await browser.execute("mobile: changePermissions", {
    action: "revoke",
    permissions: permission,
  });
}

/**
 * Simulate a fingerprint scan on Android emulator.
 * fingerprintId must be pre-enrolled (1 by default on emulators).
 */
export async function simulateFingerprint(fingerprintId = 1): Promise<void> {
  await browser.fingerPrint(fingerprintId);
}

/**
 * Push a file to the device (e.g. inject an image into gallery).
 * @param devicePath - e.g. "/sdcard/DCIM/test.jpg"
 * @param base64Data - file content as base64 string
 */
export async function pushFile(
  devicePath: string,
  base64Data: string,
): Promise<void> {
  await browser.pushFile(devicePath, base64Data);
}

/** Try to dismiss any visible system alert/dialog */
export async function dismissAlertIfPresent(): Promise<void> {
  try {
    await browser.dismissAlert();
  } catch {
    // No alert present – safe to ignore
  }
}

/** Try to accept any visible system alert/dialog */
export async function acceptAlertIfPresent(): Promise<void> {
  try {
    await browser.acceptAlert();
  } catch {
    // No alert present
  }
}

/** Simulate an incoming phone call via emulator console (emulator only) */
export async function simulateIncomingCall(
  phoneNumber = "5551234567",
): Promise<void> {
  const { execSync } = require("child_process");
  execSync(`adb emu gsm call ${phoneNumber}`);
}

/** End a simulated call */
export async function endSimulatedCall(
  phoneNumber = "5551234567",
): Promise<void> {
  const { execSync } = require("child_process");
  execSync(`adb emu gsm cancel ${phoneNumber}`);
}

/** Set system font scale (accessibility). 1.0 = normal, 1.5 = 150%
 *
 * Does NOT kill/relaunch: font_scale is a live Configuration change that the
 * running Activity handles (or React Native forwards to JS). Killing and
 * relaunching with software rendering (swiftshader_indirect) on CI causes the
 * display to render black due to a stale UiAutomator2 cache from the previous
 * instance, making all subsequent element queries return empty.
 */
export async function setFontScale(scale: number): Promise<void> {
  await browser.execute("mobile: shell", {
    command: "settings",
    args: ["put", "system", "font_scale", String(scale)],
  });
  // Brief pause so the OS dispatches the Configuration change to the app.
  await browser.pause(2000);
  // Confirm the Activity is still alive and its window is accessible.
  await browser.waitUntil(
    async () => {
      try {
        return await $("id=android:id/content").isExisting();
      } catch {
        return false;
      }
    },
    { timeout: 20000, interval: 1500 },
  );
}

/** Toggle dark mode on/off.
 *
 * Does NOT kill/relaunch: `cmd uimode night yes/no` sends a UiMode
 * Configuration change to the running app. On CI emulators using
 * swiftshader_indirect (software rendering), killing and relaunching after a
 * night-mode change produces a permanently black display — the renderer does
 * not recover and UiAutomator2 finds zero elements for the rest of the test.
 * Letting the live Activity receive the change avoids this entirely.
 */
export async function setDarkMode(enabled: boolean): Promise<void> {
  const mode = enabled ? "yes" : "no";
  await browser.execute("mobile: shell", {
    command: "cmd",
    args: ["uimode", "night", mode],
  });
  // Brief pause so the OS dispatches the UiMode Configuration change.
  await browser.pause(2000);
  // Confirm the Activity is still accessible after the mode switch.
  await browser.waitUntil(
    async () => {
      try {
        return await $("id=android:id/content").isExisting();
      } catch {
        return false;
      }
    },
    { timeout: 20000, interval: 1500 },
  );
}
