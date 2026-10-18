import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/tiles.openfreemap.org/styles/**', (route) => route.abort())
  await page.route('**/api-open.data.gov.sg/**', (route) => route.abort())
})

test('entries are in date order and every entry cites at least one source', async ({ page }) => {
  await page.goto('/')
  const heads = page.locator('#government .head')
  const count = await heads.count()
  expect(count).toBeGreaterThanOrEqual(8)
  const sources = page.locator('#government .body .sources')
  expect(await sources.count()).toBe(count)
  for (let i = 0; i < count; i++) {
    expect(await sources.nth(i).locator('a').count()).toBeGreaterThanOrEqual(1)
  }
  const months = await page.locator('#government h3').allTextContents()
  expect(months[0]).toBe('August 2026')
})

test('opening an entry with an official response shows it beside the criticism', async ({
  page,
}) => {
  await page.goto('/')
  // The first entry, cloud-seeding permits, opens by default.
  await expect(page.getByRole('button', { name: /Cloud-seeding permits/ })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
  const panel = page.locator('#government .body:visible')
  await expect(panel.getByText('Commitment')).toBeVisible()
  await expect(panel.getByText('Outcome')).toBeVisible()
  await expect(panel.getByText('Official response')).toBeVisible()
})
