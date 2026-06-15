const ENCODER = new TextEncoder();

async function getHmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    ENCODER.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a signed session token: "email:expiration:signature_hex"
 */
export async function signSession(email: string, secret: string, maxAgeInSeconds: number): Promise<string> {
  const expiresAt = Date.now() + maxAgeInSeconds * 1000;
  const payload = `${email}:${expiresAt}`;
  const key = await getHmacKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    ENCODER.encode(payload)
  );
  
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${payload}:${signatureHex}`;
}

/**
 * Verifies the token and returns the email if valid, or null if invalid/expired.
 */
export async function verifySession(token: string, secret: string): Promise<string | null> {
  try {
    const parts = token.split(':');
    if (parts.length !== 3) return null;
    
    const [email, expiresAtStr, signatureHex] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    
    if (isNaN(expiresAt) || expiresAt < Date.now()) {
      return null; // Expired or invalid format
    }

    const payload = `${email}:${expiresAt}`;
    const key = await getHmacKey(secret);
    
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      ENCODER.encode(payload)
    );
    
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (signatureHex === expectedHex) {
      return email;
    }
  } catch (error) {
    console.error("Session verification failed:", error);
  }
  return null;
}
