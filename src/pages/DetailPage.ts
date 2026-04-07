import { BasePage } from "./BasePage";

class DetailPage extends BasePage {
  private readonly detailLoadTimeoutMs = Number(
    process.env.DETAIL_PAGE_TIMEOUT_MS ?? "30000",
  );

  private readonly descriptionSelector =
    '//android.widget.TextView[@text="Description"]';

  private readonly startTrailSelector =
    '//android.widget.TextView[@text="Start this trail"]';

  private readonly mapSelector =
    '//android.widget.TextView[@text="Map"]';

  private readonly drivingSelector =
    '//android.widget.TextView[@text="Driving"]';

  private readonly detailMarkers = [
    this.descriptionSelector,
    this.startTrailSelector,
    this.mapSelector,
    this.drivingSelector,
  ];

  private getTitleSelector(trailTitle: string): string {
    return `//android.widget.TextView[@text="${trailTitle}"]`;
  }

  async isLoaded(trailTitle: string): Promise<boolean> {
    const titleVisible = await this.isVisibleWithWait(this.getTitleSelector(trailTitle), 3000);
    if (titleVisible) {
      return true;
    }

    const deadline = Date.now() + this.detailLoadTimeoutMs;
    while (Date.now() < deadline) {
      for (const marker of this.detailMarkers) {
        if (await this.isVisible(marker)) {
          return true;
        }
      }
      await browser.pause(500);
    }

    return false;
  }
}

export default new DetailPage();