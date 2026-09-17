import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { rupees } from "@/lib/session";
import { useScan } from "@/lib/waylo-client";

export const Route = createFileRoute("/scan")({ component: ScanPage });

function ScanPage() {
  const [barcode, setBarcode] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const scan = useScan();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const result = await scan.mutateAsync({ barcode });
      if (result.found && result.product) {
        setMessage({ ok: true, text: `${result.product.name} added to cart · ${rupees(result.product.price)}` });
        setBarcode("");
      } else {
        setMessage({ ok: false, text: "Product not found. Try one of the demo barcodes below." });
      }
    } catch {
      setMessage({ ok: false, text: "Scan failed. Check the database connection." });
    }
  };

  const demos = ["8901010000011", "8901010000059", "8901234567890", "8901010000295"];

  return (
    <section className="mt-4">
      <div className="mx-auto max-w-2xl panel rounded-2xl p-5 sm:p-7">
        <Link to="/" className="text-sm font-semibold text-steel">← Back to home</Link>
        <div className="mt-6 text-center">
          <div className="eyebrow">Barcode Scanner</div>
          <h1 className="mt-1 text-3xl font-semibold">Scan a product</h1>
          <p className="mt-2 text-sm text-steel">For the prototype, enter a barcode. A physical scanner can later type into this field automatically.</p>
        </div>
        <form onSubmit={submit} className="mt-6">
          <input autoFocus value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Enter barcode..." inputMode="numeric" className="min-h-16 w-full rounded-2xl bg-fog px-5 text-xl font-mono outline-none ring-1 ring-border focus:ring-2 focus:ring-route" />
          <button disabled={!barcode || scan.isPending} className="mt-3 min-h-16 w-full rounded-2xl bg-route text-lg font-bold text-ink disabled:opacity-50">
            {scan.isPending ? "Scanning..." : "Scan & Add to Cart"}
          </button>
        </form>
        {message && <div className={`mt-4 rounded-2xl p-4 text-sm font-semibold ${message.ok ? "bg-olive/15 text-olive" : "bg-carrot/15 text-carrot"}`}>{message.text}</div>}
        <div className="mt-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-steel">Demo barcodes</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {demos.map((code) => <button key={code} onClick={() => setBarcode(code)} className="rounded-xl bg-card px-4 py-3 text-left font-mono text-sm ring-1 ring-border">{code}</button>)}
          </div>
        </div>
        <Link to="/cart" className="mt-4 grid min-h-12 place-items-center rounded-xl bg-ink font-semibold text-card">View Live Bill</Link>
      </div>
    </section>
  );
}
