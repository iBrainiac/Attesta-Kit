import React, { useState } from 'react';

function bufToB64Url(buf: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export default function App() {
  const [credId, setCredId] = useState<string | null>(null);
  const [pubKeyPreview, setPubKeyPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const createPasskey = async () => {
    setStatus('creating');
    try {
      const credential: any = await navigator.credentials.create({
        publicKey: {
          challenge: Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(32))),
          rp: { name: 'Attesta (minimal test)' },
          user: { id: Uint8Array.from([1,2,3,4]), name: 'tester', displayName: 'Tester' },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: { userVerification: 'preferred' },
          timeout: 60000,
        }
      });

      const rawId = credential.rawId as ArrayBuffer;
      const response = credential.response;
      setCredId(bufToB64Url(rawId));

      // quick publicKey preview (attestationObject / clientDataJSON)
      const clientData = new Uint8Array(response.clientDataJSON || new ArrayBuffer(0));
      setPubKeyPreview(bufToB64Url(clientData.buffer.slice(0, 32)));
      setStatus('created');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
    }
  };

  const submitRegistration = async () => {
    if (!credId) return setStatus('no-credential');
    setStatus('posting');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ credentialId: credId, publicKeyPreview: pubKeyPreview })
      });
      if (res.status === 200) {
        setStatus('registered');
      } else if (res.status === 409) {
        setStatus('replay');
      } else if (res.status === 403) {
        setStatus('policy-denied');
      } else {
        setStatus('failed');
      }
    } catch (err) {
      console.error(err);
      setStatus('failed');
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 24 }}>
      <h2>Attesta — Minimal test app</h2>
      <p>Use the buttons below to create a virtual passkey and exercise the registration flow.</p>

      <div style={{ marginTop: 12 }}>
        <button onClick={createPasskey}>Create Passkey (WebAuthn)</button>
        <button onClick={submitRegistration} style={{ marginLeft: 8 }}>Submit Registration</button>
      </div>

      <div style={{ marginTop: 18 }}>
        <div><strong>credentialId:</strong> <code>{credId ?? '—'}</code></div>
        <div><strong>pubKeyPreview:</strong> <code>{pubKeyPreview ?? '—'}</code></div>
        <div style={{ marginTop: 8 }}><strong>status:</strong> {status ?? 'idle'}</div>
      </div>

      <div style={{ marginTop: 18, color: '#666' }}>
        <small>Notes: this minimal app posts to <code>/api/*</code>. Playwright tests mock those endpoints.</small>
      </div>
    </div>
  );
}
