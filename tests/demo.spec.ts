import { test, expect } from '@playwright/test';

test.describe('Demo Test Scenarios', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.globalsqa.com/demo-site/frames-and-windows/');
  })
  test('Scenario one', async ({ page }) => {

    await page.getByRole('tab', { name: 'Open New Window' }).click();
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Click Here' }).click();
    const page1 = await page1Promise;
    await expect(page1).toHaveURL("https://www.globalsqa.com/demo-site/frames-and-windows/#")

  });



  test('Scenario Two', async ({ page, context }) => {
    test.slow()


    // blocking ads
    await context.route("**/*", (request) => {
      request.request().url().includes("https://googleads")
        ? request.abort()
        : request.continue();
      return;
    });

// need to reload page so that ads dnt come again
    await page.reload({ waitUntil: 'networkidle' })
    await page.getByRole('tab', { name: 'iFrame' }).click();

    // we dnt know when iframe will load, so used polling for that

    await expect.poll(async () => {
      const isVisible = await page.frameLocator('iframe[name="globalSqa"]').locator('#current_filter').isVisible()
      console.log(isVisible)
      return isVisible
    }, {

      message: 'Iframe not loading',
      intervals: [5000, 10000],
      timeout: 80000,
    }).toBe(true)
    await page.frameLocator('iframe[name="globalSqa"]').locator('#current_filter').hover()
    await page.waitForTimeout(1000)

    await page.frameLocator('iframe[name="globalSqa"]').locator('#filter_list').getByText('Automation').click({ delay: 4 });
    await page.waitForLoadState('domcontentloaded')

    const box = await page.frameLocator('iframe[name="globalSqa"]').locator('#filter_list').getByText('Automation').boundingBox()
    await page.mouse.move(box?.x! + box?.width! / 2, box?.y! + box?.height! / 2);
    await page.mouse.down();

    await page.waitForTimeout(4000)
    let hiddenCards = await page.frameLocator('iframe[name="globalSqa"]').locator('.isotope-hidden').count()

    // before filtering 9 cards are displayed after filtering 3 are displayed and 6 are hidden
    expect(hiddenCards).toBe(6)

  })


});

