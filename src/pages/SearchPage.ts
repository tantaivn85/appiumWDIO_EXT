import { BasePage } from "./BasePage";

class SearchPage extends BasePage {
  // Declare selectors for search input and results using UiAutomator strategy
  private readonly searchResultsSelector = this.getSelector(
    "uiautomator",
    'new UiSelector().className("android.view.View").instance(22)',
  );

  private readonly searchInputAtHomepageSelector = this.getSelector(
    "uiautomator",
    'new UiSelector().className("android.view.View").instance(13)',
  );

  private readonly searchInputAtSearchPageSelector = this.getSelector(
    "uiautomator",
    'new UiSelector().text("Enter ")',
  );

  private readonly searchInputAtEditTextSimpleSelector = this.getSelector(
    "xpath",
    "//android.widget.EditText",
  );

  private readonly searchInputAtEditTextSelector = this.getSelector(
    "uiautomator",
    'new UiSelector().className("android.widget.EditText").instance(1)',
  );

  // Get Search Input field at Home page using UiAutomator strategy
  private get searchInputAtHomepage() {
    return $(this.searchInputAtHomepageSelector);
  }

  // Get Search Input field at Search page using UiAutomator strategy
  private get searchInputAtSearchPage() {
    return $(this.searchInputAtSearchPageSelector);
  }

  // Get Search Input field at EditText using UiAutomator strategy
  private get searchInputAtEditText() {
    return $(this.searchInputAtEditTextSelector);
  }

  // Get Search Input field at EditText using simple XPath strategy
  private get searchInputAtEditTextSimple() {
    return $(this.searchInputAtEditTextSimpleSelector);
  }

  // Get search results container using UiAutomator strategy
  private get searchResultsContainer() {
    return $(this.searchResultsSelector);
  }

  // Method to perform search action
  async searchForTrail(keyword: string): Promise<void> {
    // Wait for and click search input at homepage
    await this.searchInputAtHomepage.click();
    await browser.pause(2000);

    // Wait for and click search input at search page
    await this.searchInputAtSearchPage.click();
    await browser.pause(2000);

    // Wait for and interact with EditText input
    await this.searchInputAtEditTextSimple.click();
    await this.searchInputAtEditText.setValue(keyword);
    await browser.pause(1000);
  }

  // Method to check if search input is visible
  async isSearchInputVisible(): Promise<boolean> {
    return this.isVisibleWithWait(
      this.searchInputAtHomepageSelector,
      this.defaultTimeoutMs,
    );
  }

  // Method to check if search results are visible
  async areSearchResultsVisible(): Promise<boolean> {
    return this.isVisibleWithWait(
      this.searchResultsSelector,
      this.defaultTimeoutMs,
    );
  }
}

export default new SearchPage();
