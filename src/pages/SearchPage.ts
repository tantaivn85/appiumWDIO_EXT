import { BasePage } from "./BasePage";

class SearchPage extends BasePage {
  private readonly resultsLoadTimeoutMs = Number(
    process.env.SEARCH_RESULTS_TIMEOUT_MS ?? "30000",
  );

  private readonly searchInputAtHomepageSelector =
    '//android.widget.TextView[contains(@text,"Enter")]';

  private readonly trailsSectionSelector =
    '//android.widget.TextView[@text="Trails"]';

  private readonly resultTitleSelector =
    "//android.widget.ScrollView//android.widget.TextView";

  private readonly excludedResultTokens = new Set([
    "Trails",
    "Activities",
    "Stay",
    "Marathon",
    "Eco Zone",
    "Heritage",
    "Eat Local",
    "Aid",
    "Nearby",
    "Popular",
    "Latest",
    "All",
    "Profile",
    "Explore",
    "Record",
    "TrackMate",
    "View more",
    "Description",
    "Map",
    "Start",
    "Start this trail",
    "Driving",
    "See translation",
    "Enter",
    "Enter ",
    "a trail name",
  ]);

  private get searchInputAtHomepage() {
    return $(this.searchInputAtHomepageSelector);
  }

  private getTrailTitleSelector(trailTitle: string): string {
    return this.getSelector(
      "uiautomator",
      `new UiSelector().text("${trailTitle.replace(/"/g, '\\"')}")`,
    );
  }

  private isTrailCandidate(text: string): boolean {
    if (!text) {
      return false;
    }

    const normalized = text.trim();

    if (!normalized || this.excludedResultTokens.has(normalized)) {
      return false;
    }

    if (/^\d+\s*$/.test(normalized)) {
      return false;
    }

    if (/^\d+(?:\.\d+)?\s+\(\d+\)$/.test(normalized)) {
      return false;
    }

    if (normalized.includes("Vietnam")) {
      return false;
    }

    if (normalized.toLowerCase() === "custom icon") {
      return false;
    }

    return true;
  }

  private extractTrailCandidates(source: string): string[] {
    const values = [
      ...Array.from(source.matchAll(/text="([^"]+)"/g), (m) => m[1].trim()),
      ...Array.from(source.matchAll(/content-desc="([^"]+)"/g), (m) =>
        m[1].trim(),
      ),
    ];

    const uniqueCandidates: string[] = [];
    for (const value of values) {
      if (!this.isTrailCandidate(value)) {
        continue;
      }
      if (!uniqueCandidates.includes(value)) {
        uniqueCandidates.push(value);
      }
    }

    return uniqueCandidates;
  }

  private async getFirstTrailTitle(): Promise<string> {
    const deadline = Date.now() + this.resultsLoadTimeoutMs;

    while (Date.now() < deadline) {
      const source = await browser.getPageSource();
      const startIndex = source.lastIndexOf('text="Trails"');
      const searchableSource = startIndex >= 0 ? source.slice(startIndex) : source;
      const candidates = this.extractTrailCandidates(searchableSource);

      if (candidates.length > 0) {
        return candidates[0];
      }

      await browser.pause(500);
    }

    throw new Error("First trail did not load on the search page.");
  }

  async openSearch(): Promise<void> {
    const searchInput = await this.searchInputAtHomepage;
    await searchInput.waitForDisplayed({ timeout: this.defaultTimeoutMs });
    await searchInput.click();
  }

  async waitForFirstTrail(): Promise<void> {
    await this.isVisibleWithWait(this.trailsSectionSelector, this.defaultTimeoutMs);
    await this.getFirstTrailTitle();
  }

  async openFirstTrail(): Promise<string> {
    const trailTitle = await this.getFirstTrailTitle();

    // Prefer direct title click; fallback to the first visible item in the list.
    const trailTitleElement = await $(this.getTrailTitleSelector(trailTitle));
    if (await trailTitleElement.isExisting()) {
      await trailTitleElement.waitForDisplayed({ timeout: this.defaultTimeoutMs });
      await trailTitleElement.click();
      return trailTitle;
    }

    const trailItems = await $$(this.resultTitleSelector);
    for (const item of trailItems) {
      const text = (await item.getText()).trim();
      if (!this.isTrailCandidate(text)) {
        continue;
      }

      await item.click();
      return text;
    }

    throw new Error("Trail loaded but no clickable trail title was found.");
  }

  async searchForTrail(): Promise<string> {
    await this.openSearch();
    await this.waitForFirstTrail();
    return this.openFirstTrail();
  }

  async isSearchInputVisible(): Promise<boolean> {
    return this.isVisibleWithWait(
      this.searchInputAtHomepageSelector,
      this.defaultTimeoutMs,
    );
  }
}

export default new SearchPage();
