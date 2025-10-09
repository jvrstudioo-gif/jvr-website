'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type MakeLinkResponse = {
  url?: string;
  emailSent?: boolean;
  smsSent?: boolean;
  message?: string;
  error?: string;
  reasons?: string[];
};

const ADMIN_KEY_STORAGE = 'jvr_admin_key';

function useAdminKey() {
  const [adminKey, setAdminKey] = useState('');
  const [remember, setRemember] = useState(true);

  // Restore saved key
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADMIN_KEY_STORAGE);
      if (saved) setAdminKey(saved);
    } catch {}
  }, []);

  // Persist if remember is on
  useEffect(() => {
    try {
      if (remember && adminKey) {
        localStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
      } else {
        localStorage.removeItem(ADMIN_KEY_STORAGE);
      }
    } catch {}
  }, [adminKey, remember]);

  return { adminKey, setAdminKey, remember, setRemember };
}

export default function GenerateLinkPage() {
  const { adminKey, setAdminKey, remember, setRemember } = useAdminKey();

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('');
  const [price, setPrice] = useState<string>('');
  const [durationHours, setDurationHours] = useState<string>('4');
  const [validDays, setValidDays] = useState<string>('7');
  const [sendEmail, setSendEmail] = useState<boolean>(false);
  const [sendSms, setSendSms] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<MakeLinkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!phone.trim()) return false;
    if (!email.trim()) return false;
    if (!service.trim()) return false;
    return true;
  }, [name, phone, email, service]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!adminKey.trim()) {
      setError('Admin key is required.');
      return;
    }
    if (!canSubmit) {
      setError('Please complete the required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        service: service.trim(),
        quotedPrice: price ? Number(price) : undefined,
        durationHours: durationHours ? Number(durationHours) : undefined,
        validDays: validDays ? Number(validDays) : undefined,
        sendEmail,
        sendSms,
      };

      const res = await fetch('/api/admin/generate-link', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify(payload),
      });

      const data: MakeLinkResponse = await res.json();

      if (!res.ok) {
        const detail =
          Array.isArray(data?.reasons) && data.reasons.length
            ? ` (${data.reasons.join('; ')})`
            : '';
        setError(
          (data.error || data.message || `Request failed (HTTP ${res.status}).`) +
            detail
        );
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  function copy(url?: string) {
    if (!url) return;
    navigator.clipboard.writeText(url).catch(() => {});
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Generate Booking Link</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 font-medium text-white hover:opacity-90"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href="/admin/bookings"
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 font-medium text-white hover:opacity-90"
            >
              View Bookings
            </Link>
          </div>
        </div>

        {/* Admin key */}
        <details className="mt-6 rounded-2xl border border-zinc-800 p-4 open:bg-zinc-950/60">
          <summary className="cursor-pointer select-none text-sm text-zinc-300">
            Admin key
          </summary>
          <div className="mt-3 flex items-center gap-3">
            <input
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none ring-0"
            />
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <input
                type="checkbox"
                className="accent-fuchsia-500"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember on this device
            </label>
          </div>
        </details>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="mt-6 rounded-2xl border border-zinc-800 p-5"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-zinc-400">Customer Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Mike Smith"
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Phone Number *</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., 720-555-1212"
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Email *</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., test@example.com"
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Service *</label>
              <input
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="e.g., Carbon Tint"
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400">Quoted Price (USD)</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 350"
                inputMode="decimal"
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Duration (hours)</label>
              <input
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                placeholder="e.g., 2.5"
                inputMode="decimal"
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Valid For (days)</label>
              <input
                value={validDays}
                onChange={(e) => setValidDays(e.target.value)}
                placeholder="e.g., 7"
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none"
              />
            </div>

            <div className="flex items-center gap-5 pt-6">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  className="accent-fuchsia-500"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                />
                Send via Email
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  className="accent-fuchsia-500"
                  checked={sendSms}
                  onChange={(e) => setSendSms(e.target.checked)}
                />
                Send via SMS
              </label>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
            >
              {submitting ? 'Generating…' : 'Generate Link'}
            </button>
          </div>
        </form>

        {/* Result / errors */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {result?.url && (
          <div className="mt-6 rounded-2xl border border-emerald-900/40 bg-emerald-950/40 p-4">
            <div className="text-emerald-300">Booking link generated</div>
            <p className="mt-2 select-all break-all text-emerald-100/90">{result.url}</p>
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => copy(result.url)}
                className="rounded-xl border border-emerald-700/60 px-3 py-1 text-sm text-emerald-200 hover:bg-emerald-900/30"
              >
                Copy link
              </button>
              <a
                href={result.url}
                target="_blank"
                className="rounded-xl border border-emerald-700/60 px-3 py-1 text-sm text-emerald-200 hover:bg-emerald-900/30"
              >
                Open link
              </a>
            </div>

            {(result.emailSent || result.smsSent) && (
              <div className="mt-3 text-sm text-emerald-300/90">
                {result.emailSent && <span>✓ Email sent</span>}
                {result.emailSent && result.smsSent && <span className="mx-2">•</span>}
                {result.smsSent && <span>✓ SMS sent</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
