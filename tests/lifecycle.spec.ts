import { HomePage } from "../src/pages/Index";
import {
  backgroundAndResume,
  killAndRelaunch,
  simulateIncomingCall,
  endSimulatedCall,
} from "../src/utils/device";

describe("App Lifecycle & System Interruptions", () => {

  describe("Background & Foreground", () => {
    it("retains state after backgrounding for 10 seconds", async () => {
      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);

      await backgroundAndResume(10);

      const stillVisible = await HomePage.isHomeVisible();
      expect(stillVisible).toBe(true);
    });

    it("retains state after backgrounding for 30 seconds", async () => {
      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);

      await backgroundAndResume(30);

      const stillVisible = await HomePage.isHomeVisible();
      expect(stillVisible).toBe(true);
    });
  });

  describe("App Tombstoning (Kill & Relaunch)", () => {
    it("recovers gracefully after being killed by the OS", async () => {
      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);

      await killAndRelaunch();

      const recovered = await HomePage.isHomeVisible();
      expect(recovered).toBe(true);
    });
  });

  describe("System Interruptions", () => {
    it("handles an incoming phone call during app usage", async () => {
      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);

      await simulateIncomingCall();
      await browser.pause(5000);

      await endSimulatedCall();
      await browser.pause(2000);

      const stillVisible = await HomePage.isHomeVisible();
      expect(stillVisible).toBe(true);
    });

    it("handles rapid background/foreground cycling", async () => {
      for (let i = 0; i < 5; i++) {
        await backgroundAndResume(2);
        await browser.pause(1000);
      }
      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });
  });
});
