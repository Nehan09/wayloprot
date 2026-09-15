import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { rupees } from "@/lib/session";
import { useCart, useCheckout } from "@/lib/waylo-client";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function CheckoutPage() {
  const cart = useCart();
  const checkout = useCheckout();
  const [done, setDone] = useState(false);

  const submit = () => checkout.mutate(undefined, { onSuccess: () => setDone(true) });

  if (done) return (
    <section className="mt-4 grid min-h-[60vh] place-items-center">
      <div className="panel max-w-xl rounded-2xl p-8 text-center">
        <div className="eyebrow">Checkout Ready</div>
        <h1 className="mt-2 text-3xl font-semibold">Thank you for shopping with Waylo.</h1>
        <p className="mt-3 text-sm text-steel">Your final bill is <b>{rupees(cart.data?.total ?? 0)}</b>.</p>
        <Link to="/" className="mt-6 grid min-h-14 place-items-center rounded-xl bg-ink font-semibold text-card">Start New Shopping Trip</Link>
      </div>
    </section>
  );

  return (
    <section className="mt-4">
      <div className="mx-auto max-w-2xl panel rounded-2xl p-5 sm:p-7">
        <Link to="/cart" className="text-sm font-semibold text-steel">← Back to cart</Link>
        <div className="mt-5"><div className="eyebrow">Final Bill</div><h1 className="mt-1 text-3xl font-semibold">Ready to checkout?</h1></div>
        <div className="mt-5 space-y-2">
          {(cart.data?.items ?? []).map((item) => <div key={item.id} className="flex justify-between rounded-xl bg-fog p-3 text-sm"><span>{item.product?.name} ×{item.quantity}</span><b>{rupees(item.subtotal)}</b></div>)}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-5"><span className="font-semibold">Total</span><span className="font-mono text-3xl font-bold">{rupees(cart.data?.total ?? 0)}</span></div>
        <button disabled={!cart.data?.items.length || checkout.isPending} onClick={submit} className="mt-5 min-h-16 w-full rounded-2xl bg-route text-lg font-bold text-ink disabled:opacity-50">
          {checkout.isPending ? "Processing..." : "Proceed to Checkout"}
        </button>
      </div>
    </section>
  );
}
