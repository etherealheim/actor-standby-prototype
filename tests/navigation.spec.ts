import { expect, test } from '@playwright/test';

import {
  modeSwitcher,
  openPrototype,
  OPTION,
  placeholderText,
  setDock,
  setServerNoun,
  tabStates,
} from './helpers';

test.describe('Option 1 — Detached', () => {
  test('is labelled Detached in the dock', async ({ page }) => {
    await openPrototype(page, OPTION.detached);
    await expect(page.locator('aside[aria-label="Navigation design options"]'))
      .toContainText('Detached');
  });

  test('header meta row lines up with the nav row gutter, switcher or not', async ({ page }) => {
    await openPrototype(page, OPTION.detached);

    const gutters = async () => page.evaluate(() => {
      const left = (el: Element | null | undefined) => (el ? Math.round(el.getBoundingClientRect().left) : null);
      const shield = document.querySelector('[aria-label="Protected Actor"]');
      const switcher = document.querySelector('[data-flow-target="mode-switcher"]');
      const firstTab = document.querySelector('[role="tab"]:not([data-mode])');
      return { meta: left(shield?.parentElement?.firstElementChild), nav: left(switcher ?? firstTab) };
    });

    const withSwitcher = await gutters();
    expect(withSwitcher.meta).toBe(withSwitcher.nav);

    // Run-only hides the switcher, so the Protected Actor tag becomes the first meta item.
    await setDock(page, { run: true, server: false, alwaysShowModes: false });
    expect(await modeSwitcher(page)).toBeNull();

    const withoutSwitcher = await gutters();
    expect(withoutSwitcher.meta).toBe(withoutSwitcher.nav);
    expect(withoutSwitcher.meta).toBe(withSwitcher.meta);
  });
});

test.describe('Integrations under multi-tenant', () => {
  test('is disabled in Server mode and enabled in Run mode', async ({ page }) => {
    await openPrototype(page, OPTION.detached);
    await setDock(page, { multiTenant: true });

    await page.locator('[data-mode="server"]').click();
    expect(await tabStates(page)).toContain('Integrations✗');

    await page.locator('[data-mode="run"]').click();
    expect(await tabStates(page)).toContain('Integrations');
  });

  test('stays disabled in Developer view — it is a capability limit, not a dev gate', async ({ page }) => {
    await openPrototype(page, OPTION.detached);
    await setDock(page, { multiTenant: true, developer: true });
    await page.locator('[data-mode="server"]').click();

    const states = await tabStates(page);
    expect(states).toContain('Integrations✗');
    expect(states).toContain('Runs✗');
    // Builds and Saved tasks are dev-gated, so Developer view brings them back.
    expect(states).toContain('Builds');
    expect(states).toContain('Saved tasks');
  });

  test('moves off Integrations instead of stranding on it', async ({ page }) => {
    await openPrototype(page, OPTION.detached);
    await setDock(page, { multiTenant: false });
    await page.locator('[data-mode="server"]').click();
    await page.locator('[role="tab"]:not([data-mode])', { hasText: 'Integrations' }).click();
    expect(await placeholderText(page)).toContain('Integrations content');

    // Option 1 relabels the endpoints tab to "Endpoints".
    await setDock(page, { multiTenant: true });
    expect(await placeholderText(page)).toContain('Endpoints content');
  });
});

test.describe('Option 3 — Disabled', () => {
  // The bar merges both modes, so anything Run mode can reach stays enabled.
  const runReachable = ['Runs', 'Builds', 'Integrations', 'Saved tasks'];

  test('keeps run-reachable tabs enabled while the Actor supports Run mode', async ({ page }) => {
    await openPrototype(page, OPTION.disabled);
    await setDock(page, { multiTenant: true, run: true, server: true });

    const states = await tabStates(page);
    for (const title of runReachable) expect(states).toContain(title);
  });

  test('disables them only for a multi-tenant, server-only Actor', async ({ page }) => {
    await openPrototype(page, OPTION.disabled);
    await setDock(page, { multiTenant: true, run: false, server: true });

    const states = await tabStates(page);
    for (const title of runReachable) expect(states).toContain(`${title}✗`);
  });

  test('keeps them enabled for a single-tenant, server-only Actor', async ({ page }) => {
    await openPrototype(page, OPTION.disabled);
    await setDock(page, { multiTenant: false, run: false, server: true });

    const states = await tabStates(page);
    for (const title of runReachable) expect(states).toContain(title);
  });

  test('Developer view still ungates Builds and Saved tasks', async ({ page }) => {
    await openPrototype(page, OPTION.disabled);
    await setDock(page, { multiTenant: true, run: false, server: true, developer: true });

    const states = await tabStates(page);
    expect(states).toContain('Builds');
    expect(states).toContain('Saved tasks');
    expect(states).toContain('Runs✗');
    expect(states).toContain('Integrations✗');
  });
});

