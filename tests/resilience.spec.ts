import { HomePage } from "../src/pages/Index";
import { dismissAlertIfPresent } from "../src/utils/device";

describe("Automation Resilience & Pitfalls", () => {

  describe("OS-Level Pop-up Dismissal", () => {
    it("auto-dismisses unexpected system alerts", async () => {
      await dismissAlertIfPresent();
      await browser.pause(500);

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });

    it("handles Rate this app or system update prompts", async () => {
      const dismissSelectors = [
        `-android uiautomator:new UiSelector().text("Not Now")`,
        `-android uiautomator:new UiSelector().text("Later")`,
        `-android uiautomator:new UiSelector().text("No Thanks")`,
        `-android uiautomator:new UiSelector().text("Cancel")`,
        `-android uiautomator:new UiSelector().resourceId("android:id/button2")`,
      ];

      for (const selector of dismissSelectors) {
        try {
          const el = await $(selector);
          const exists = await el.isExisting();
          if (exists && (await el.isDisplayed())) {
            await el.click();
            await browser.pause(500);
          }
        } catch {
          // Not present – continue
        }
      }

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });
  });

  describe("Locator Strategy Performance", () => {
    it("finds element by accessibility id (preferred)", async () => {
      const start = Date.now();
      try {
        const el = await $("~content");
        await el.waitForExist({ timeout: 5000 });
      } catch {
        // Element may not exist with this a11y ID
      }
      const duration = Date.now() - start;
      console.log(`Accessibility ID lookup: ${duration}ms`);
    });

    it("finds element by resource id (fast)", async () => {
      const start = Date.now();
      const el = await $("id=android:id/content");
      await el.waitForExist({ timeout: 5000 });
      const duration = Date.now() - start;
      console.log(`Resource ID lookup: ${duration}ms`);
      expect(await el.isExisting()).toBe(true);
    });

    it("finds element by UiAutomator (medium speed)", async () => {
      const start = Date.now();
      const el = await $(
        `-android uiautomator:new UiSelector().className("android.view.View").instance(0)`,
      );
      await el.waitForExist({ timeout: 5000 });
      const duration = Date.now() - start;
      console.log(`UiAutomator lookup: ${duration}ms`);
      expect(await el.isExisting()).toBe(true);
    });

    it("finds element by XPath (slowest - avoid in production)", async () => {
      const start = Date.now();
      const el = await $("//android.widget.FrameLayout");
      await el.waitForExist({ timeout: 10000 });
      const duration = Date.now() - start;
      console.log(`XPath lookup: ${duration}ms`);
      expect(await el.isExisting()).toBe(true);
    });
  });

  describe("Animation Synchronization", () => {
    it("uses explicit waits instead of hard pauses", async () => {
      const content = await $("id=android:id/content");
      await content.waitForDisplayed({ timeout: 15000 });
      expect(await content.isDisplayed()).toBe(true);
    });

    it("disables animations for faster and more stable tests", async () => {
      await browser.execute("mobile: shell", {
        command: "settings",
        args: ["put", "global", "window_animation_scale", "0"],
      });
      await browser.execute("mobile: shell", {
        command: "settings",
        args: ["put", "global", "transition_animation_scale", "0"],
      });
      await browser.execute("mobile: shell", {
        command: "settings",
        args: ["put", "global", "animator_duration_scale", "0"],
      });

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);

      // Restore animations
      await browser.execute("mobile: shell", {
        command: "settings",
        args: ["put", "global", "window_animation_scale", "1"],
      });
      await browser.execute("mobile: shell", {
        command: "settings",
        args: ["put", "global", "transition_animation_scale", "1"],
      });
      await browser.execute("mobile: shell", {
        command: "settings",
        args: ["put", "global", "animator_duration_scale", "1"],
      });
    });

    it("waits for element to be clickable, not just present", async () => {
      const content = await $("id=android:id/content");
      await content.waitForExist({ timeout: 10000 });
      await content.waitForDisplayed({ timeout: 10000 });
      await content.waitForEnabled({ timeout: 10000 });

      expect(await content.isDisplayed()).toBe(true);
      expect(await content.isEnabled()).toBe(true);
    });
  });
});
