import { expect, test } from '@playwright/test'

const PSI = '**/api-open.data.gov.sg/v2/real-time/api/psi'

test('shows a live reading with a timestamp', async ({ page }) => {
  await page.route(PSI, (route) =>
    route.fulfill({
      json: {
        code: 0,
        data: {
          items: [
            {
              timestamp: '2026-10-09T20:00:00+08:00',
              readings: {
                psi_twenty_four_hourly: {
                  north: 120,
                  south: 150,
                  east: 160,
                  west: 170,
                  central: 192,
                },
              },
            },
          ],
        },
      },
    }),
  )
  await page.goto('/')
  const psi = page.getByRole('region', { name: 'Singapore 24-hour PSI' })
  await expect(psi).toHaveAttribute('data-origin', 'live')
  await expect(psi).toContainText('192')
  await expect(psi).toContainText('Unhealthy')
  await expect(psi).toContainText('Live from NEA')
})

test('falls back to the saved reading, labelled, when the request fails', async ({ page }) => {
  await page.route(PSI, (route) => route.abort())
  await page.goto('/')
  const psi = page.getByRole('region', { name: 'Singapore 24-hour PSI' })
  await expect(psi).toHaveAttribute('data-origin', 'snapshot')
  await expect(psi).toContainText('Could not reach NEA')
  await expect(psi.locator('.num')).toHaveText(/\d+/)
})

test('shows the open data licence attribution', async ({ page }) => {
  await page.route(PSI, (route) => route.abort())
  await page.goto('/')
  await expect(page.getByText('Singapore Open Data Licence version 1.0')).toBeVisible()
})
