import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/tiles.openfreemap.org/styles/**', (route) => route.abort())
  await page.route('**/api-open.data.gov.sg/**', (route) => route.abort())
})

test('the burned area is shown as a multiple of Singapore and switches measure', async ({
  page,
}) => {
  await page.goto('/')
  const scale = page.locator('.scale[data-measure]')
  await expect(scale.locator('.mult')).toHaveText('3.8')
  await expect(scale.locator('.tile')).toHaveCount(4)
  await scale.getByRole('button', { name: 'Inside concessions' }).click()
  await expect(scale.locator('.mult')).toHaveText('0.9')
  await expect(scale.locator('.tile')).toHaveCount(1)
})

test('sector bars open their sourced figure, and the remainder is labelled as calculated', async ({
  page,
}) => {
  await page.goto('/')
  const scale = page.locator('.scale[data-measure]')
  await scale.getByRole('button', { name: /Mining/ }).click()
  await scale.getByRole('button', { name: 'source' }).last().click()
  await expect(scale.locator('dl.receipt:visible').last()).toContainText('Nusantara Atlas')
  await expect(scale.getByText(/remainder\s+is\s+calculated here/)).toBeVisible()
  await expect(scale.getByRole('button', { name: /Not itemised/ })).toBeDisabled()
})
