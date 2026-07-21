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

function getJwtExpiresAt(token: string) {
  const [, encodedPayload] = token.split(".");

  if (!encodedPayload) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecodeText(encodedPayload)) as {
      exp?: unknown;
    };

    return typeof payload.exp === "number" && Number.isFinite(payload.exp)
      ? payload.exp * 1000
      : null;
  } catch {
    return null;
  }
}

export function getSessionMaxAgeSeconds(token: string) {
  const jwtExpiresAt = getJwtExpiresAt(token);

  if (jwtExpiresAt === null) {
    return AUTH_SESSION_MAX_AGE_SECONDS;
  }

  return Math.max(
    0,
    Math.min(
      AUTH_SESSION_MAX_AGE_SECONDS,
      Math.floor((jwtExpiresAt - Date.now()) / 1000),
    ),
  );
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
  const maxAge = getSessionMaxAgeSeconds(token);
  const payload: SessionPayload = {
    expiresAt: Date.now() + maxAge * 1000,
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
    const jwtExpiresAt =
      typeof payload.token === "string"
        ? getJwtExpiresAt(payload.token)
        : null;

    if (
      payload.version !== 1 ||
      typeof payload.token !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now() ||
      (jwtExpiresAt !== null && jwtExpiresAt <= Date.now())
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
