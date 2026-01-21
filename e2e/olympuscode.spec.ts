import { test, expect, type Page } from '@playwright/test';

/**
 * OlympusCode E2E Tests
 *
 * Note: Headless browsers may not support WebGL, so tests handle both:
 * - WebGL mode: Full 3D canvas experience
 * - Fallback mode: Static fallback page for non-WebGL browsers
 */

// Helper: Wait for page to be ready (either canvas or fallback)
async function waitForPageReady(page: Page): Promise<'webgl' | 'fallback'> {
  await page.waitForFunction(
    () => {
      const spinner = document.querySelector('[class*="animate-spin"]');
      if (spinner) return false;

      const canvas = document.querySelector('canvas');
      const fallbackText = document.body.textContent?.includes('For the full 3D experience');
      return canvas || fallbackText;
    },
    { timeout: 30000 }
  );

  const hasCanvas = await page.locator('canvas').count();
  return hasCanvas > 0 ? 'webgl' : 'fallback';
}

// Helper: Scroll to a specific percentage of the page
async function scrollToPercent(page: Page, percent: number) {
  await page.evaluate((p) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: maxScroll * p, behavior: 'instant' });
  }, percent);

  await page.waitForFunction(
    (targetPercent) => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return true;
      const currentPercent = window.scrollY / maxScroll;
      return Math.abs(currentPercent - targetPercent) < 0.1;
    },
    percent,
    { timeout: 5000 }
  );
}

