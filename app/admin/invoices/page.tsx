"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* ---------- Types ---------- */

type Status = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";
type PaymentMethod = "square_card" | "square_tap" | "cash" | null;

type Invoice = {
  id: string;
  number: string;
  issue_date: string;
  due_date: string;
  status: Status;
  total_cents: number;
  balance_due_cents?: number;
  payment_method?: PaymentMethod;
  customer: {
    name: string;
    email?: string;
  };
};

/* ---------- Helpers ---------- */

function money(cents: number | undefined) {
  const n = typeof cents === "number" ? cents : 0;
  return (n / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ---------- Page ---------- */

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // track edits per-row
  const [edits, setEdits] = useState<
    Record<string, { status: Status; payment_method: PaymentMethod }>
  >({});

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invoices", { cache: "no-store" });
      const data = (await res.json()) as Invoice[];
      setInvoices(data);
    } catch (e) {
      console.error("Failed to fetch invoices:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const startEdit = (inv: Invoice) => {
    setEdits((prev) => ({
      ...prev,
      [inv.id]: {
        status: inv.status,
        payment_method: inv.payment_method ?? null,
      },
    }));
  };

  const cancelEdit = (id: string) => {
    setEdits((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateEdit = <K extends keyof (typeof edits)[string]>(
    id: string,
    key: K,
    value: (typeof edits)[string][K]
  ) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [key]: value },
    }));
  };

  const saveRow = async (inv: Invoice) => {
    const patch = edits[inv.id];
    if (!patch) return;
    setSavingId(inv.id);
    try {
      const res = await fetch(`/api/invoices/${encodeURIComponent(inv.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: patch.status,
          payment_method: patch.payment_method,
        }),
      });
      if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);
      await refresh();
      cancelEdit(inv.id);
    } catch (e) {
      console.error("Save failed:", e);
      alert("Could not save invoice. Check console for details.");
    } finally {
      setSavingId(null);
    }
  };

  const copyLink = async (inv: Invoice) => {
    const url = `${window.location.origin}/invoice/${inv.id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    } catch {
      alert(url);
    }
  };

  const sendInvoice = async (inv: Invoice) => {
    try {
      const res = await fetch(
        `/api/invoices/${encodeURIComponent(inv.id)}/send`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error(`Send failed: ${res.status}`);
      alert("Invoice sent!");
      await refresh();
    } catch (e) {
      console.error(e);
      alert("Could not send invoice. Check console for details.");
    }
  };

  // NEW: delete handler
  const deleteInvoice = async (inv: Invoice) => {
    if (!confirm(`Delete invoice ${inv.number}? This cannot be undone.`)) return;
    try {
      const res = await fetch(
        `/api/invoices/${encodeURIComponent(inv.id)}/delete`,
        { method: "DELETE" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `Delete failed: ${res.status}`);
      await refresh();
    } catch (e) {
      console.error(e);
      alert("Could not delete invoice. Check console for details.");
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 text-sm text-zinc-100">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Link
          href="/admin/invoices/new"
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-500"
        >
          + Create Invoice
        </Link>
      </header>

      <section className="mb-4 flex items-center gap-3">
        <button
          onClick={refresh}
          className="rounded-md border border-zinc-700 px-3 py-2 hover:bg-zinc-800"
        >
          Refresh
        </button>
        {loading && <span className="text-zinc-400">Loading…</span>}
      </section>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="min-w-full">
          <thead className="bg-zinc-900/60 text-zinc-300 text-left">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Issued</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {invoices.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-zinc-400">
                  No invoices yet.
                </td>
              </tr>
            )}

            {invoices.map((inv) => {
              const isEditing = !!edits[inv.id];
              const edit = edits[inv.id];

              return (
                <tr key={inv.id} className="border-t border-zinc-800">
                  <td className="px-4 py-3">
                    <div className="font-medium">{inv.number}</div>
                    <div className="text-zinc-400">
                      Balance: {money(inv.balance_due_cents ?? inv.total_cents)}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium">{inv.customer?.name}</div>
                    {inv.customer?.email && (
                      <div className="text-zinc-400">{inv.customer.email}</div>
                    )}
                  </td>

                  <td className="px-4 py-3">{inv.issue_date}</td>
                  <td className="px-4 py-3">{money(inv.total_cents)}</td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        className="bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1"
                        value={edit!.status}
                        onChange={(e) =>
                          updateEdit(inv.id, "status", e.target.value as Status)
                        }
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="SENT">SENT</option>
                        <option value="PAID">PAID</option>
                        <option value="OVERDUE">OVERDUE</option>
                        <option value="VOID">VOID</option>
                      </select>
                    ) : (
                      inv.status
                    )}
                  </td>

                  {/* Payment Method */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        className="bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1"
                        value={edit!.payment_method ?? ""}
                        onChange={(e) =>
                          updateEdit(
                            inv.id,
                            "payment_method",
                            (e.target.value || null) as PaymentMethod
                          )
                        }
                      >
                        <option value="">(none)</option>
                        <option value="square_card">Square (Card)</option>
                        <option value="square_tap">Square (Tap to Pay)</option>
                        <option value="cash">Cash</option>
                      </select>
                    ) : (
                      (inv.payment_method ?? "—").replaceAll("_", " ")
                    )}
                  </td>

                  {/* Row Actions */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          disabled={savingId === inv.id}
                          onClick={() => saveRow(inv)}
                          className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-500 disabled:opacity-60"
                        >
                          {savingId === inv.id ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={() => cancelEdit(inv.id)}
                          className="rounded-md border border-zinc-700 px-3 py-1.5 hover:bg-zinc-800"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => startEdit(inv)}
                          className="rounded-md border border-zinc-700 px-3 py-1.5 hover:bg-zinc-800"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => copyLink(inv)}
                          className="rounded-md border border-zinc-700 px-3 py-1.5 hover:bg-zinc-800"
                        >
                          Copy Link
                        </button>

                        <button
                          onClick={() => sendInvoice(inv)}
                          className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500"
                        >
                          Send
                        </button>

                        <Link
                          href={`/invoice/${inv.id}`}
                          className="rounded-md border border-zinc-700 px-3 py-1.5 hover:bg-zinc-800"
                          target="_blank"
                        >
                          View
                        </Link>

                        {/* NEW: Delete */}
                        <button
                          onClick={() => deleteInvoice(inv)}
                          className="rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
