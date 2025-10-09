// scripts/makeBookingLink.mjs
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // load envs for this node script

// --- helpers: minimal HS256 signer (no TS imports) ---
const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
function sign(payload, secret, expSeconds) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { id: crypto.randomUUID(), ...payload, exp: now + expSeconds };
  const h = b64url(header);
  const d = b64url(body);
  const sig = crypto.createHmac("sha256", secret).update(`${h}.${d}`).digest("base64url");
  return `${h}.${d}.${sig}`;
}

// args: name, phone, email, service, quotedPriceUSD, durationHours, daysValid
const [,, name, phone, email, service, price, duration, daysValid] = process.argv;
if (!name || !phone || !email || !service) {
  console.log(`Usage:
  node scripts/makeBookingLink.mjs "Customer Name" "555-123-4567" "email@test.com" "Carbon Tint" 350 2.5 7`);
  process.exit(1);
}

const secret = process.env.BOOKING_TOKEN_SECRET || "dev-secret-change-me";
const expSecs = (parseInt(daysValid || "7", 10) * 24 * 60 * 60);

const token = sign(
  {
    name, phone, email, service,
    quotedPrice: price ? Number(price) : undefined,
    durationHours: duration ? Number(duration) : undefined,
  },
  secret,
  expSecs
);

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
console.log(`${base}/book/${token}`);
