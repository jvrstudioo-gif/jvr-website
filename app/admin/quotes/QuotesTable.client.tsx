// app/admin/quotes/QuotesTable.client.tsx
"use client";

import { useOptimistic, useTransition } from "react";
import type { QuoteRecord } from "@/lib/quotes";
import { formatDenver } from "@/lib/time";

type QuoteStatus = "new" | "contacted";

type Props = {
  quotes: QuoteRecord[];
  // These are server actions passed from the parent page.tsx
  setStatusAction: (formData: FormData) => Promise<void>;
  deleteQuoteAction: (formData: FormData) => Promise<void>;
};

export default function QuotesTable({
  quotes,
  setStatusAction,
  deleteQuoteAction,
}: Props) {
  // Optimistic map: id -> "new" | "contacted"
  const [optimistic, applyOptimistic] = useOptimistic<
    Record<string, QuoteStatus>,
    { id: string; status: QuoteStatus }
  >({}, (state, update) => ({ ...state, [update.id]: update.status }));

  // Make optimistic updates happen within a transition
  const [, startTransition] = useTransition();

  const optimisticSet = (id: string, status: QuoteStatus) => {
    startTransition(() => {
      applyOptimistic({ id, status });
    });
  };

  const statusChip = (id: string, status?: string | null) => {
    const s = (optimistic[id] ?? status ?? "new") as QuoteStatus;
    const label = s === "contacted" ? "Contacted" : "New";
    const base =
      "rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset";
    return (
      <span
        className={
          s === "contacted"
            ? `${base} bg-emerald-600/15 text-emerald-300 ring-emerald-500/30`
            : `${base} bg-zinc-600/20 text-zinc-200 ring-zinc-500/30`
        }
      >
        {label}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      {/* Desktop table */}
      <table className="hidden min-w-[720px] table-fixed border-separate border-spacing-0 text-sm md:table">
        <thead>
          <tr className="bg-zinc-900 text-zinc-200">
            <th className="sticky left-0 z-10 w-[220px] border-b border-zinc-800 px-4 py-3 text-left bg-zinc-900">
              Received
            </th>
            <th className="w-[130px] border-b border-zinc-800 px-4 py-3 text-left">
              Status
            </th>
            <th className="w-[180px] border-b border-zinc-800 px-4 py-3 text-left">
              Name
            </th>
            <th className="w-[260px] border-b border-zinc-800 px-4 py-3 text-left">
              Email
            </th>
            <th className="w-[220px] border-b border-zinc-800 px-4 py-3 text-left">
              Service
            </th>
            <th className="w-[260px] border-b border-zinc-800 px-4 py-3 text-left">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {quotes.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-zinc-400" colSpan={6}>
                No quotes yet.
              </td>
            </tr>
          ) : (
            quotes.map((q) => (
              <tr key={q.id} className="border-b border-zinc-900">
                <td className="sticky left-0 z-0 bg-black/80 px-4 py-3 backdrop-blur">
                  {formatDenver(q.receivedAt)}{/* Denver time */}
                </td>
                <td className="px-4 py-3">{statusChip(q.id, q.status)}</td>
                <td className="px-4 py-3">
                  {`${q.firstName ?? ""} ${q.lastName ?? ""}`.trim() || "-"}
                </td>
                <td className="px-4 py-3">{q.email ?? "-"}</td>
                <td className="px-4 py-3">{q.service ?? "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {/* New */}
                    <form action={setStatusAction}>
                      <input type="hidden" name="id" value={q.id} />
                      <input type="hidden" name="status" value="new" />
                      <button
                        type="submit"
                        onClick={() => optimisticSet(q.id, "new")}
                        className="rounded border border-zinc-700 px-3 py-1 text-xs hover:bg-zinc-800"
                      >
                        New
                      </button>
                    </form>

                    {/* Contacted */}
                    <form action={setStatusAction}>
                      <input type="hidden" name="id" value={q.id} />
                      <input type="hidden" name="status" value="contacted" />
                      <button
                        type="submit"
                        onClick={() => optimisticSet(q.id, "contacted")}
                        className="rounded border border-zinc-700 px-3 py-1 text-xs hover:bg-zinc-800"
                      >
                        Contacted
                      </button>
                    </form>

                    {/* Delete */}
                    <form action={deleteQuoteAction}>
                      <input type="hidden" name="id" value={q.id} />
                      <button
                        type="submit"
                        className="rounded border border-red-700 px-3 py-1 text-xs text-red-300 hover:bg-red-900/30"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {quotes.length === 0 ? (
          <p className="px-1 py-2 text-sm text-zinc-400">No quotes yet.</p>
        ) : (
          quotes.map((q) => (
            <div
              key={q.id}
              className="rounded-xl border border-zinc-800 bg-black/60 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs text-zinc-400">
                  {formatDenver(q.receivedAt)}{/* Denver time */}
                </div>
                {statusChip(q.id, q.status)}
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-medium">
                  {`${q.firstName ?? ""} ${q.lastName ?? ""}`.trim() || "-"}
                </div>
                <div className="text-zinc-300">{q.email ?? "-"}</div>
                <div className="text-zinc-300">{q.phone ?? "-"}</div>
                <div className="text-zinc-300">{q.service ?? "-"}</div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <form action={setStatusAction}>
                  <input type="hidden" name="id" value={q.id} />
                  <input type="hidden" name="status" value="new" />
                  <button
                    type="submit"
                    onClick={() => optimisticSet(q.id, "new")}
                    className="rounded border border-zinc-700 px-3 py-1 text-xs hover:bg-zinc-800"
                  >
                    New
                  </button>
                </form>

                <form action={setStatusAction}>
                  <input type="hidden" name="id" value={q.id} />
                  <input type="hidden" name="status" value="contacted" />
                  <button
                    type="submit"
                    onClick={() => optimisticSet(q.id, "contacted")}
                    className="rounded border border-zinc-700 px-3 py-1 text-xs hover:bg-zinc-800"
                  >
                    Contacted
                  </button>
                </form>

                <form action={deleteQuoteAction}>
                  <input type="hidden" name="id" value={q.id} />
                  <button
                    type="submit"
                    className="rounded border border-red-700 px-3 py-1 text-xs text-red-300 hover:bg-red-900/30"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
