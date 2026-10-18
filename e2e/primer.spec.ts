import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/tiles.openfreemap.org/styles/**', (route) => route.abort())
  await page.route('**/api-open.data.gov.sg/**', (route) => route.abort())
})

test('the primer steps through three cards with Next and Back', async ({ page }) => {
  await page.goto('/')
  const primer = page.getByRole('group', { name: 'Haze explained in three steps' })
  await expect(primer).toContainText('What haze is, and why it is dangerous')
  await primer.getByRole('button', { name: 'Next' }).click()
  await expect(primer).toContainText('Why peat fires are so hard to put out')
  await primer.getByRole('button', { name: 'Next' }).click()
  await expect(primer).toContainText('Why Singapore and Malaysia breathe Indonesian smoke')
  await expect(primer.getByRole('button', { name: 'Next' })).toBeDisabled()
  await primer.getByRole('button', { name: 'Back' }).click()
  await expect(primer).toContainText('Why peat fires')
})

test('the evidence toggle shows sourced facts with links', async ({ page }) => {
  await page.goto('/')
  const primer = page.getByRole('group', { name: 'Haze explained in three steps' })
  await primer.getByRole('button', { name: 'Show the evidence' }).click()
  await expect(
    primer.getByRole('link', { name: 'World Health Organization' }).first(),
  ).toBeVisible()
  const hrefs = await primer
    .locator('.facts a')
    .evaluateAll((as) => as.map((a) => a.getAttribute('href')))
  expect(hrefs.length).toBeGreaterThanOrEqual(5)
  for (const h of hrefs) expect(h).toMatch(/^https:\/\//)
})

test('the PSI badge shows PM2.5 as a multiple of the WHO guideline', async ({ page }) => {
  await page.goto('/')
  const psi = page.getByRole('region', { name: 'Singapore 24-hour PSI' })
  await expect(psi).toContainText('the WHO guideline for fine particles')
  await expect(psi).toContainText(/\d+(\.\d)?×/)
})
