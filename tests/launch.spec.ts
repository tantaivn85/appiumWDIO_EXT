import { DetailPage, HomePage, LoginPage, SearchPage } from "../src/pages/Index";
import { setLocation } from "../src/utils/device";

describe("GPS & Geolocation", () => {
    it("responds to mocked GPS coordinates (Ho Chi Minh City)", async () => {
      await setLocation(10.8231, 106.6297);
      await browser.pause(3000);
      const homeVisible = await HomePage.isHomeVisible();
      expect(homeVisible).toBe(true);
    });
  });

describe("appiumWDIO_EXT app launch: ", () => {
  it("launches the app", async () => {
    const launched = await HomePage.isHomeVisible();
    expect(launched).toBe(true);
  });
});

describe("Login to the app:", () => {
  it("Logs in with valid credentials", async () => {
    await HomePage.closeSkipLink();
    const email = process.env.E2E_EMAIL;
    const password = process.env.E2E_PASSWORD;
    if (!email || !password) {
      throw new Error(
        "Missing E2E_EMAIL and E2E_PASSWORD environment variables for login test.",
      );
    }
    await LoginPage.login(email, password);

    // Real post-login check: login entry element should no longer be visible
    const stillOnLogin = await LoginPage.isLoginVisible();
    expect(stillOnLogin).toBe(false);
  });
});

describe("Navigate to Explore Tab (Home screen):", () => {
  it("Navigates to Explore tab after login", async () => {
    await HomePage.navigateToExplore();
    const searchInputVisible = await SearchPage.isSearchInputVisible();
    expect(searchInputVisible).toBe(true);
    // await browser.pause(5000);
  });
});

describe("Search functionality:", () => {
  it("Performs a search and checks results", async () => {
    const trailTitle = await SearchPage.searchForTrail();
    const detailVisible = await DetailPage.isLoaded(trailTitle);
    expect(detailVisible).toBe(true);
  });
});
