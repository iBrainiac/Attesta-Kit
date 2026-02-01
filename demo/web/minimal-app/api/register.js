/**
 * Mock API endpoint for registration
 * Handles WebAuthn credential registration with replay protection
 */

// In-memory store for registered credential IDs (for replay protection)
// In production, this would be a database
const registeredCredentialIds = new Set();

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { credentialId, publicKeyPreview } = req.body;

    // Validate request body
    if (!credentialId || typeof credentialId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid credentialId' });
    }

    if (!publicKeyPreview || typeof publicKeyPreview !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid publicKeyPreview' });
    }

    // Check for replay protection
    if (registeredCredentialIds.has(credentialId)) {
      return res.status(409).json({ error: 'replay' });
    }

    // TODO: Add policy checks here
    // For now, we'll simulate a policy check that always passes
    // In production, this would validate against actual policy rules
    const policyCheck = true; // Mock policy check
    
    if (!policyCheck) {
      return res.status(403).json({ error: 'policy-denied' });
    }

    // Register the credential ID
    registeredCredentialIds.add(credentialId);

    // Log registration (in production, save to database)
    console.log('Registration successful:', {
      credentialId: credentialId.substring(0, 20) + '...',
      publicKeyPreview: publicKeyPreview.substring(0, 20) + '...',
      timestamp: new Date().toISOString(),
    });

    // Return success response
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
