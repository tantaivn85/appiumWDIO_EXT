import type { ChainablePromiseElement } from "webdriverio";

type AnyElement = WebdriverIO.Element | ChainablePromiseElement | any;

/** Swipe from one point to another using W3C Actions */
export async function swipe(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  durationMs = 800,
): Promise<void> {
  await browser.action("pointer", {
    parameters: { pointerType: "touch" },
  })
    .move({ x: startX, y: startY })
    .down()
    .pause(10)
    .move({ x: endX, y: endY, duration: durationMs })
    .up()
    .perform();
}

/** Swipe down (scroll up) in the center of the screen */
export async function swipeDown(durationMs = 800): Promise<void> {
  const { width, height } = await browser.getWindowSize();
  const centerX = Math.floor(width / 2);
  const startY = Math.floor(height * 0.7);
  const endY = Math.floor(height * 0.3);
  await swipe(centerX, startY, centerX, endY, durationMs);
}

/** Swipe up (scroll down) in the center of the screen */
export async function swipeUp(durationMs = 800): Promise<void> {
  const { width, height } = await browser.getWindowSize();
  const centerX = Math.floor(width / 2);
  const startY = Math.floor(height * 0.3);
  const endY = Math.floor(height * 0.7);
  await swipe(centerX, startY, centerX, endY, durationMs);
}

/** Swipe left (e.g. carousel next) */
export async function swipeLeft(durationMs = 800): Promise<void> {
  const { width, height } = await browser.getWindowSize();
  const centerY = Math.floor(height / 2);
  const startX = Math.floor(width * 0.8);
  const endX = Math.floor(width * 0.2);
  await swipe(startX, centerY, endX, centerY, durationMs);
}

/** Swipe right (e.g. back gesture or carousel previous) */
export async function swipeRight(durationMs = 800): Promise<void> {
  const { width, height } = await browser.getWindowSize();
  const centerY = Math.floor(height / 2);
  const startX = Math.floor(width * 0.2);
  const endX = Math.floor(width * 0.8);
  await swipe(startX, centerY, endX, centerY, durationMs);
}

/** Pull-to-refresh: quick swipe down from near top */
export async function pullToRefresh(): Promise<void> {
  const { width, height } = await browser.getWindowSize();
  const centerX = Math.floor(width / 2);
  const startY = Math.floor(height * 0.2);
  const endY = Math.floor(height * 0.7);
  await swipe(centerX, startY, centerX, endY, 500);
}

/** Long press on an element */
export async function longPress(
  element: AnyElement,
  durationMs = 1500,
): Promise<void> {
  const location = await element.getLocation();
  const size = await element.getSize();
  const centerX = Math.floor(location.x + size.width / 2);
  const centerY = Math.floor(location.y + size.height / 2);

  await browser.action("pointer", {
    parameters: { pointerType: "touch" },
  })
    .move({ x: centerX, y: centerY })
    .down()
    .pause(durationMs)
    .up()
    .perform();
}

/** Pinch-to-zoom (in or out) using two-finger gestures */
export async function pinchZoom(
  direction: "in" | "out",
  durationMs = 800,
): Promise<void> {
  const { width, height } = await browser.getWindowSize();
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const offset = 150;

  if (direction === "out") {
    await browser
      .action("pointer", { parameters: { pointerType: "touch" } })
      .move({ x: centerX - 10, y: centerY })
      .down()
      .move({ x: centerX - offset, y: centerY - offset, duration: durationMs })
      .up()
      .perform();

    await browser
      .action("pointer", { parameters: { pointerType: "touch" } })
      .move({ x: centerX + 10, y: centerY })
      .down()
      .move({ x: centerX + offset, y: centerY + offset, duration: durationMs })
      .up()
      .perform();
  } else {
    await browser
      .action("pointer", { parameters: { pointerType: "touch" } })
      .move({ x: centerX - offset, y: centerY - offset })
      .down()
      .move({ x: centerX - 10, y: centerY, duration: durationMs })
      .up()
      .perform();

    await browser
      .action("pointer", { parameters: { pointerType: "touch" } })
      .move({ x: centerX + offset, y: centerY + offset })
      .down()
      .move({ x: centerX + 10, y: centerY, duration: durationMs })
      .up()
      .perform();
  }
}

/** Double tap on an element */
export async function doubleTap(
  element: AnyElement,
): Promise<void> {
  const location = await element.getLocation();
  const size = await element.getSize();
  const centerX = Math.floor(location.x + size.width / 2);
  const centerY = Math.floor(location.y + size.height / 2);

  await browser.action("pointer", {
    parameters: { pointerType: "touch" },
  })
    .move({ x: centerX, y: centerY })
    .down()
    .up()
    .pause(100)
    .down()
    .up()
    .perform();
}
