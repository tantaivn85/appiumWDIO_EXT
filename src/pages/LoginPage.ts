import { BasePage } from "./BasePage";

class LoginPage extends BasePage {
  private readonly endUserNameSelector = this.getSelector(
    "ui",
    'new UiSelector().text("Test Fourteen")',
  );
  private readonly closeButtonInBannerSelector = this.getSelector(
    "uiautomator",
    'new UiSelector().description("Custom Icon")',
  );

  private readonly loginButtonSelector = this.getSelector(
    "uiautomator",
    'new UiSelector().className("android.widget.Button").instance(2)',
  );

  //Get Profile Tab using UiAutomator strategy
  private get profileTab() {
    return $(
      this.getSelector("uiautomator", 'new UiSelector().text("Profile")'),
    );
  }

  // Get Email address textbox using UiAutomator strategy
  private get emailAddressTextbox() {
    return $(
      this.getSelector(
        "uiautomator",
        'new UiSelector().className("android.widget.EditText").instance(0)',
      ),
    );
  }

  //Get Password textbox using UiAutomator strategy
  private get passwordTextbox() {
    return $(
      this.getSelector(
        "uiautomator",
        'new UiSelector().className("android.widget.EditText").instance(1)',
      ),
    );
  }

  //Get login button using UiAutomator strategy
  private get loginButton() {
    return $(this.loginButtonSelector);
  }

  //Get End User using UiAutomator strategy
  private get endUserName() {
    return $(this.endUserNameSelector);
  }

  //Get Banner image using UiAutomator strategy
  private get closeButtonInBanner() {
    return $(this.closeButtonInBannerSelector);
  }

  // Method to check if Login button is visible
  async isLoginVisible(): Promise<boolean> {
    return this.isVisibleWithWait(
      this.endUserNameSelector,
      this.defaultTimeoutMs,
    );
  }

  // Method to perform login action
  async login(email: string, password: string): Promise<void> {
    await this.profileTab.click();
    await this.emailAddressTextbox.setValue(email);
    await this.passwordTextbox.setValue(password);
    await this.loginButton.click();
    await this.profileTab.click();

    //Handle potential banner that appears after login
    if (
      await this.isVisibleWithWait(
        this.closeButtonInBannerSelector,
        this.defaultTimeoutMs,
      )
    ) {
      await this.closeButtonInBanner.click();
    }

    // Wait for the end user name to appear as a sign of successful login
    await this.isVisibleWithWait(
      this.endUserNameSelector,
      this.defaultTimeoutMs,
    );
  }
}

export default new LoginPage();
