// app/api/admin/block-date/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  addBlockedDate,
  getUpcomingBlockedDates,
  removeBlockedDate,
} from "@/lib/blockedDates";

export const dynamic = "force-dynamic";

function checkAdminKey(req: NextRequest) {
  const headerKey = req.headers.get("x-admin-key");
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || headerKey !== adminKey) {
    return false;
  }
  return true;
}

// GET: list upcoming blocked dates
export async function GET() {
  const data = await getUpcomingBlockedDates("America/Denver");
  return NextResponse.json({ data });
}

// POST: add a blocked date
export async function POST(req: NextRequest) {
  if (!checkAdminKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { date, reason } = body ?? {};
    if (!date) {
      return NextResponse.json({ error: "Missing 'date'." }, { status: 400 });
    }
    const created = await addBlockedDate({ date, reason });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Error" }, { status: 400 });
  }
}

// DELETE: ?date=YYYY-MM-DD  (unblock)
export async function DELETE(req: NextRequest) {
  if (!checkAdminKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Missing 'date'." }, { status: 400 });
  }
  try {
    const result = await removeBlockedDate(date);
    return NextResponse.json({ data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Error" }, { status: 400 });
  }
}