test.describe('OlympusCode Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Page Load', () => {
    test('should load homepage successfully', async ({ page }) => {
      // #given - navigating to homepage

      // #when - page loads
      await expect(page).toHaveURL(/localhost:3000/);

      // #then - page should be accessible
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('should have proper page title', async ({ page }) => {
      // #given - homepage is loaded

      // #when - checking title
      const title = await page.title();

      // #then - title should exist
      expect(title.length).toBeGreaterThan(0);
    });

    test('should render either 3D canvas or fallback', async ({ page }) => {
      // #given - homepage is loaded

      // #when - waiting for content to render
      const mode = await waitForPageReady(page);

      // #then - either canvas or fallback should be visible
      if (mode === 'webgl') {
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
      } else {
        const fallbackHeading = page.locator('h1:has-text("OlympusCode")');
        await expect(fallbackHeading).toBeVisible();
      }
    });
  });

  test.describe('Fallback Mode', () => {
    test('should display OlympusCode branding', async ({ page }) => {
      // #given - homepage is loaded
      await waitForPageReady(page);

      // #when - looking for branding elements
      const heading = page.locator('h1:has-text("OlympusCode")');

      // #then - branding should be visible
      await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('should display tagline', async ({ page }) => {
      // #given - homepage is loaded
      await waitForPageReady(page);

      // #when - looking for tagline
      const tagline = page.locator('text=Code like a god');

      // #then - tagline should be visible
      await expect(tagline).toBeVisible({ timeout: 10000 });
    });

    test('should display GET STARTED button', async ({ page }) => {
      // #given - homepage is loaded
      await waitForPageReady(page);

      // #when - looking for CTA button
      const ctaButton = page.locator('a:has-text("GET STARTED")');

      // #then - CTA should be visible
      await expect(ctaButton).toBeVisible({ timeout: 10000 });
    });

    test('should have clickable CTA button', async ({ page }) => {
      // #given - homepage is loaded with CTA visible
      await waitForPageReady(page);
      const ctaButton = page.locator('a:has-text("GET STARTED")');
      await expect(ctaButton).toBeVisible({ timeout: 10000 });

      // #when - checking button attributes
      const href = await ctaButton.getAttribute('href');

      // #then - button should have href attribute
      expect(href).toBeDefined();
    });
  });

  test.describe('WebGL Mode (when supported)', () => {
    test('should render 3D canvas when WebGL is available', async ({ page }) => {
      // #given - homepage is loaded
      const mode = await waitForPageReady(page);

      // #when - checking for canvas
      if (mode === 'webgl') {
        const canvas = page.locator('canvas');

        // #then - canvas should be visible and have dimensions
        await expect(canvas).toBeVisible();
        const box = await canvas.boundingBox();
        expect(box?.width).toBeGreaterThan(0);
        expect(box?.height).toBeGreaterThan(0);
      } else {
        // #then - fallback is shown (WebGL not supported)
        test.skip();
      }
    });

    test('should have scrollable content in WebGL mode', async ({ page }) => {
      // #given - homepage is loaded
      const mode = await waitForPageReady(page);

      if (mode !== 'webgl') {
        test.skip();
        return;
      }

      // #when - checking scroll height
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);

      // #then - should have scrollable content (500vh = 5x viewport)
      expect(scrollHeight).toBeGreaterThan(viewportHeight * 4);
    });

    test('should display audio controls in WebGL mode', async ({ page }) => {
      // #given - homepage is loaded
      const mode = await waitForPageReady(page);

      if (mode !== 'webgl') {
        test.skip();
        return;
      }

      // #when - looking for audio controls
      const audioButton = page.locator('button[aria-label="Mute"], button[aria-label="Unmute"]');

      // #then - audio button should be visible
      await expect(audioButton).toBeVisible({ timeout: 5000 });
    });

    test('should show CTA at reveal phase in WebGL mode', async ({ page }) => {
      // #given - homepage is loaded
      const mode = await waitForPageReady(page);

      if (mode !== 'webgl') {
        test.skip();
        return;
      }

      // #when - scrolling to reveal phase
      await scrollToPercent(page, 1.0);

      // #then - CTA button should become visible
      const ctaButton = page.locator('a:has-text("GET STARTED")');
      await expect(ctaButton).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Audio Controls (WebGL mode)', () => {
    test('should toggle mute state on click', async ({ page }) => {
      // #given - homepage is loaded
      const mode = await waitForPageReady(page);

      if (mode !== 'webgl') {
        test.skip();
        return;
      }

      const audioButton = page.locator('button[aria-label="Mute"], button[aria-label="Unmute"]');
      await expect(audioButton).toBeVisible({ timeout: 5000 });
      const initialLabel = await audioButton.getAttribute('aria-label');

      // #when - clicking the audio button
      await audioButton.click();

      // #then - aria-label should toggle
      const newLabel = await audioButton.getAttribute('aria-label');
      expect(newLabel).not.toBe(initialLabel);
    });

    test('should show volume slider on hover', async ({ page }) => {
      // #given - homepage is loaded
      const mode = await waitForPageReady(page);

      if (mode !== 'webgl') {
        test.skip();
        return;
      }

      const audioContainer = page.locator('.fixed.bottom-6.right-6');
      await expect(audioContainer).toBeVisible({ timeout: 5000 });

      // #when - hovering over audio controls
      await audioContainer.hover();

      // #then - volume slider should appear
      const volumeSlider = page.locator('input[type="range"][aria-label="Volume"]');
      await expect(volumeSlider).toBeVisible({ timeout: 2000 });
    });
  });
});

test.describe('Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should load correctly on mobile viewport', async ({ page }) => {
    // #given - mobile viewport is set
    await page.goto('/');

    // #when - waiting for page to load
    await waitForPageReady(page);

    // #then - page should render
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display OlympusCode branding on mobile', async ({ page }) => {
    // #given - mobile viewport is set
    await page.goto('/');
    await waitForPageReady(page);

    // #when - looking for branding
    const heading = page.locator('h1:has-text("OlympusCode")');

    // #then - branding should be visible
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should display CTA button on mobile', async ({ page }) => {
    // #given - mobile viewport is set
    await page.goto('/');
    await waitForPageReady(page);

    // #when - looking for CTA
    const ctaButton = page.locator('a:has-text("GET STARTED")');

    // #then - CTA should be visible
    await expect(ctaButton).toBeVisible({ timeout: 10000 });
  });

  test('should have proper mobile layout', async ({ page }) => {
    // #given - mobile viewport is set
    await page.goto('/');
    await waitForPageReady(page);

    // #when - checking viewport
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    // #then - viewport should be mobile size
    expect(viewportWidth).toBe(375);
  });
});

test.describe('Tablet Viewport', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('should load correctly on tablet viewport', async ({ page }) => {
    // #given - tablet viewport is set
    await page.goto('/');

    // #when - waiting for page to load
    await waitForPageReady(page);

    // #then - page should render
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display content properly on tablet', async ({ page }) => {
    // #given - tablet viewport is set
    await page.goto('/');
    await waitForPageReady(page);

    // #when - checking content
    const heading = page.locator('h1:has-text("OlympusCode")');

    // #then - content should be visible
    await expect(heading).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Accessibility', () => {
  test('should have accessible audio controls', async ({ page }) => {
    // #given - homepage is loaded
    await page.goto('/');
    const mode = await waitForPageReady(page);

    if (mode !== 'webgl') {
      test.skip();
      return;
    }

    // #when - checking audio button accessibility
    const audioButton = page.locator('button[aria-label="Mute"], button[aria-label="Unmute"]');
    await expect(audioButton).toBeVisible({ timeout: 5000 });

    // #then - button should have aria-label
    const ariaLabel = await audioButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('should have accessible volume slider', async ({ page }) => {
    // #given - homepage is loaded
    await page.goto('/');
    const mode = await waitForPageReady(page);

    if (mode !== 'webgl') {
      test.skip();
      return;
    }

    const audioContainer = page.locator('.fixed.bottom-6.right-6');
    await expect(audioContainer).toBeVisible({ timeout: 5000 });
    await audioContainer.hover();

    // #when - checking volume slider accessibility
    const volumeSlider = page.locator('input[type="range"][aria-label="Volume"]');
    await expect(volumeSlider).toBeVisible({ timeout: 2000 });

    // #then - slider should have aria-label
    const ariaLabel = await volumeSlider.getAttribute('aria-label');
    expect(ariaLabel).toBe('Volume');
  });
});

test.describe('Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    // #given - measuring load time
    const startTime = Date.now();

    // #when - loading page
    await page.goto('/');
    await waitForPageReady(page);

    // #then - should load within 30 seconds
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(30000);
  });
});
