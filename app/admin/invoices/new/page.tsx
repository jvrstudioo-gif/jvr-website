"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewInvoicePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [car, setCar] = useState("");
  const [service, setService] = useState("");
  const [amount, setAmount] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);

    const dollars = Number(amount);
    if (!name.trim()) return setError("Customer name is required.");
    if (!service.trim()) return setError("Service is required.");
    if (!Number.isFinite(dollars) || dollars <= 0) {
      return setError("Amount must be a positive number.");
    }

    setSaving(true);
    try {
      // IMPORTANT: this matches your POST handler location
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, email, phone },
          car: car || undefined,
          service,
          amount: dollars, // dollars, backend converts to cents
          // optional: notes, terms
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Create failed (HTTP ${res.status})`);
      }

      const created = await res.json(); // new invoice object
      setOk("Invoice created!");
      // go to the invoice list or the invoice page itself
      router.push("/admin/invoices");
      // or: router.push(`/invoice/${created.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create invoice.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-white">
      <h1 className="text-3xl font-semibold mb-6">Create New Invoice</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Customer */}
        <input
          className="w-full rounded-md border border-white/10 bg-white/10 px-3 py-2"
          placeholder="Customer name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full rounded-md border border-white/10 bg-white/10 px-3 py-2"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-md border border-white/10 bg-white/10 px-3 py-2"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* Job details */}
        <input
          className="w-full rounded-md border border-white/10 bg-white/10 px-3 py-2"
          placeholder="Car (optional) e.g. 2011 Audi S4"
          value={car}
          onChange={(e) => setCar(e.target.value)}
        />
        <input
          className="w-full rounded-md border border-white/10 bg-white/10 px-3 py-2"
          placeholder="Service *"
          value={service}
          onChange={(e) => setService(e.target.value)}
        />
        <input
          className="w-full rounded-md border border-white/10 bg-white/10 px-3 py-2"
          placeholder="Amount in USD * (e.g. 400)"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-purple-600 px-4 py-2 font-medium hover:bg-purple-500 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Invoice"}
          </button>
        </div>

        {error && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}
        {ok && (
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-emerald-300">
            {ok}
          </div>
        )}
      </form>
    </main>
  );
}
