// app/quote/page.tsx
import QuoteForm from "../components/QuoteForm";


export default function QuotePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-3xl mx-auto px-4 py-14">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          Request A Quote
        </h1>
        <div className="mt-8">
          <QuoteForm />
        </div>
      </section>
    </main>
  );
}
