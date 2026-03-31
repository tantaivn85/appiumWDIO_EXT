import * as fs from "node:fs";
import * as path from "node:path";
import { HomePage } from "../src/pages/Index";
import {
  grantPermission,
  revokePermission,
  simulateFingerprint,
  setLocation,
  pushFile,
  goOffline,
  goOnline,
  setNetworkMode,
} from "../src/utils/device";

const APP_PACKAGE = process.env.APP_PACKAGE ?? "com.exo.uat";

describe("Device State & Hardware Features", () => {

  describe("Permission Handling", () => {
    afterEach(async () => {
      await grantPermission("android.permission.ACCESS_FINE_LOCATION");
      await grantPermission("android.permission.CAMERA");
    });

    it("app handles location permission being revoked", async () => {
      await revokePermission("android.permission.ACCESS_FINE_LOCATION");

      await browser.terminateApp(APP_PACKAGE);
      await browser.pause(1000);
      await browser.activateApp(APP_PACKAGE);

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });

    it("app handles camera permission being revoked", async () => {
      await revokePermission("android.permission.CAMERA");

      await browser.terminateApp(APP_PACKAGE);
      await browser.pause(1000);
      await browser.activateApp(APP_PACKAGE);

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });

    it("app handles all permissions revoked simultaneously", async () => {
      await revokePermission("android.permission.ACCESS_FINE_LOCATION");
      await revokePermission("android.permission.CAMERA");
      await revokePermission("android.permission.READ_EXTERNAL_STORAGE");

      await browser.terminateApp(APP_PACKAGE);
      await browser.pause(1000);
      await browser.activateApp(APP_PACKAGE);

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });
  });

  describe("Biometric Authentication", () => {
    it("handles successful fingerprint authentication", async () => {
      await simulateFingerprint(1);
      await browser.pause(2000);
    });

    it("handles failed fingerprint authentication", async () => {
      try {
        await simulateFingerprint(99);
      } catch {
        // Expected to fail
      }
      await browser.pause(2000);
      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });
  });

  describe("GPS & Geolocation", () => {
    it("responds to mocked GPS coordinates (Ho Chi Minh City)", async () => {
      await setLocation(10.8231, 106.6297);
      await browser.pause(3000);
      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });

    it("responds to mocked GPS coordinates (New York)", async () => {
      await setLocation(40.7128, -74.006);
      await browser.pause(3000);
      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });

    it("handles extreme GPS coordinates (North Pole)", async () => {
      await setLocation(90.0, 0.0);
      await browser.pause(3000);
      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });
  });

  describe("Camera & Gallery (Image Injection)", () => {
    it("pushes a mock image to device gallery", async () => {
      const testImagePath = path.resolve(__dirname, "../fixtures/test-image.jpg");
      if (fs.existsSync(testImagePath)) {
        const base64Image = fs.readFileSync(testImagePath).toString("base64");
        await pushFile("/sdcard/DCIM/test-image.jpg", base64Image);
        await browser.pause(1000);

        await browser.execute("mobile: shell", {
          command: "am",
          args: [
            "broadcast",
            "-a",
            "android.intent.action.MEDIA_SCANNER_SCAN_FILE",
            "-d",
            "file:///sdcard/DCIM/test-image.jpg",
          ],
        });
      } else {
        console.warn("No test-image.jpg found in fixtures/; skipping image push test.");
      }
    });
  });

  describe("Network Conditions", () => {
    afterEach(async () => {
      await goOnline();
    });

    it("app handles going offline gracefully", async () => {
      await goOffline();
      await browser.pause(3000);

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });

    it("app recovers after connectivity is restored", async () => {
      await goOffline();
      await browser.pause(3000);
      await goOnline();
      await browser.pause(5000);

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });

    it("app handles WiFi-only mode", async () => {
      await setNetworkMode(2);
      await browser.pause(3000);
      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });

    it("app handles data-only mode (simulates 3G/4G)", async () => {
      await setNetworkMode(4);
      await browser.pause(3000);
      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });

    it("app handles fluctuating signal (toggle connectivity)", async () => {
      for (let i = 0; i < 3; i++) {
        await goOffline();
        await browser.pause(2000);
        await goOnline();
        await browser.pause(3000);
      }
      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });
  });
});
