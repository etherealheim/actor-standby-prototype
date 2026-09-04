import { expect, test } from '@playwright/test';

/**
 * The two Actor detail pages outside the Console navigation prototype: the Console
 * Actor-info page (`?view=actor-info`) and the public apify.com page (`?view=store`).
 * Both carry the same Interface tab, split into Input and Server.
 */

const sections = (page: import('@playwright/test').Page) =>
  page.locator('[aria-label="Interface sections"] button');

async function openInterface(page: import('@playwright/test').Page, view: 'actor-info' | 'store') {
  await page.goto(`/?view=${view}`);
  await page.locator('[role="tab"]', { hasText: 'Interface' }).click();
  await expect(sections(page)).toHaveText(['Input', 'Server']);
}

for (const view of ['actor-info', 'store'] as const) {
  test.describe(`Interface tab — ${view}`, () => {
    test('opens on Input and lists the input fields', async ({ page }) => {
      await openInterface(page, view);

      await expect(sections(page).filter({ hasText: 'Input' })).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByText('startUrls')).toBeVisible();
      await expect(page.getByText('Required').first()).toBeVisible();
    });

    test('Server shows the endpoints and the MCP section', async ({ page }) => {
      await openInterface(page, view);
      await sections(page).filter({ hasText: 'Server' }).click();

      await expect(sections(page).filter({ hasText: 'Server' })).toHaveAttribute('aria-pressed', 'true');
      for (const path of ['/search', '/extract', '/health']) {
        await expect(page.getByText(path, { exact: true })).toBeVisible();
      }
      await expect(page.getByText('search_contacts')).toBeVisible();
      await expect(page.getByText('The same server, described for agents.', { exact: false }))
        .toBeVisible();
    });
  });
}

test.describe('Public store page', () => {
  test('has the apify.com chrome and not the Console sidebar', async ({ page }) => {
    await page.goto('/?view=store');

    await expect(page.locator('[aria-label="Public store page"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go to Apify Store' })).toBeVisible();
    await expect(page.getByText('Contact sales')).toBeVisible();
    // The Console left nav belongs to the other page.
    await expect(page.getByRole('link', { name: 'Saved tasks' })).toHaveCount(0);
  });

  test('carries the full public tab row', async ({ page }) => {
    await page.goto('/?view=store');

    await expect(page.locator('[aria-label="Actor page sections"] [role="tab"]')).toHaveText([
      'README', 'Interface', 'Pricing', 'Service', 'API', 'Source code',
      'Reviews', 'Issues', 'Changelog', 'Tasks3',
    ]);
  });

  test('is reachable from the Console page and back', async ({ page }) => {
    await page.goto('/?view=actor-info');
    await page.getByRole('button', { name: 'View public page' }).click();

    await expect(page).toHaveURL(/view=store/);
    await expect(page.locator('[aria-label="Public store page"]')).toBeVisible();

    await page.getByRole('button', { name: 'Go to Apify Store' }).click();
    await expect(page).not.toHaveURL(/view=/);
    await expect(page.locator('aside[aria-label="Navigation design options"]')).toBeVisible();
  });
});
