'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/* ───────────────────────────── helpers ───────────────────────────── */

const DENVER_TZ = 'America/Denver';

// build [08:00 … 14:00] in 30-min increments
const TIME_SLOTS = (() => {
  const out: { value: string; label: string }[] = [];
  for (let m = 8 * 60; m <= 14 * 60; m += 30) {
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    const value = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    out.push({ value, label: to12h(hh, mm) });
  }
  return out;
})();

function to12h(h: number, m: number) {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:${String(m).padStart(2, '0')} ${suffix}`;
}

function isoFromYMD(y: number, m1: number, d: number) {
  return `${y}-${String(m1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function isWeekend(y: number, m1: number, d: number) {
  const utcNoon = new Date(Date.UTC(y, m1 - 1, d, 12));
  const wk = new Intl.DateTimeFormat('en-US', {
    timeZone: DENVER_TZ,
    weekday: 'short',
  }).format(utcNoon);
  return wk.startsWith('Sat') || wk.startsWith('Sun');
}

function todayYMDDenver() {
  const now = new Date();
  const y = Number(
    new Intl.DateTimeFormat('en-CA', { timeZone: DENVER_TZ, year: 'numeric' }).format(now),
  );
  const m = Number(
    new Intl.DateTimeFormat('en-CA', { timeZone: DENVER_TZ, month: '2-digit' }).format(now),
  );
  const d = Number(
    new Intl.DateTimeFormat('en-CA', { timeZone: DENVER_TZ, day: '2-digit' }).format(now),
  );
  return { y, m, d, iso: isoFromYMD(y, m, d) };
}

function weekdayIndexDenver(y: number, m1: number, d: number) {
  const name = new Intl.DateTimeFormat('en-US', {
    timeZone: DENVER_TZ,
    weekday: 'short',
  }).format(new Date(Date.UTC(y, m1 - 1, d, 12))); // Sun..Sat
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(name);
}

/** Next Denver weekend (defaults to today if Sat/Sun; otherwise next Saturday). */
function nextWeekendDenver() {
  const { y, m, d } = todayYMDDenver();
  const wk = weekdayIndexDenver(y, m, d);

  let add = 0;
  if (wk >= 1 && wk <= 5) {
    // Mon–Fri -> next Saturday
    add = 6 - wk; // wk:1..5 -> add 5..1
  } else {
    // Sat(6) or Sun(0) -> today
    add = 0;
  }

  const targetUTCNoon = new Date(Date.UTC(y, m - 1, d + add, 12));
  const ny = Number(
    new Intl.DateTimeFormat('en-CA', { timeZone: DENVER_TZ, year: 'numeric' }).format(
      targetUTCNoon,
    ),
  );
  const nm = Number(
    new Intl.DateTimeFormat('en-CA', { timeZone: DENVER_TZ, month: '2-digit' }).format(
      targetUTCNoon,
    ),
  );
  const nd = Number(
    new Intl.DateTimeFormat('en-CA', { timeZone: DENVER_TZ, day: '2-digit' }).format(
      targetUTCNoon,
    ),
  );

  return { y: ny, m: nm, d: nd, iso: isoFromYMD(ny, nm, nd) };
}

/* ─────────────────────────── calendar UI ─────────────────────────── */

type CalendarProps = {
  open: boolean;
  onClose: () => void;
  value?: string; // "YYYY-MM-DD"
  onSelect: (iso: string) => void;
};

function WeekendCalendar({ open, onClose, value, onSelect }: CalendarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // base month is either picked date’s month or "this weekend"
  const base = useMemo(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m] = value.split('-').map(Number);
      return { y, m };
    }
    const { y, m } = nextWeekendDenver();
    return { y, m };
  }, [value]);

  const [year, setYear] = useState(base.y);
  const [month1, setMonth1] = useState(base.m); // 1..12
  const minIso = useMemo(() => todayYMDDenver().iso, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!open) return;
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open, onClose]);

  const grid = useMemo(() => {
    const first = new Date(Date.UTC(year, month1 - 1, 1, 12));
    const firstWk = new Intl.DateTimeFormat('en-US', {
      timeZone: DENVER_TZ,
      weekday: 'short',
    }).format(first);
    const wkIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(firstWk);
    const daysInMonth = new Date(year, month1, 0).getDate();

    const cells: { y: number; m1: number; d: number; iso: string; weekend: boolean }[] = [];
    for (let i = 0; i < wkIndex; i++) cells.push({ y: 0, m1: 0, d: 0, iso: '', weekend: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const weekend = isWeekend(year, month1, d);
      cells.push({ y: year, m1: month1, d, iso: isoFromYMD(year, month1, d), weekend });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ y: 0, m1: 0, d: 0, iso: '', weekend: false });
    }
    return cells;
  }, [year, month1]);

  const headerLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: DENVER_TZ,
    }).format(new Date(Date.UTC(year, month1 - 1, 12)));
  }, [year, month1]);

  const go = (delta: number) => {
    let y = year;
    let m = month1 + delta;
    if (m < 1) {
      y -= 1;
      m = 12;
    } else if (m > 12) {
      y += 1;
      m = 1;
    }
    setYear(y);
    setMonth1(m);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/30 p-4">
      <div
        ref={containerRef}
        className="w-[22rem] rounded-2xl border border-white/10 bg-zinc-950 p-3 shadow-xl"
      >
        {/* header */}
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            className="rounded-lg border border-white/15 px-2 py-1 text-sm hover:border-white/30"
            onClick={() => go(-1)}
          >
            ←
          </button>
          <div className="text-sm font-semibold">{headerLabel}</div>
          <button
            type="button"
            className="rounded-lg border border-white/15 px-2 py-1 text-sm hover:border-white/30"
            onClick={() => go(1)}
          >
            →
          </button>
        </div>

        {/* weekday row */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs opacity-60">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* days grid */}
        <div className="mt-1 grid grid-cols-7 gap-1">
          {grid.map((c, i) => {
            if (!c.d) return <div key={i} className="h-9 rounded-lg" />;
            const selected = value === c.iso;
            const weekend = c.weekend;
            const past = c.iso < minIso; // disable past dates (Denver)
            const disabled = !weekend || past;
            return (
              <button
                key={c.iso}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (!disabled) {
                    onSelect(c.iso);
                    onClose();
                  }
                }}
                className={[
                  'h-9 rounded-lg border px-0.5 text-sm',
                  disabled
                    ? 'cursor-not-allowed border-white/10 bg-white/5 text-white/30'
                    : 'border-white/15 hover:border-white/30',
                  selected ? 'bg-fuchsia-600/20 border-fuchsia-500/60' : '',
                ].join(' ')}
              >
                {c.d}
              </button>
            );
          })}
        </div>

        <div className="mt-3 text-center text-xs opacity-70">
          Only future weekends can be selected (America/Denver).
        </div>

        <div className="mt-3 flex justify-center">
          <button
            className="rounded-xl border border-white/15 px-3 py-1 text-sm hover:border-white/30"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────── main BookingFormClient ───────────────────── */

