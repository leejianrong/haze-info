import { expect, test } from '@playwright/test'

const STYLE = '**/tiles.openfreemap.org/styles/**'
const blankStyle = {
  version: 8,
  sources: {},
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#dde3e1' } }],
}

test.beforeEach(async ({ page }) => {
  await page.route(STYLE, (route) => route.fulfill({ json: blankStyle }))
  await page.route('**/api-open.data.gov.sg/**', (route) => route.abort())
})

test('scrolling to a later chapter updates the active chapter and the map focus', async ({
  page,
}) => {
  await page.goto('/')
  const story = page.locator('.story')
  const map = page.getByRole('region', { name: 'Map of fire hotspots' })
  await expect(story).toHaveAttribute('data-active-chapter', 'source')
  const before = await map.getAttribute('data-focus')
  await page.locator('#people').scrollIntoViewIfNeeded()
  await page.locator('#people h2').scrollIntoViewIfNeeded()
  await expect(story).toHaveAttribute('data-active-chapter', 'people')
  await expect(map).not.toHaveAttribute('data-focus', before!)
})

test('chapter buttons scroll to their chapter', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Who holds the land' }).click()
  await expect(page.locator('.story')).toHaveAttribute('data-active-chapter', 'companies')
})

test('reduced motion makes the map jump instead of fly', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByRole('region', { name: 'Map of fire hotspots' })).toHaveAttribute(
    'data-motion',
    'none',
  )
})

test('on a 360px phone the map stays pinned while the chapters scroll, without sideways scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.goto('/')
  await page.locator('#companies h2').scrollIntoViewIfNeeded()
  const top = await page.locator('.pin').evaluate((el) => el.getBoundingClientRect().top)
  expect(top).toBeLessThan(80)
  expect(top).toBeGreaterThanOrEqual(0)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})
