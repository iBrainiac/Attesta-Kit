# Minimal test app plan — Attesta

Purpose
- Provide a small, CI-friendly, end-to-end test harness that exercises the core WebAuthn → SDK → on‑chain flow without requiring hardware authenticators or a full local validator.
- Validate critical security properties: registration, replay protection (nonce), and policy allow/deny.

Scope (minimal viable)
- A tiny React app that: (a) performs WebAuthn credential creation in the browser, (b) posts the credential to a test endpoint (`/api/register`), and (c) can submit an authorization (`/api/authorize`).
- Playwright E2E using a Chromium virtual authenticator that: registers a passkey, submits an authorization, asserts replay rejection, and asserts a policy-deny path.
- Network-level assertions only (no on-chain validator required). CI will run the same flows with mocked HTTP responses to assert expected behavior.

Success criteria
- UI can create a WebAuthn credential and send a registration request containing `credentialId` and public key. ✅
- Playwright test successfully automates the WebAuthn flow using a virtual authenticator. ✅
- Tests assert replay protection (server rejects repeated nonce) and policy-deny (server returns 403 and UI surfaces error). ✅

Files to be added (PR)
- `demo/web/minimal-app/*` — minimal React + Vite app with two buttons and a tiny UI
- `e2e/playwright/*` — Playwright config + tests that use CDP virtual authenticator
- `docs/testapp.md` — this plan and runbook
- `.github/workflows/e2e-playwright.yml` — CI job to run the Playwright tests

Minimal test cases
1. Register: create passkey → POST /api/register called with credentialId + publicKey
2. Authorize (allowed): create assertion → POST /api/authorize → 200
3. Replay: reuse same assertion/nonce → server returns 409 / UI shows rejected
4. Policy deny: server responds 403 → UI shows denied

Local dev (quick)
- Start app: `cd demo/web/minimal-app && npm install && npm run dev`
- Run tests: `cd e2e/playwright && npm install && npx playwright test --headed`

CI notes
- Tests run headless on Chromium; Playwright will start the Vite dev server via the `webServer` option.
- Network responses are mocked/asserted in tests — no chain-side dependency.

Estimated effort
- Scaffold + tests: 2–3 hours
- Harden & add chain integration: +2–4 hours

Next steps
- Implement the Playwright tests and iterate until green in CI.
- Optionally add a `devnet` end-to-end job that deploys the Anchor program and runs the same Playwright flows against a live devnet instance.
