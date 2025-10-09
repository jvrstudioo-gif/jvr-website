import { createHmac, randomUUID } from "crypto";
// ✅ Secret for signing booking tokens (from .env.local)
// Uses BOOKING_TOKEN_SECRET, or falls back to NEXTAUTH_SECRET.
const RAW_SECRET =
  process.env.BOOKING_TOKEN_SECRET || process.env.NEXTAUTH_SECRET;

if (!RAW_SECRET) {
  throw new Error(
    "Missing booking token secret. Set BOOKING_TOKEN_SECRET (or NEXTAUTH_SECRET) in .env.local"
  );
}

// Use this when calling createHmac / jwt.sign / etc.
export const BOOKING_SECRET: string = RAW_SECRET;

// If the rest of your file references `secret`, keep this alias:
export const secret = BOOKING_SECRET;

type Payload = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;        // e.g., "Carbon Tint"
  quotedPrice?: number;   // USD
  durationHours?: number; // e.g., 2.5 hours
  exp: number;            // expiration timestamp (unix seconds)
};

const enc = (obj: any) =>
  Buffer.from(JSON.stringify(obj)).toString("base64url");
const dec = <T = any>(str: string) =>
  JSON.parse(Buffer.from(str, "base64url").toString()) as T;

export function signPayload(
  payload: Omit<Payload, "id" | "exp"> & { id?: string; exp?: number }
) {
  const head = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const exp = payload.exp ?? now + 7 * 24 * 60 * 60; // default 7 days

  const body: Payload = {
    id: payload.id ?? randomUUID(),
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    service: payload.service,
    quotedPrice: payload.quotedPrice,
    durationHours: payload.durationHours,
    exp,
  };

  const header = enc(head);
  const data = enc(body);
  const secret = process.env.BOOKING_TOKEN_SECRET!;
  const sig = createHmac("sha256", secret)
    .update(`${header}.${data}`)
    .digest("base64url");
  return `${header}.${data}.${sig}`;
}

export function verifyToken<T = Payload>(token: string): T | null {
  try {
    const [header, data, sig] = token.split(".");
    const secret = process.env.BOOKING_TOKEN_SECRET!;
    const expected = createHmac("sha256", secret)
      .update(`${header}.${data}`)
      .digest("base64url");
    if (expected !== sig) return null;

    const payload = dec<T>(data);
    // @ts-expect-error -- reason: third-party/loose type
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
