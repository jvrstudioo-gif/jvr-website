"use server";

import { list, put } from "@vercel/blob";
import { readQuotes } from "@/lib/quotes";

export async function exportQuotesCSVAction(formData: FormData) {
  // Choose a fixed name so we overwrite each time
  const filename = "exports/quotes.csv";

  // Build CSV from your stored quotes
  const rows = await readQuotes();

  const header = [
    "id","receivedAt","status","source",
    "firstName","lastName","email","phone",
    "ymm","vin","service","details","agree",
    "tintType","tintShade","vehicleType","coverage",
    "removalAreas","chromeAreas","decalSize","decalColor","decalPlacement"
  ];

  const esc = (v: unknown) => {
    if (v == null) return "";
    const s = Array.isArray(v) ? v.join("; ") : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    // CSV-escape
  };

  const lines = [header.join(",")].concat(
    rows.map((r) => header.map((h) => esc((r as any)[h])).join(","))
  );

  const csv = lines.join("\n");

  // Write to Vercel Blob and **overwrite** if it exists
  await put(filename, csv, {
    access: "public",
    contentType: "text/csv",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return { ok: true };
}
