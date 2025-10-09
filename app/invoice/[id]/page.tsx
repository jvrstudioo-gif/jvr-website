import Link from 'next/link';
import PrintButton from '../_components/PrintButton';
import { getInvoiceById, formatMoney } from '../../../lib/invoices';

export const dynamic = 'force-dynamic';

type PageProps = { params: { id: string } };

export default async function Page({ params }: PageProps) {
  const invoice = await getInvoiceById(params.id);

  if (!invoice) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-2xl font-bold">Invoice not found</h1>
          <p className="mt-2 text-neutral-400">Check the link or contact JVR Studio.</p>
        </div>
      </main>
    );
  }

  // Optional fields (kept as casts so this compiles cleanly even if your TS type doesn't include them yet)
  const method = (invoice as any).payment_method as
    | 'square_card'
    | 'square_tap'
    | 'cash'
    | undefined;
  const paidAt = (invoice as any).paid_at as string | undefined;

  const isPaid =
    (invoice.balance_due_cents ?? 0) <= 0 || invoice.status === 'PAID';

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top Bar (text only) */}
      <div className="sticky top-0 z-10 bg-black/70 backdrop-blur border-b border-white/10 print:hidden">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <div className="font-semibold tracking-wide">JVR Studio</div>
          <div className="flex items-center gap-2">
            <StatusPill status={invoice.status as any} />
            <PrintButton />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 print:py-8">
        {/* Big logo centered above the invoice */}
        <div className="flex justify-center mb-6">
          <img
            src="/jvrs.svg"
            alt="JVR Studio"
            className="h-32 sm:h-40 w-auto object-contain"
          />
        </div>

        {/* Header */}
        <div className="grid sm:grid-cols-2 gap-4 border border-white/10 rounded-lg p-4 print:border-black print:bg-white print:text-black">
          <div>
            <h1 className="text-xl font-bold">Invoice {invoice.number}</h1>
            <div className="mt-2 text-sm text-neutral-300 print:text-black">
              <div>Issued: {fmtDate(invoice.issue_date)}</div>
              {/* Due date always equals issue date */}
              <div>Due: {fmtDate(invoice.issue_date)}</div>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="font-semibold">JVR Studio LLC</div>
            <div className="text-sm text-neutral-300 print:text-black">Aurora, CO</div>
            <div className="text-sm">
              <a className="underline hover:opacity-80" href="mailto:info@jvrestylingstudio.com">
                info@jvrestylingstudio.com
              </a>
            </div>
            <div className="text-sm">
              Instagram/TikTok:{' '}
              <a
                className="underline hover:opacity-80"
                href="https://instagram.com/jvrstudioo"
                target="_blank"
                rel="noreferrer"
              >
                @jvrstudioo
              </a>
            </div>
            <div className="text-sm">
              <a
                className="underline hover:opacity-80"
                href="https://jvrestylingstudio.com"
                target="_blank"
                rel="noreferrer"
              >
                jvrestylingstudio.com
              </a>
            </div>
          </div>
        </div>

        {/* Bill To + Summary */}
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div className="border border-white/10 rounded-lg p-4 print:border-black print:bg-white print:text-black">
            <div className="font-semibold mb-1">Bill To</div>
            <div className="text-sm">{invoice.customer?.name}</div>
            {invoice.customer?.email && (
              <div className="text-sm text-neutral-300 print:text-black">{invoice.customer.email}</div>
            )}
            {invoice.customer?.phone && (
              <div className="text-sm text-neutral-300 print:text-black">{invoice.customer.phone}</div>
            )}
          </div>

          <div className="border border-white/10 rounded-lg p-4 print:border-black print:bg-white print:text-black">
            <div className="font-semibold mb-1">Summary</div>
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatMoney(invoice.subtotal_cents)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxes/Fees</span>
              <span>{formatMoney(invoice.taxes_fees_cents)}</span>
            </div>
            <div className="flex justify-between font-semibold mt-1 text-base">
              <span>Total</span>
              <span>{formatMoney(invoice.total_cents)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>Paid</span>
              <span>{formatMoney(invoice.amount_paid_cents)}</span>
            </div>
            <div className="flex justify-between font-semibold mt-1">
              <span>Balance</span>
              <span>{formatMoney(invoice.balance_due_cents)}</span>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mt-4 border border-white/10 rounded-lg overflow-hidden print:border-black print:bg-white print:text-black">
          <table className="w-full text-sm">
            <thead className="bg-white/5 print:bg-black/5">
              <tr className="text-left">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((it: any) => (
                <tr key={it.id ?? it.name} className="border-t border-white/10 print:border-black/20 align-top">
                  <td className="py-3 px-4">
                    <div className="font-medium">{it.name}</div>
                    {it.description && (
                      <div className="text-neutral-400 text-xs mt-0.5">{it.description}</div>
                    )}
                  </td>
                  <td className="py-3 px-4">{it.qty}</td>
                  <td className="py-3 px-4">{formatMoney(it.unit_price)}</td>
                  <td className="py-3 px-4 text-right">{formatMoney(it.unit_price * it.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment section — no buttons */}
        <div className="mt-4 border border-white/10 rounded-lg p-4">
          {isPaid ? (
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-emerald-300">
              Paid in full{paidAt ? ` on ${fmtDate(paidAt)}` : ''}{method ? ` (Method: ${labelMethod(method)})` : ''}
            </div>
          ) : (
            <div className="text-sm">
              <span className="font-semibold">Balance due:</span>{' '}
              <span className="font-semibold">{formatMoney(invoice.balance_due_cents)}</span>
              {method ? <> — preferred: {labelMethod(method)}</> : null}
            </div>
          )}
        </div>

        {/* Notes / Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {invoice.notes && (
              <div className="border border-white/10 rounded-lg p-4 print:border-black print:bg-white print:text-black">
                <div className="font-semibold mb-2">Notes</div>
                <p className="text-sm text-neutral-300 print:text-black">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div className="border border-white/10 rounded-lg p-4 print:border-black print:bg-white print:text-black">
                <div className="font-semibold mb-2">Terms</div>
                <p className="text-sm text-neutral-300 print:text-black">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-neutral-400 print:text-black">
          Questions? Email{' '}
          <a className="underline" href="mailto:info@jvrestylingstudio.com">
            info@jvrestylingstudio.com
          </a>
        </div>
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID' }) {
  const base = 'px-2 py-1 rounded-full text-xs font-semibold';
  const map: Record<'DRAFT'|'SENT'|'PAID'|'OVERDUE'|'VOID', string> = {
    DRAFT: 'bg-neutral-700 text-neutral-200',
    SENT: 'bg-blue-600/20 text-blue-300 border border-blue-600/40',
    PAID: 'bg-emerald-600/20 text-emerald-300 border border-emerald-600/40',
    OVERDUE: 'bg-red-600/20 text-red-300 border border-red-600/40',
    VOID: 'bg-neutral-800 text-neutral-400 border border-white/10 line-through'
  };
  return <span className={`${base} ${map[status]}`}>{status}</span>;
}

function fmtDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function labelMethod(m?: string) {
  switch (m) {
    case 'square_card': return 'Square (Card)';
    case 'square_tap': return 'Square (Tap to Pay)';
    case 'cash': return 'Cash';
    default: return '—';
  }
}
