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
  await page.keyboard.press('Shift')
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
  await page.keyboard.press('Shift')
  await expect(map).toHaveAttribute('data-status', 'unavailable')
  await expect(map).toContainText('The map could not load')
  await expect(page.getByRole('heading', { level: 1, name: 'Haze Info' })).toBeVisible()
})

test('the map stays a light static schematic until the reader interacts', async ({ page }) => {
  let styleRequests = 0
  await page.route(STYLE, (route) => {
    styleRequests++
    return route.fulfill({ json: blankStyle })
  })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const map = page.getByRole('region', { name: 'Map of fire hotspots' })
  await expect(map).toHaveAttribute('data-status', 'idle')
  await expect(map.getByRole('img', { name: /Schematic of Sumatra/ })).toBeVisible()
  expect(styleRequests).toBe(0)
  await map.getByRole('button', { name: 'Load the interactive map' }).click()
  await expect(map).toHaveAttribute('data-status', 'ready')
  expect(styleRequests).toBeGreaterThan(0)
})

test('the hotspot snapshot is loaded at runtime and its count and fetch time are shown', async ({
  page,
}) => {
  await page.route(STYLE, (route) => route.fulfill({ json: blankStyle }))
  await page.route('**/hotspots.json', (route) =>
    route.fulfill({
      json: {
        asOf: '2026-10-18T10:00:00.000Z',
        source: 'NASA FIRMS test',
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [111.2, -2.5] },
            properties: {},
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [102.4, 0.3] },
            properties: {},
          },
        ],
      },
    }),
  )
  await page.goto('/')
  const map = page.getByRole('region', { name: 'Map of fire hotspots' })
  await page.keyboard.press('Shift')
  await expect(map).toHaveAttribute('data-status', 'ready')
  await expect(map).toHaveAttribute('data-hotspot-count', '2')
  await expect(map).toContainText('2 hotspots in the last 2 days, fetched 18 Oct, 18:00 SGT')
})

test('with no snapshot file the map says none has been published', async ({ page }) => {
  await page.route(STYLE, (route) => route.fulfill({ json: blankStyle }))
  await page.route('**/hotspots.json', (route) => route.fulfill({ status: 404, body: 'no' }))
  await page.goto('/')
  const map = page.getByRole('region', { name: 'Map of fire hotspots' })
  await page.keyboard.press('Shift')
  await expect(map).toHaveAttribute('data-status', 'ready')
  await expect(map).toContainText('No hotspot snapshot has been published yet')
})
