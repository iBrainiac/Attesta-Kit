import { test, expect, chromium } from '@playwright/test';

test('WebAuthn registration -> POST /api/register (happy path)', async ({ page }) => {
  // enable CDP WebAuthn and add virtual authenticator
  const client = await page.context().newCDPSession(page);
  await client.send('WebAuthn.enable');
  await client.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'usb',
      hasResidentKey: false,
      hasUserVerification: true,
      isUserVerified: true
    }
  });

  let registerRequest: any = null;
  await page.route('**/api/register', async (route) => {
    registerRequest = await route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });

  await page.goto('/');
  await page.click('text=Create Passkey (WebAuthn)');
  await page.click('text=Submit Registration');

  // assert UI updated
  await expect(page.locator('text=registered')).toHaveCount(1);

  // assert payload shape
  expect(registerRequest).toBeTruthy();
  expect(registerRequest.credentialId).toBeTruthy();
  expect(typeof registerRequest.publicKeyPreview).toBe('string');
});

test('replay protection: same registration -> 409', async ({ page }) => {
  // first request -> 200
  let called = 0;
  await page.route('**/api/register', async (route) => {
    called += 1;
    if (called === 1) {
      await route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
    } else {
      await route.fulfill({ status: 409, body: JSON.stringify({ error: 'replay' }) });
    }
  });

  await page.goto('/');
  await page.click('text=Create Passkey (WebAuthn)');
  await page.click('text=Submit Registration');
  await expect(page.locator('text=registered')).toHaveCount(1);

  // submit again -> replay
  await page.click('text=Submit Registration');
  await expect(page.locator('text=replay')).toHaveCount(1);
});

test('policy deny path surfaces 403', async ({ page }) => {
  await page.route('**/api/register', async (route) => {
    await route.fulfill({ status: 403, body: JSON.stringify({ error: 'policy-denied' }) });
  });

  await page.goto('/');
  await page.click('text=Create Passkey (WebAuthn)');
  await page.click('text=Submit Registration');
  await expect(page.locator('text=policy-denied')).toHaveCount(1);
});
