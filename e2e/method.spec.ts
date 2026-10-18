import { expect, test } from '@playwright/test'

test('method page states the advocacy purpose and the source-of-truth rule', async ({ page }) => {
  await page.goto('/#/method')
  await expect(page.getByRole('heading', { level: 1, name: 'How we know' })).toBeVisible()
  await expect(page.getByText('This is an advocacy project')).toBeVisible()
  await expect(page.getByText(/National\s+Environment Agency/)).toBeVisible()
})

test('method page lists data credits and the evidence scale', async ({ page }) => {
  await page.goto('/#/method')
  await expect(page.getByText('Singapore Open Data Licence version 1.0')).toBeVisible()
  await expect(page.getByText('OpenFreeMap')).toBeVisible()
  await expect(page.getByText('Burn scar detected inside concession')).toBeVisible()
  await expect(page.getByText('Found liable by a court')).toBeVisible()
})

test('home links to the method page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'How we know' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'How we know' })).toBeVisible()
})
