"use client";

import { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

// Simple styles to make react-datepicker look OK in your dark theme
const wrap = { background:"#000", color:"#fff" } as const;
const card = { background:"#0b0b0b", border:"1px solid #222", borderRadius:12, padding:16 } as const;
const label = { display:"block", marginBottom:8, fontWeight:700 } as const;
const field = { width:"100%", padding:"12px 14px", borderRadius:10, border:"1px solid #2F2F2F", background:"#111", color:"#fff" } as const;
const button = { padding:"14px 18px", borderRadius:9999, border:"none", background:"linear-gradient(90deg,#6a00ff,#0077ff)", color:"#fff", fontWeight:800, cursor:"pointer" } as const;
const subtle = { opacity:0.7, fontSize:12, marginTop:8 } as const;

type Props = {
  token: string;                       // booking token from /book/[token]
};

export default function BookingPrivateForm({ token }: Props) {
  // Weekend-only date picker state
  const [date, setDate] = useState<Date | null>(null);
  // 30-min time slot selection
  const [time, setTime] = useState<string>("");
  // Optional notes
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Generate 30-min slots 08:00 AM → 01:00 PM (labels in local/Denver style)
  // We send labels like "08:30 AM" to the API (it parses HH:MM AM/PM).
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    // 8:00 -> 12:30 starts (last selectable start is 12:30 so it can end by 1:00)
    for (let h = 8; h <= 12; h++) {
      for (const min of [0, 30]) {
        if (h === 12 && min === 30) {
          // 12:30 PM is allowed (ends at 1:00 PM)
          slots.push(formatLabel(h, min));
          continue;
        }
        if (h < 12 || (h === 12 && min <= 30)) {
          slots.push(formatLabel(h, min));
        }
      }
    }
    // ensure uniqueness & nice ordering
    return Array.from(new Set(slots));
  }, []);

  function formatLabel(h: number, m: number) {
    // Convert to 12h label
    const isPM = h >= 12;
    const hour12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
    const mm = m === 0 ? "00" : "30";
    const label = `${String(hour12).padStart(2,"0")}:${mm} ${isPM ? "PM" : "AM"}`;
    return label;
  }

  // Only allow Saturdays (6) and Sundays (0)
  const filterWeekends = (d: Date) => {
    const day = d.getDay();
    return day === 0 || day === 6;
  };
  // Disallow any date before today
  const today = new Date();
  today.setHours(0,0,0,0);

  async function submit() {
    if (!date) { alert("Please select a date (weekends only)."); return; }
    if (!time) { alert("Please select a time."); return; }

    setSubmitting(true);
    try {
      // API expects `date` as YYYY-MM-DD and `time` as "HH:MM AM/PM"
      const dateStr = format(date, "yyyy-MM-dd");

      const res = await fetch("/api/booking/private", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          date: dateStr,
          time,
          note: note || ""
        })
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Something went wrong.");
      }

      const data = await res.json();
      // If Square is not configured yet, your route returns { paymentLinkUrl: null }
      // Show a simple success, or if/when Square is configured, redirect to deposit page.
      if (data.paymentLinkUrl) {
        window.location.href = data.paymentLinkUrl as string;
      } else {
        alert("Thanks! We’ve received your request. We’ll confirm by text/email.");
      }
    } catch (e: any) {
      alert(e.message || "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={wrap}>
      {/* Contact card stays in the page.tsx header area — this is just the picker+time+notes */}
      <div style={{ display:"grid", gap:16 }}>
        {/* Preferred Date (Weekends only) */}
        <div>
          <label style={label}>Preferred Date (Weekends only)</label>
          <div style={card}>
            <DatePicker
              selected={date}
              onChange={(d) => setDate(d)}
              filterDate={filterWeekends}
              minDate={today}
              placeholderText="Select a weekend date"
              showPopperArrow={false}
              // improve keyboard experience
              shouldCloseOnSelect
              // make it full width and dark-friendly
              customInput={<input style={field} />}
            />
            <div style={subtle}>Only Saturdays and Sundays are selectable.</div>
          </div>
        </div>

        {/* Preferred Time */}
        <div>
          <label style={label}>Preferred Time (Denver, 30-min increments)</label>
          <select
            value={time}
            onChange={(e)=>setTime(e.target.value)}
            style={field}
          >
            <option value="">Select a time</option>
            {timeSlots.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div style={subtle}>Slots run from 8:00 AM to 1:00 PM (America/Denver).</div>
        </div>

        {/* Notes */}
        <div>
          <label style={label}>Notes (optional)</label>
          <textarea
            value={note}
            onChange={(e)=>setNote(e.target.value)}
            rows={5}
            style={{ ...field, resize:"vertical" }}
            placeholder="Anything we should know?"
          />
        </div>

        <div>
          <button onClick={submit} style={button} disabled={submitting}>
            {submitting ? "Submitting…" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
