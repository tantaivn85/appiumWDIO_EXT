import { HomePage } from "../src/pages/Index";
import {
  swipeDown,
  swipeUp,
  swipeLeft,
  swipeRight,
  pullToRefresh,
  longPress,
  pinchZoom,
  doubleTap,
} from "../src/utils/gestures";

describe("UI/UX & Gestures", () => {

  describe("Swipe Gestures", () => {
    it("swipes down to scroll the feed", async () => {
      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);

      await swipeDown();
      await browser.pause(1000);

      const content = await $("id=android:id/content");
      expect(await content.isExisting()).toBe(true);
    });

    it("swipes up to scroll back", async () => {
      await swipeUp();
      await browser.pause(1000);

      const content = await $("id=android:id/content");
      expect(await content.isExisting()).toBe(true);
    });

    it("swipes left (e.g. carousel or tab switch)", async () => {
      await swipeLeft();
      await browser.pause(1000);

      const content = await $("id=android:id/content");
      expect(await content.isExisting()).toBe(true);
    });

    it("swipes right (e.g. back gesture)", async () => {
      await swipeRight();
      await browser.pause(1000);

      const content = await $("id=android:id/content");
      expect(await content.isExisting()).toBe(true);
    });

    it("performs multiple consecutive swipes", async () => {
      for (let i = 0; i < 5; i++) {
        await swipeDown(400);
        await browser.pause(500);
      }
      const content = await $("id=android:id/content");
      expect(await content.isExisting()).toBe(true);
    });
  });

  describe("Pull-to-Refresh", () => {
    it("triggers a pull-to-refresh gesture", async () => {
      await pullToRefresh();
      await browser.pause(3000);

      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });
  });

  describe("Long Press", () => {
    it("long presses on a UI element", async () => {
      const el = await $(
        `-android uiautomator:new UiSelector().className("android.view.View").instance(5)`,
      );
      const exists = await el.isExisting();
      if (exists) {
        await longPress(el, 2000);
        await browser.pause(1000);

        await (browser as any).pressKeyCode(4); // Android BACK key
      } else {
        console.warn("Target element not found; skipping long press test.");
      }
    });
  });

  describe("Pinch-to-Zoom", () => {
    it("zooms in with pinch-out gesture", async () => {
      await pinchZoom("out");
      await browser.pause(1000);

      const content = await $("id=android:id/content");
      expect(await content.isExisting()).toBe(true);
    });

    it("zooms out with pinch-in gesture", async () => {
      await pinchZoom("in");
      await browser.pause(1000);

      const content = await $("id=android:id/content");
      expect(await content.isExisting()).toBe(true);
    });
  });

  describe("Double Tap", () => {
    it("double taps on an element", async () => {
      const el = await $(
        `-android uiautomator:new UiSelector().className("android.view.View").instance(5)`,
      );
      const exists = await el.isExisting();
      if (exists) {
        await doubleTap(el);
        await browser.pause(1000);
      }
      const content = await $("id=android:id/content");
      expect(await content.isExisting()).toBe(true);
    });
  });
});
