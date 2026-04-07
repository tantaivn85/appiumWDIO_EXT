import { HomePage } from "../src/pages/Index";
import {
  setOrientation,
  getOrientation,
  canRotateScreen,
  hideKeyboard,
  isKeyboardShown,
  setFontScale,
  setDarkMode,
} from "../src/utils/device";

describe("Screen Dynamics & OS Fragmentation", () => {

  describe("Screen Orientation", () => {
    let rotationSupported = true;

    before(async function () {
      rotationSupported = await canRotateScreen();
      if (!rotationSupported) {
        console.warn("Skipping orientation tests: rotation is locked on this device/emulator.");
        this.skip();
      }
    });

    afterEach(async () => {
      if (!rotationSupported) return;
      await setOrientation("PORTRAIT");
    });

    it("UI survives rotation to landscape", async () => {
      await setOrientation("LANDSCAPE");
      await browser.pause(2000);

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });

    it("UI survives rotation back to portrait", async () => {
      await setOrientation("LANDSCAPE");
      await browser.pause(1000);
      await setOrientation("PORTRAIT");
      await browser.pause(2000);

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });

    it("UI survives rapid orientation changes", async () => {
      for (let i = 0; i < 4; i++) {
        const target = i % 2 === 0 ? "LANDSCAPE" : "PORTRAIT";
        await setOrientation(target as "LANDSCAPE" | "PORTRAIT");
        await browser.pause(1000);
      }

      const orientation = await getOrientation();
      expect(["PORTRAIT", "LANDSCAPE"]).toContain(orientation);

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });
  });

  describe("On-Screen Keyboard", () => {
    it("keyboard can be triggered and dismissed", async () => {
      const editText = await $(
        `-android uiautomator:new UiSelector().className("android.widget.EditText").instance(0)`,
      );
      const exists = await editText.isExisting();
      if (exists) {
        await editText.click();
        await browser.pause(1000);

        const shown = await isKeyboardShown();
        expect(shown).toBe(true);

        await hideKeyboard();
        await browser.pause(500);

        const hidden = !(await isKeyboardShown());
        expect(hidden).toBe(true);
      } else {
        console.warn("No EditText found on current screen; skipping keyboard test.");
      }
    });

    it("UI elements remain accessible when keyboard is open", async () => {
      const editText = await $(
        `-android uiautomator:new UiSelector().className("android.widget.EditText").instance(0)`,
      );
      const exists = await editText.isExisting();
      if (exists) {
        await editText.click();
        await browser.pause(1000);

        const content = await $("id=android:id/content");
        const contentExists = await content.isExisting();
        expect(contentExists).toBe(true);

        await hideKeyboard();
      }
    });
  });

  describe("System Theme (Dark Mode / Light Mode)", () => {
    afterEach(async () => {
      await setDarkMode(false);
      await browser.pause(1000);
    });

    it("app renders correctly in dark mode", async () => {
      await setDarkMode(true);
      await browser.pause(3000);

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });

    it("app handles toggling dark mode on and off", async () => {
      await setDarkMode(true);
      await browser.pause(2000);
      await setDarkMode(false);
      await browser.pause(2000);

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });
  });

  describe("Font Scaling (Accessibility)", () => {
    afterEach(async () => {
      await setFontScale(1.0);
      await browser.pause(1000);
    });

    it("UI handles 150% font scale without crashing", async () => {
      await setFontScale(1.5);
      await browser.pause(3000);

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });

    it("UI handles 200% font scale without crashing", async () => {
      await setFontScale(2.0);
      await browser.pause(3000);

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });

    it("UI handles smallest font scale (0.85)", async () => {
      await setFontScale(0.85);
      await browser.pause(3000);

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });
  });
});
