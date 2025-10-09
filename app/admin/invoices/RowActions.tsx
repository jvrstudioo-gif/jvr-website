"use client";

import { useState } from "react";

type Props = {
  id: string; // invoice id or number
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";
  payment_method?: "square_card" | "square_tap" | "cash" | null;
  onUpdated?: () => void; // callback to refresh the table
};

export default function RowActions({
  id,
  status,
  payment_method,
  onUpdated,
}: Props) {
  const [st, setSt] = useState<Props["status"]>(status);
  const [method, setMethod] = useState<Props["payment_method"]>(
    payment_method ?? null
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/admin/invoices/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: st, payment_method: method }),
        }
      );

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `PATCH failed ${res.status}`);
      }

      setMsg("Saved");
      onUpdated?.();
    } catch (e) {
      console.error(e);
      setMsg("Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    setBusy(true);
    setMsg(null);
    try {
      // Your send route is /api/admin/invoices/send and expects { id } in the body
      const res = await fetch(`/api/admin/invoices/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `SEND failed ${res.status}`);
      }

      setMsg("Sent");
    } catch (e) {
      console.error(e);
      setMsg("Send failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={st}
        onChange={(e) => setSt(e.target.value as Props["status"])}
        className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-sm"
      >
        <option value="DRAFT">DRAFT</option>
        <option value="SENT">SENT</option>
        <option value="PAID">PAID</option>
        <option value="OVERDUE">OVERDUE</option>
        <option value="VOID">VOID</option>
      </select>

      <select
        value={method ?? ""}
        onChange={(e) =>
          setMethod((e.target.value || null) as Props["payment_method"])
        }
        className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-sm"
      >
        <option value="">(no method)</option>
        <option value="square_card">Square (Card)</option>
        <option value="square_tap">Square (Tap)</option>
        <option value="cash">Cash</option>
      </select>

      <button
        onClick={save}
        disabled={busy}
        className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white text-sm disabled:opacity-60"
      >
        Save
      </button>

      <button
        onClick={send}
        disabled={busy}
        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm disabled:opacity-60"
      >
        Send
      </button>

      {msg && <span className="text-xs text-zinc-400 pl-1">{msg}</span>}
    </div>
  );
}
