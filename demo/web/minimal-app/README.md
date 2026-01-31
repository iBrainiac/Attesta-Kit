Minimal Attesta demo (WebAuthn)

Purpose
- Minimal UI to exercise WebAuthn registration and surface the payloads that would be sent to the SDK / backend.

Run locally
1. cd demo/web/minimal-app
2. npm install
3. npm run dev

Behavior
- Click `Create Passkey` to create a WebAuthn credential (browser will prompt or use a virtual authenticator in test).
- Click `Submit Registration` to POST `{ credentialId, publicKeyPreview }` to `/api/register`.

Tests
- Playwright E2E (provided under `e2e/playwright`) automates the flow with a virtual authenticator and asserts network requests.