import { expect, type Page } from '@playwright/test';

/** Dock option numbers → variant ids: 1 detached-above-labeled, 2 inline-separated, 3 disabled. */
export const OPTION = { detached: 1, inlineSeparated: 2, disabled: 3 } as const;

export type DockState = {
  run?: boolean;
  server?: boolean;
  alwaysShowModes?: boolean;
  developer?: boolean;
  multiTenant?: boolean;
};

const CHECKBOX_IDS = {
  run: 'supports-run-mode',
  server: 'supports-server-mode',
  alwaysShowModes: 'always-show-modes',
  developer: 'developer-view',
} as const;

export async function openPrototype(page: Page, option: number) {
  await page.goto(`/?option=${option}`);
  await expect(page.locator('[role="tab"]').first()).toBeVisible();
}

async function setCheckbox(page: Page, id: string, want: boolean) {
  const box = page.locator(`#${id}`);
  const checked = await box.evaluate((el) => (
    el.getAttribute('aria-checked') === 'true'
    || (el as HTMLElement).dataset.state === 'checked'
    || (el as HTMLInputElement).checked === true
  ));

  if (checked !== want) await box.click();
}

/** The tenancy control is a Radix dropdown, so it needs real pointer events. */
async function setTenancy(page: Page, multiTenant: boolean) {
  const label = multiTenant ? 'Multi-tenant' : 'Single-tenant';
  const trigger = page.locator('button[aria-label^="Tenancy"]');

  if ((await trigger.getAttribute('aria-label'))?.includes(label)) return;

  await trigger.click();
  await page.locator('[role="menuitem"]', { hasText: label }).click();
  await expect(trigger).toHaveAttribute('aria-label', `Tenancy: ${label}`);
}

/**
 * Drives the control dock into a known state. Mode support is applied last because
 * turning one mode off forces the active mode and tab.
 */
export async function setDock(page: Page, state: DockState) {
  await setCheckbox(page, CHECKBOX_IDS.run, true);
  await setCheckbox(page, CHECKBOX_IDS.server, true);

  if (state.alwaysShowModes !== undefined) {
    await setCheckbox(page, CHECKBOX_IDS.alwaysShowModes, state.alwaysShowModes);
  }
  if (state.developer !== undefined) {
    await setCheckbox(page, CHECKBOX_IDS.developer, state.developer);
  }
  if (state.multiTenant !== undefined) await setTenancy(page, state.multiTenant);

  if (state.run !== undefined) await setCheckbox(page, CHECKBOX_IDS.run, state.run);
  if (state.server !== undefined) await setCheckbox(page, CHECKBOX_IDS.server, state.server);
}

/** Flips the dock's mode-naming select between "Server mode" and "Service mode". */
export async function setServerNoun(page: Page, noun: 'Server' | 'Service') {
  const trigger = page.locator('button[aria-label^="Mode naming"]');

  if ((await trigger.getAttribute('aria-label'))?.includes(`${noun} mode`)) return;

  await trigger.click();
  await page.locator('[role="menuitem"]', { hasText: `${noun} mode` }).click();
  await expect(trigger).toHaveAttribute('aria-label', `Mode naming: ${noun} mode`);
}

/** Operational tabs only — excludes the Run/Server mode switcher segments. */
export async function tabs(page: Page) {
  return page.locator('[role="tab"]:not([data-mode])').evaluateAll((els) => els.map((el) => ({
    title: (el as HTMLElement).innerText.trim(),
    disabled: el.getAttribute('aria-disabled') === 'true' || (el as HTMLButtonElement).disabled,
  })));
}

/** Tab titles rendered as `Title` when enabled and `Title✗` when disabled. */
export async function tabStates(page: Page) {
  return (await tabs(page)).map(({ title, disabled }) => `${title}${disabled ? '✗' : ''}`);
}

export async function modeSwitcher(page: Page) {
  const switcher = page.locator('[data-flow-target="mode-switcher"]');

  if (await switcher.count() === 0) return null;

  return switcher.locator('[role="tab"]').evaluateAll((els) => els.map((el) => ({
    label: (el as HTMLElement).innerText.trim(),
    disabled: el.getAttribute('aria-disabled') === 'true',
    selected: el.getAttribute('aria-selected') === 'true',
  })));
}

export async function placeholderText(page: Page) {
  return (await page.locator('[aria-live="polite"]').innerText()).replace(/\n+/g, ' / ');
}
