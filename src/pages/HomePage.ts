import { BasePage } from "./BasePage";

class HomePage extends BasePage {
  private readonly contentSelector = this.getSelector(
    "id",
    "android:id/content",
  );
  private readonly exploreTabSelector = this.getSelector(
    "uiautomator",
    'new UiSelector().text("Explore")',
  );

  private readonly skipLinkSelector = this.getSelector(
    "uiautomator",
    'new UiSelector().text("Skip")',
  );

  // Get main content container using ID strategy
  private get content() {
    return $(this.contentSelector);
  }

  // Get Skip link using UiAutomator strategy
  private get skipLink() {
    return $(this.skipLinkSelector);
  }

  // Method to check if home page content is visible
  async isHomeVisible(): Promise<boolean> {
    return this.isVisibleWithWait(this.contentSelector, this.defaultTimeoutMs);
  }

  // Method to perform login action by clicking Skip link
  async closeSkipLink(): Promise<void> {
    await this.isVisibleWithWait(this.contentSelector, this.defaultTimeoutMs);
    await this.skipLink.click();
  }

  // Method to navigate to Explore tab
  async navigateToExplore(): Promise<void> {
    const exploreTab = await $(this.exploreTabSelector);
    await exploreTab.click();
    // await browser.pause(5000);
  }
}

export default new HomePage();
