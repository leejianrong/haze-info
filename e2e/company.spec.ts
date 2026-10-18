import { expect, test } from '@playwright/test'

test('home links to the company profile', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'First Resources' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'First Resources' })).toBeVisible()
})

test('a hard refresh on the company route still works', async ({ page }) => {
  await page.goto('/#/company/first-resources')
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'First Resources' })).toBeVisible()
})

test('every stat opens its source, as-of date and method', async ({ page }) => {
  await page.goto('/#/company/first-resources')
  const tags = page.getByRole('button', { name: 'source' })
  const count = await tags.count()
  expect(count).toBeGreaterThanOrEqual(3)
  const first = tags.first()
  await first.click()
  const receipt = page.locator('dl.receipt:visible').first()
  await expect(receipt).toContainText('Source')
  await expect(receipt).toContainText('As of')
  await expect(receipt).toContainText('Method')
})

test('the allegation status reads as evidence, with the company response beside it', async ({
  page,
}) => {
  await page.goto('/#/company/first-resources')
  await expect(page.getByText('Burn scar detected inside concession')).toBeVisible()
  await expect(page.getByText('What the company says')).toBeVisible()
  await expect(page.locator('body')).not.toContainText(/caused the haze/i)
})

test('financials are labelled as the parent group, not the subsidiary', async ({ page }) => {
  await page.goto('/#/company/first-resources')
  await expect(page.getByText(/Group figures, not the subsidiary/)).toBeVisible()
})

test('layout fits a 360px phone without sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.goto('/#/company/first-resources')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})
