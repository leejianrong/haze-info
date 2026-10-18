import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.route('**/tiles.openfreemap.org/styles/**', (route) => route.abort())
  await page.route('**/api-open.data.gov.sg/**', (route) => route.abort())
})

test('at least three action cards each have a target, a copy button and an outbound contact link', async ({
  page,
}) => {
  await page.goto('/')
  const cards = page.locator('[data-action]')
  expect(await cards.count()).toBeGreaterThanOrEqual(3)
  for (const card of await cards.all()) {
    await expect(card.getByRole('button', { name: 'Copy message' })).toBeVisible()
    await expect(card.locator('.to')).toContainText('To:')
    const link = card.locator('.buttons a')
    const href = (await link.getAttribute('href')) ?? ''
    expect(href).toMatch(/^(https:\/\/|mailto:)/)
  }
})

test('the copied message contains the sourced figure and names its source', async ({ page }) => {
  await page.goto('/')
  const card = page.locator('[data-action="singapore-mse-asean-haze"]')
  await card.getByRole('button', { name: 'Copy message' }).click()
  await expect(card.locator('.status')).toHaveText('Copied')
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toContain('285,914')
  expect(copied).toContain('68,324')
  expect(copied).toContain('Nusantara Atlas')
})

test('company messages state satellite detection and never say a company caused the fires', async ({
  page,
}) => {
  await page.goto('/')
  for (const id of ['first-resources-publish-boundaries', 'sumitomo-forestry-publish-boundaries']) {
    // textContent, not innerText: off-screen chapters are not rendered (content-visibility), so innerText is empty.
    const msg = (await page.locator(`[data-action="${id}"] .msg`).textContent()) ?? ''
    expect(msg).toContain('Satellite data')
    expect(msg).toContain('does not show who started a fire')
    expect(msg).not.toMatch(/caused|responsible for|culprit|started the fire/i)
  }
})

test('the email card builds a mailto link with the message encoded', async ({ page }) => {
  await page.goto('/')
  const href = await page
    .locator('[data-action="indonesia-klh-name-19-companies"] .buttons a')
    .getAttribute('href')
  expect(href).toMatch(/^mailto:layanan@kemenlh\.go\.id\?subject=/)
  expect(decodeURIComponent(href!)).toContain('285,914')
})

test('action cards fit a 360px phone without sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.goto('/')
  await page.locator('#act h2').evaluate((el) => el.scrollIntoView())
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})
