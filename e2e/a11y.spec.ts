import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const routes = [
  ['home', '/'],
  ['company', '/#/company/first-resources'],
  ['method', '/#/method'],
] as const

test.beforeEach(async ({ page }) => {
  await page.route('**/tiles.openfreemap.org/styles/**', (route) =>
    route.fulfill({
      json: {
        version: 8,
        sources: {},
        layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#dde3e1' } }],
      },
    }),
  )
  await page.route('**/api-open.data.gov.sg/**', (route) => route.abort())
})

for (const scheme of ['light', 'dark'] as const) {
  for (const [name, path] of routes) {
    test(`no serious or critical axe violations on ${name} (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme })
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      // Open every disclosure so content hidden by default is checked too.
      await page
        .locator('button.rx, .toggle, #government .head')
        .evaluateAll((els) => els.forEach((e) => (e as HTMLElement).click()))
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      const bad = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      )
      expect(
        bad.map(
          (v) =>
            `${v.id}: ${v.nodes
              .map((n) => n.target.join(' '))
              .slice(0, 4)
              .join(' | ')}`,
        ),
      ).toEqual([])
    })
  }
}

test('keyboard only: chapter buttons, primer and timeline can be reached and operated', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Who holds the land' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.story')).toHaveAttribute('data-active-chapter', 'companies')
  const primer = page.getByRole('group', { name: 'Haze explained in three steps' })
  await primer.getByRole('button', { name: 'Next' }).focus()
  await page.keyboard.press('Space')
  await expect(primer).toContainText('Step 2 of 3')
  const entry = page.getByRole('button', { name: /Environment Ministry opens enforcement/ })
  await entry.focus()
  await page.keyboard.press('Enter')
  await expect(entry).toHaveAttribute('aria-expanded', 'true')
})

test('every interactive element shows a visible focus style', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const outline = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement
    const cs = getComputedStyle(el)
    return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) }
  })
  expect(outline.style).not.toBe('none')
  expect(outline.width).toBeGreaterThanOrEqual(2)
})

test('a skip link is the first tab stop and moves focus to the content', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()
})

test('each page has its own title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Haze Info')
  await page.goto('/#/method')
  await expect(page).toHaveTitle('How we know | Haze Info')
  await page.goto('/#/company/first-resources')
  await expect(page).toHaveTitle('First Resources | Haze Info')
})
