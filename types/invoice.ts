// types/invoice.ts
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID';

export interface InvoiceLineItem {
  id: string;
  name: string;
  description?: string;
  qty: number;
  unit_price: number; // cents
}

export interface InvoiceTaxOrFee {
  id: string;
  label: string;
  type: 'PERCENT' | 'FLAT';
  value: number; // percent as 4.75; flat as cents
}

export interface PaymentEntry {
  id: string;
  amount: number; // cents
  method: 'CASH' | 'CARD' | 'CASH_APP' | 'VENMO' | 'ZELLE' | 'OTHER';
  external_ref?: string;
  received_at: string; // ISO date
  recorded_by: string;
  note?: string;
}

export interface Invoice {
  id: string;           // used in URL
  number: string;       // "INV-2025-0001"
  status: InvoiceStatus;
  currency: 'USD';

  customer: {
    name: string;
    email?: string;
    phone?: string;
  };

  issue_date: string;   // ISO
  due_date?: string;    // ISO

  items: InvoiceLineItem[];
  taxes_fees?: InvoiceTaxOrFee[];

  subtotal_cents: number;
  taxes_fees_cents: number;
  total_cents: number;
  amount_paid_cents: number;
  balance_due_cents: number;

  // Optional hosted checkout (Square or Stripe)
  square_checkout_url?: string;
  stripe_checkout_url?: string;

  // Alt payment handles shown on page
  alt_methods?: {
    cash_app?: string;     // e.g. "$jvrstudio"
    venmo?: string;        // e.g. "@jvrstudio"
    zelle?: string;        // e.g. "pay@jvrstudio.com"
    cash_instructions?: string; // e.g. "Pay at drop-off"
  };

  notes?: string;       // customer-visible notes
  terms?: string;       // small print at bottom

  created_at: string;
  updated_at: string;
  paid_at?: string;
}

