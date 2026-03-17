import { BasePage } from "./BasePage";
class ExplorePage extends BasePage {
  // Get Explore tab using UiAutomator strategy
  private get exploreTab() {
    return $(
      this.getSelector("uiautomator", 'new UiSelector().description("Custom Icon").instance(0)'),
    );
  }

  // Method to navigate to Explore tab
  async navigateToExplore(): Promise<void> {
    await this.exploreTab.click();
  }

}

export default new ExplorePage()
