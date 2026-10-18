import { expect, test } from '@playwright/test'

// These run against the e2e build, which adds fictional fixtures from e2e/fixtures/people.
test.beforeEach(async ({ page }) => {
  await page.route('**/tiles.openfreemap.org/styles/**', (route) => route.abort())
  await page.route('**/api-open.data.gov.sg/**', (route) => route.abort())
})

test('a quote shows its date, context and a link to its source', async ({ page }) => {
  await page.goto('/')
  const card = page.locator('[data-person="fixture-director"]')
  await expect(card.locator('blockquote')).toContainText(
    'Hotspots alone do not establish the origin of a fire',
  )
  await expect(card.locator('figcaption')).toContainText('15 Oct 2026')
  await expect(card.locator('figcaption')).toContainText('Fictional statement used in tests.')
  await expect(card.getByRole('link', { name: 'Example News' })).toHaveAttribute(
    'href',
    'https://example.org/statement',
  )
  await expect(card.getByRole('link', { name: 'Company response' })).toBeVisible()
})

test('a translated quote shows the original beside it and says it is translated', async ({
  page,
}) => {
  await page.goto('/')
  const card = page.locator('[data-person="fixture-official"]')
  await expect(card.locator('.translated')).toContainText('Translated from Indonesian')
  await expect(card.locator('.translated')).toContainText(
    'Kami kirim oksigen kalau tidak ada asap.',
  )
})

test('a person without a licensed portrait gets a silhouette, and a portrait shows its credit and licence', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('[data-person="fixture-minister"] .silhouette')).toBeVisible()
  const withPhoto = page.locator('[data-person="fixture-official"]')
  await expect(withPhoto.getByRole('img', { name: 'Portrait of Fixture Official' })).toBeVisible()
  await expect(withPhoto.locator('.credit')).toContainText('Test fixture')
  await expect(withPhoto.locator('.credit')).toContainText('CC0')
})

test('the section says a quote does not show who started a fire, and no criminal styling appears', async ({
  page,
}) => {
  await page.goto('/')
  const section = page.getByRole('region', { name: 'Who said what' })
  await expect(section).toContainText('does not show who started any fire')
  await expect(page.locator('[data-people-section]')).not.toContainText(
    /mugshot|wanted|guilty|suspect/i,
  )
})

test('person cards fit a 360px phone without sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.goto('/')
  await page.locator('[data-person="fixture-official"]').scrollIntoViewIfNeeded()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})
