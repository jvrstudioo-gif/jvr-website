// lib/blockedDates.ts
import { promises as fs } from "fs";
import path from "path";

export type BlockedDate = { date: string; reason?: string };

const FILE_PATH = path.join(process.cwd(), "data", "blocked-dates.json");

async function ensureFile() {
  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
    await fs.writeFile(FILE_PATH, "[]", "utf8");
  }
}

export async function getAllBlockedDates(): Promise<BlockedDate[]> {
  await ensureFile();
  const raw = await fs.readFile(FILE_PATH, "utf8");
  const arr = JSON.parse(raw) as BlockedDate[];
  // sort ascending by date string
  return arr.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getUpcomingBlockedDates(tz: string = "America/Denver") {
  const all = await getAllBlockedDates();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: tz }); // YYYY-MM-DD
  return all.filter((d) => d.date >= today);
}

export async function addBlockedDate(entry: BlockedDate) {
  const { date } = entry;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD.");
  }
  const all = await getAllBlockedDates();
  if (all.some((d) => d.date === date)) {
    throw new Error("Date already blocked.");
  }
  all.push(entry);
  all.sort((a, b) => a.date.localeCompare(b.date));
  await fs.writeFile(FILE_PATH, JSON.stringify(all, null, 2), "utf8");
  return entry;
}

export async function removeBlockedDate(date: string) {
  const all = await getAllBlockedDates();
  const next = all.filter((d) => d.date !== date);
  if (next.length === all.length) {
    throw new Error("Date not found.");
  }
  await fs.writeFile(FILE_PATH, JSON.stringify(next, null, 2), "utf8");
  return { removed: date };
}
// lib/blockedDates.ts

export function ymd(date: Date, tz = "America/Denver") {
  return date.toLocaleDateString("en-CA", { timeZone: tz }); // YYYY-MM-DD
}

export async function isBlocked(dateYMD: string) {
  const all = await getAllBlockedDates();
  return all.some((d) => d.date === dateYMD);
}
