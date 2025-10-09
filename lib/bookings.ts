// lib/bookings.ts
import path from "path";
import fs from "fs/promises";

const ROOT = process.cwd();
const BOOKINGS_PATH = path.join(ROOT, "data", "bookings.json");

export type BookingRow = {
  id: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;          // ISO
  updatedAt: string;          // ISO
  date: string;               // YYYY-MM-DD
  time: string;               // HH:mm
  name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  notes?: string | null;
  quotedPrice?: number | null;
  durationHours?: number | null;
};

export async function getAllBookings(): Promise<BookingRow[]> {
  try {
    const buf = await fs.readFile(BOOKINGS_PATH, "utf8");
    const json = JSON.parse(buf);
    if (Array.isArray(json)) return json as BookingRow[];
    return [];
  } catch {
    // If file not found yet, just return empty
    return [];
  }
}

// ----- NEW: writer used by removeBooking -----
async function writeBookings(list: BookingRow[]): Promise<void> {
  await fs.mkdir(path.dirname(BOOKINGS_PATH), { recursive: true });
  await fs.writeFile(BOOKINGS_PATH, JSON.stringify(list, null, 2), "utf8");
}

// ----- NEW: delete a booking by id -----
export async function removeBooking(id: string): Promise<boolean> {
  const list = await getAllBookings();
  const next = list.filter((b) => String(b.id) !== String(id));
  if (next.length === list.length) return false; // nothing removed
  await writeBookings(next);
  return true;
}

// Optional alias (handy if your page imports readBookings)
export const readBookings = getAllBookings;
