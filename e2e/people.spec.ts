import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/tiles.openfreemap.org/styles/**', (route) => route.abort())
  await page.route('**/api-open.data.gov.sg/**', (route) => route.abort())
})

test('impact stats each name their publisher in a source receipt', async ({ page }) => {
  await page.goto('/')
  const stats = page.locator('#people .impact li')
  expect(await stats.count()).toBeGreaterThanOrEqual(6)
  await stats.first().getByRole('button', { name: 'source' }).click()
  await expect(stats.first().locator('dl.receipt:visible')).toContainText('Bernama')
})

test('where outlets disagree the site states the NEA-reported figure and notes the rest', async ({
  page,
}) => {
  await page.goto('/')
  const peak = page.locator('#people .impact li', { hasText: 'highest 24-hour PSI of 2026' })
  await expect(peak).toContainText('192')
  await peak.getByRole('button', { name: 'source' }).click()
  await expect(peak.locator('dl.receipt:visible')).toContainText('186')
})

test('health guidance links out to official publishers and gives no advice of its own', async ({
  page,
}) => {
  await page.goto('/')
  const guide = page.getByRole('region', { name: 'Official health guidance' })
  await expect(guide).toContainText('do not give medical advice')
  const hrefs = await guide.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))
  expect(hrefs.length).toBeGreaterThanOrEqual(6)
  for (const h of hrefs) expect(h).toMatch(/^https:\/\//)
  await expect(guide).toContainText('World Health Organization')
})

test('companies are ranked by burned hectares, most first', async ({ page }) => {
  await page.goto('/')
  const items = page.locator('#companies .ranking li')
  expect(await items.count()).toBeGreaterThanOrEqual(8)
  const has = await page.locator('#companies .ranking .ha').allTextContents()
  const nums = has.map((t) => Number(t.replace(/[^\d.]/g, '')))
  expect([...nums].sort((a, b) => b - a)).toEqual(nums)
  await expect(items.first()).toContainText('PT Arrtu Energie Resources')
})
