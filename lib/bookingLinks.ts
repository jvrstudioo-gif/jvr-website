// lib/bookingLinks.ts
import fs from "fs/promises";
import path from "path";

export type BookingLinkRecord = {
  token: string;
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  quotedPrice?: number;
  durationHours?: number;
  validDays?: number;
  createdAt?: string;      // ISO
  expiresAt?: string;      // ISO
  status?: "new" | "sent" | "booked" | "expired";
};

const dataDir = path.join(process.cwd(), "data");
const tokenFile = path.join(dataDir, "booking-links.json");

async function ensureFile() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.access(tokenFile);
  } catch {
    await fs.writeFile(tokenFile, "[]", "utf8");
  }
}

export async function readBookingLinks(): Promise<BookingLinkRecord[]> {
  await ensureFile();
  try {
    const txt = await fs.readFile(tokenFile, "utf8");
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? (arr as BookingLinkRecord[]) : [];
  } catch {
    return [];
  }
}

export async function writeBookingLinks(rows: BookingLinkRecord[]) {
  await ensureFile();
  await fs.writeFile(tokenFile, JSON.stringify(rows, null, 2), "utf8");
}

export async function getBookingByToken(token: string) {
  const rows = await readBookingLinks();
  const rec = rows.find((r) => r.token === token);
  if (!rec) return null;

  if (rec.expiresAt && new Date(rec.expiresAt).getTime() < Date.now()) {
    return null;
  }
  return rec;
}