export default function BookingFormClient({ token }: { token: string }) {
  const [isoDate, setIsoDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [calOpen, setCalOpen] = useState(false);

  const [checking, setChecking] = useState(false);
  const [dayTaken, setDayTaken] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // Pre-select "this weekend" the first time the calendar opens
  const openCalendar = () => {
    if (!isoDate) {
      const nxt = nextWeekendDenver();
      setIsoDate(nxt.iso);
    }
    setCalOpen(true);
  };

  // fetch availability whenever date changes
  useEffect(() => {
    (async () => {
      setError(null);
      setOkMsg(null);
      setDayTaken(null);
      if (!isoDate) return;

      setChecking(true);
      try {
        // your API path is singular: /api/booking
        const res = await fetch(`/api/booking?date=${isoDate}`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || 'Could not check availability.');
        } else {
          setDayTaken(!data?.available);
        }
      } catch {
        setError('Could not check availability.');
      } finally {
        setChecking(false);
      }
    })();
  }, [isoDate]);

  const canSubmit = !!isoDate && !!time && !dayTaken;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setOkMsg(null);

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, date: isoDate, time, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = Array.isArray(data?.reasons) ? `\n• ${data.reasons.join('\n• ')}` : '';
        setError(data?.error || data?.message || `Request failed (HTTP ${res.status}).${detail}`);
      } else {
        setOkMsg(data?.message || 'Booked!');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    }
  };

  const pickedDateLabel = useMemo(() => {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-').map(Number);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: DENVER_TZ,
    }).format(new Date(Date.UTC(y, m - 1, d, 12)));
  }, [isoDate]);

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 p-4">
      {/* shorter copy */}
      <div className="text-sm opacity-80">
        Weekends only, <strong>8:00 AM – 2:00 PM</strong>. One booking per day.{' '}
        <span className="opacity-70">Times shown in America/Denver (Mountain Time).</span>
      </div>

      {/* date + calendar launcher */}
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-3">
          <div className="grow">
            <label className="block text-sm opacity-70">Date</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                aria-label="Selected date"
                readOnly
                value={pickedDateLabel || ''}
                placeholder="No date selected"
                className="w-full cursor-default rounded-xl border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none ring-0"
              />
              <button
                type="button"
                onClick={openCalendar}
                className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:border-white/30"
                aria-label="Open calendar"
              >
                📅 Pick date
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* time slot */}
      <div className="mt-4">
        <label className="block text-sm opacity-70">Time</label>
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none ring-0"
        >
          <option value="">Select a time</option>
          {TIME_SLOTS.map((t) => (
            <option key={t.value} value={t.value} className="bg-zinc-900 text-white">
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* notes */}
      <div className="mt-4">
        <label className="block text-sm opacity-70">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-xl border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none ring-0"
          placeholder="Anything we should know before your appointment?"
        />
      </div>

      {/* availability state */}
      {checking && (
        <div className="mt-4 rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-sm">
          Checking availability…
        </div>
      )}
      {dayTaken === true && !checking && (
        <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          That date is already fully booked. Please choose another weekend day.
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {okMsg && (
        <div className="mt-4 rounded-xl border border-emerald-900/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
          {okMsg}
        </div>
      )}

      <div className="mt-4">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          Confirm appointment
        </button>
      </div>

      {/* pop-up calendar */}
      <WeekendCalendar
        open={calOpen}
        onClose={() => setCalOpen(false)}
        value={isoDate}
        onSelect={(iso) => setIsoDate(iso)}
      />
    </form>
  );
}
