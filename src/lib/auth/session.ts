export const AUTH_SESSION_COOKIE = "khora_session";
export const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60;

export type AuthSession = {
  expiresAt: number;
  role: string;
  token: string;
};

type SessionPayload = AuthSession & {
  version: 1;
};

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SESSION_SECRET must have at least 32 characters.");
  }

  return secret;
}

function bytesToBinary(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return binary;
}

function base64UrlEncodeBinary(value: string) {
  return btoa(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecodeBinary(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);

  return atob(`${normalized}${padding}`);
}

function base64UrlEncodeText(value: string) {
  return base64UrlEncodeBinary(bytesToBinary(new TextEncoder().encode(value)));
}

function base64UrlDecodeText(value: string) {
  const binary = base64UrlDecodeBinary(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;

  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

async function signPayload(payload: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  const bytes = new Uint8Array(signature);

  return base64UrlEncodeBinary(bytesToBinary(bytes));
}

export async function createSessionCookie({
  role,
  token,
}: {
  role: string;
  token: string;
}) {
  const payload: SessionPayload = {
    expiresAt: Date.now() + AUTH_SESSION_MAX_AGE_SECONDS * 1000,
    role,
    token,
    version: 1,
  };
  const encodedPayload = base64UrlEncodeText(JSON.stringify(payload));
  const signature = await signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionCookie(
  cookieValue: string | undefined,
): Promise<AuthSession | null> {
  if (!cookieValue) {
    return null;
  }

  const [encodedPayload, signature] = cookieValue.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  try {
    const expectedSignature = await signPayload(encodedPayload);

    if (!timingSafeEqual(signature, expectedSignature)) {
      return null;
    }

    const payload = JSON.parse(
      base64UrlDecodeText(encodedPayload),
    ) as SessionPayload;

    if (
      payload.version !== 1 ||
      typeof payload.token !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return {
      expiresAt: payload.expiresAt,
      role: payload.role,
      token: payload.token,
    };
  } catch {
    return null;
  }
}
