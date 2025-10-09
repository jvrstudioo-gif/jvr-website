'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type BlockedItem = {
  date: string;          // "YYYY-MM-DD"
  reason?: string;
  bookedBy?: string;
};

const LS_KEY = 'jvr_admin_key';

function getSavedKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(LS_KEY) || '';
}

function saveKey(key: string, remember: boolean) {
  if (typeof window === 'undefined') return;
  if (remember && key) localStorage.setItem(LS_KEY, key);
  else localStorage.removeItem(LS_KEY);
}

// Try to coerce any API payload into an array of BlockedItem
function coerceBlockedArray(raw: any): BlockedItem[] {
  const candidate =
    Array.isArray(raw) ? raw :
    Array.isArray(raw?.data) ? raw.data :
    Array.isArray(raw?.items) ? raw.items :
    Array.isArray(raw?.blocked) ? raw.blocked :
    Array.isArray(raw?.blockedDates) ? raw.blockedDates :
    [];

  // shallow-clean items to ensure we at least have strings
  return candidate.map((x: any) => ({
    date: String(x?.date ?? ''),
    reason: x?.reason ? String(x.reason) : undefined,
    bookedBy: x?.bookedBy ? String(x.bookedBy) : undefined,
  }));
}

export default function BlockDatePage() {
  const [adminKey, setAdminKey] = useState('');
  const [rememberKey, setRememberKey] = useState(true);

  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  const [items, setItems] = useState<BlockedItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  useEffect(() => {
    setAdminKey(getSavedKey());
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoadingList(true);
      const res = await fetch('/api/admin/block-date', { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());

      const raw = await res.json();
      // console.log('Blocked payload:', raw);
      const list = coerceBlockedArray(raw);

      // Sort by date ascending; guard against missing dates
      list.sort((a, b) => (a?.date ?? '').localeCompare(b?.date ?? ''));
      setItems(list);
    } catch (e) {
      console.error(e);
      alert('Failed to load blocked dates.');
    } finally {
      setLoadingList(false);
    }
  }

  async function onBlock(e: React.FormEvent) {
    e.preventDefault();
    if (!date) {
      alert('Please choose a date.');
      return;
    }

    setSubmitting(true);
    try {
      if (!adminKey) {
        alert('Enter your admin key.');
        return;
      }

      saveKey(adminKey, rememberKey);

      const res = await fetch('/api/admin/block-date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ date, reason: reason || undefined }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to block date.');
      }

      setDate('');
      setReason('');
      alert('Date blocked.');
      await refresh();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Error blocking date.');
    } finally {
      setSubmitting(false);
    }
  }

  async function onUnblock(d: string) {
    if (!confirm(`Unblock ${d}?`)) return;
    setUnblocking(d);
    try {
      if (!adminKey) {
        alert('Enter your admin key.');
        return;
      }

      saveKey(adminKey, rememberKey);

      const res = await fetch(`/api/admin/block-date?date=${encodeURIComponent(d)}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': adminKey,
        },
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to unblock date.');
      }

      alert('Unblocked.');
      await refresh();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Error unblocking date.');
    } finally {
      setUnblocking(null);
    }
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Block a Date</h1>

        {/* Quick Actions */}
        <section className="mt-6 mb-8">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/generate-link"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            >
              Generate Booking Link
            </Link>
            <Link
              href="/admin/bookings"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90"
            >
              View Bookings
            </Link>
            <Link
              href="/admin"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </section>

        {/* Admin key */}
        <details className="mb-6">
          <summary className="cursor-pointer text-sm text-zinc-300">Admin key</summary>
          <div className="mt-3 space-y-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
            <label className="inline-flex items-center gap-2 text-xs text-zinc-400">
              <input
                type="checkbox"
                checked={rememberKey}
                onChange={(e) => setRememberKey(e.target.checked)}
                className="h-3 w-3 accent-red-500"
              />
              Remember on this device
            </label>
          </div>
        </details>

        {/* Form */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <form onSubmit={onBlock} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Date (weekends allowed)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Reason (optional)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Closed for event, personal, etc."
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? 'Blocking…' : 'Block Date'}
            </button>
          </form>
        </section>

        {/* List */}
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-semibold">Upcoming blocked dates</h2>

          {loadingList ? (
            <div className="text-sm text-zinc-400">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-zinc-400">No blocked dates.</div>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li
                  key={it.date}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
                >
                  <div>
                    <div className="font-medium">{it.date}</div>
                    {it.bookedBy ? (
                      <div className="text-xs text-zinc-400">Booked: {it.bookedBy}</div>
                    ) : it.reason ? (
                      <div className="text-xs text-zinc-400">{it.reason}</div>
                    ) : null}
                  </div>

                  <button
                    onClick={() => onUnblock(it.date)}
                    disabled={unblocking === it.date}
                    className="rounded-lg border border-pink-600/40 bg-zinc-900 px-3 py-1.5 text-sm text-pink-300 hover:bg-zinc-800 disabled:opacity-60"
                  >
                    {unblocking === it.date ? 'Unblocking…' : 'Unblock'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