test.describe('Always show modes', () => {
  for (const option of [OPTION.detached, OPTION.inlineSeparated] as const) {
    test(`option ${option}: hides the switcher when off, disables it when on`, async ({ page }) => {
      await openPrototype(page, option);

      await setDock(page, { run: true, server: false, alwaysShowModes: false });
      expect(await modeSwitcher(page)).toBeNull();

      await setDock(page, { run: true, server: false, alwaysShowModes: true });
      const segments = await modeSwitcher(page);
      expect(segments).not.toBeNull();
      expect(segments).toHaveLength(2);
      expect(segments![0]).toMatchObject({ disabled: false, selected: true });
      expect(segments![1]).toMatchObject({ disabled: true });
    });
  }

  test('option 3: mode tabs are disabled rather than dropped', async ({ page }) => {
    await openPrototype(page, OPTION.disabled);

    await setDock(page, { run: true, server: false, alwaysShowModes: false });
    expect(await tabStates(page)).not.toContain('Server');

    await setDock(page, { run: true, server: false, alwaysShowModes: true });
    expect(await tabStates(page)).toEqual(
      expect.arrayContaining(['Input', 'Server✗', 'MCP✗', 'Requests✗']),
    );

    await setDock(page, { run: false, server: true, alwaysShowModes: true });
    expect(await tabStates(page)).toContain('Input✗');
  });

  test('a disabled mode tab cannot switch the mode', async ({ page }) => {
    await openPrototype(page, OPTION.disabled);
    await setDock(page, { run: false, server: true, alwaysShowModes: true });
    expect(await placeholderText(page)).toContain('Server mode');

    // pointer-events blocks a real click, so force the underlying handler to fire.
    await page.locator('[role="tab"]:not([data-mode])', { hasText: 'Input' })
      .dispatchEvent('click');

    expect(await placeholderText(page)).toContain('Server mode');
  });
});

test.describe('Mode tooltips', () => {
  test('name the mode consistently and never say Standby mode', async ({ page }) => {
    await openPrototype(page, OPTION.detached);
    await page.locator('[data-mode="server"]').hover();

    const tooltip = page.locator('a[href*="docs.apify.com"]').locator('..');
    await expect(tooltip).toBeVisible({ timeout: 5_000 });
    await expect(tooltip).toContainText('Server mode keeps the Actor ready to serve requests.');
    await expect(tooltip).not.toContainText('Standby mode');
  });

  test('link the mode name inline, on one line', async ({ page }) => {
    await openPrototype(page, OPTION.detached);
    await page.locator('[data-mode="run"]').hover();

    const link = page.locator('a[href*="docs.apify.com"]');
    await expect(link).toBeVisible({ timeout: 5_000 });
    await expect(link).toHaveText('Run mode');
    await expect(link).toHaveAttribute('href', 'https://docs.apify.com/platform/actors/running');
    // A blockified link would break the sentence onto its own line.
    await expect(link).toHaveCSS('display', 'inline');
  });

  test('stay open long enough to reach the docs link', async ({ page }) => {
    await openPrototype(page, OPTION.detached);
    await page.locator('[data-mode="server"]').hover();

    const link = page.locator('a[href*="docs.apify.com"]');
    await expect(link).toBeVisible({ timeout: 5_000 });

    await link.hover();
    await expect(link).toBeVisible();
  });
});

test.describe('Mode naming select', () => {
  test('renames the switcher, the tab and the placeholder in option 1', async ({ page }) => {
    await openPrototype(page, OPTION.detached);
    await page.locator('[data-mode="server"]').click();

    expect((await modeSwitcher(page))!.map((s) => s.label)).toEqual(['Run', 'Server']);

    await setServerNoun(page, 'Service');
    expect((await modeSwitcher(page))!.map((s) => s.label)).toEqual(['Run', 'Service']);
    expect(await placeholderText(page)).toContain('Service mode');

    await setServerNoun(page, 'Server');
    expect((await modeSwitcher(page))!.map((s) => s.label)).toEqual(['Run', 'Server']);
    expect(await placeholderText(page)).toContain('Server mode');
  });

  test('renames the Server tab in options 2 and 3', async ({ page }) => {
    for (const option of [OPTION.inlineSeparated, OPTION.disabled]) {
      await openPrototype(page, option);
      await setServerNoun(page, 'Service');
      if (option === OPTION.inlineSeparated) await page.locator('[data-mode="server"]').click();

      expect(await tabStates(page)).toContain('Service');
      expect(await tabStates(page)).not.toContain('Server');
    }
  });

  test('carries the naming into the tooltip and its docs link', async ({ page }) => {
    await openPrototype(page, OPTION.detached);
    await setServerNoun(page, 'Service');
    await page.locator('[data-mode="server"]').hover();

    const link = page.locator('a[href*="docs.apify.com"]');
    await expect(link).toBeVisible({ timeout: 5_000 });
    await expect(link).toHaveText('Service mode');
    await expect(link.locator('..')).toContainText('Service mode keeps the Actor ready to serve requests.');
  });
});
