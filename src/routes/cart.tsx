import { createFileRoute, Link } from "@tanstack/react-router";
import { rupees } from "@/lib/session";
import { useCart, useRemoveFromCart, useUpdateCartItem } from "@/lib/waylo-client";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const cart = useCart();
  const update = useUpdateCartItem();
  const remove = useRemoveFromCart();

  return (
    <section className="mt-4">
      <div className="panel rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div><div className="eyebrow">Live Bill</div><h1 className="mt-1 text-2xl font-semibold">Your cart</h1></div>
          <Link to="/search" className="rounded-xl bg-card px-4 py-2.5 text-sm font-semibold ring-1 ring-border">Continue Shopping</Link>
        </div>

        <div className="mt-5 space-y-3">
          {(cart.data?.items ?? []).map((item) => (
            <div key={item.id} className="rounded-2xl bg-fog p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{item.product?.name}</div>
                  <div className="mt-1 text-xs text-steel">{item.product?.brand} · {rupees(item.price)} each</div>
                </div>
                <div className="font-mono text-lg font-bold">{rupees(item.subtotal)}</div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => update.mutate({ productId: item.product!.id, quantity: item.quantity - 1 })} className="grid size-11 place-items-center rounded-xl bg-card text-xl ring-1 ring-border">−</button>
                <span className="grid min-w-12 place-items-center font-mono font-bold">{item.quantity}</span>
                <button onClick={() => update.mutate({ productId: item.product!.id, quantity: item.quantity + 1 })} className="grid size-11 place-items-center rounded-xl bg-card text-xl ring-1 ring-border">+</button>
                <button onClick={() => remove.mutate({ productId: item.product!.id })} className="ml-auto rounded-xl bg-card px-4 py-2.5 text-sm font-semibold ring-1 ring-border">Remove</button>
              </div>
            </div>
          ))}
          {!cart.data?.items.length && <div className="rounded-2xl bg-fog py-12 text-center text-sm text-steel">Cart is empty. Search or scan a product to begin.</div>}
        </div>

        <div className="mt-5 rounded-2xl bg-ink p-5 text-card">
          <div className="flex items-end justify-between">
            <div><div className="eyebrow">Total</div><div className="mt-1 text-sm text-steel">{cart.data?.itemCount ?? 0} items</div></div>
            <div className="font-mono text-3xl font-bold">{rupees(cart.data?.total ?? 0)}</div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link to="/scan" className="grid min-h-14 place-items-center rounded-xl bg-card font-semibold text-ink">Scan Product</Link>
            <Link to="/checkout" className="grid min-h-14 place-items-center rounded-xl bg-route font-semibold text-ink">
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
