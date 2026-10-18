import { expect, test } from '@playwright/test'

const STYLE = '**/tiles.openfreemap.org/styles/**'
const blankStyle = {
  version: 8,
  sources: {},
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#dde3e1' } }],
}

test('map loads at 360px and the hotspot toggle works', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.route(STYLE, (route) => route.fulfill({ json: blankStyle }))
  await page.goto('/')
  const map = page.getByRole('region', { name: 'Map of fire hotspots' })
  await expect(map).toHaveAttribute('data-status', 'ready')
  await expect(map.locator('canvas')).toBeVisible()
  const toggle = map.getByLabel('Hotspots')
  await expect(map).toHaveAttribute('data-hotspots-visible', 'true')
  await toggle.uncheck()
  await expect(map).toHaveAttribute('data-hotspots-visible', 'false')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})

test('with the basemap blocked the page still shows a message and its other content', async ({
  page,
}) => {
  await page.route(STYLE, (route) => route.abort())
  await page.goto('/')
  const map = page.getByRole('region', { name: 'Map of fire hotspots' })
  await expect(map).toHaveAttribute('data-status', 'unavailable')
  await expect(map).toContainText('The map could not load')
  await expect(page.getByRole('heading', { level: 1, name: 'Haze Info' })).toBeVisible()
})
