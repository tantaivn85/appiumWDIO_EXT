export abstract class BasePage {
  // Common timeout for element waits, can be overridden by individual methods if needed
  protected readonly defaultTimeoutMs = Number(
    process.env.HOME_LOCATOR_TIMEOUT ?? "10000",
  );

  /**
   * Converts strategy + value into a WDIO-compatible selector
   */
  protected getSelector(strategy: string, value: string): string {
    switch (strategy.toLowerCase()) {
      case "accessibility id":
      case "accessibility":
        return `~${value}`;
      case "id":
        return `id=${value}`;
      case "xpath":
        return value; // WDIO detects // automatically
      case "css":
        return value; // Standard CSS selector
      case "uiautomator":
        return `-android uiautomator:${value}`;
      default:
        return value;
    }
  }

  /**
   * Reusable wrapper to find an element with a custom wait
   */
  async getElement(selector: string, timeout = 10000) {
    const el = await $(selector);
    await el.waitForExist({ timeout });
    return el;
  }

  /**
   * Verification helper used by all pages
   */
  async isVisible(selector: string): Promise<boolean> {
    try {
      const el = await $(selector);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Waits for element to exist and be visible, then returns it. Useful for actions.
   */
  async isVisibleWithWait(selector: string, timeout = this.defaultTimeoutMs) {
    try {
      const el = await $(selector);
      await el.waitForExist({ timeout });
      await el.waitForDisplayed({ timeout });
      return true;
    } catch {
      return false;
    }
  }
}
