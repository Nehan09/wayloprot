import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { rupees } from "@/lib/session";
import { useAddListToCart, useAddToList, useList, useProductSearch, useRemoveFromList, useSetListStatus, useOptimizedRoute } from "@/lib/waylo-client";

export const Route = createFileRoute("/list")({ component: ListPage });

function ListPage() {
  const list = useList();
  const [q, setQ] = useState("");
  const products = useProductSearch(q, "All");
  const add = useAddToList();
  const remove = useRemoveFromList();
  const status = useSetListStatus();
  const addAll = useAddListToCart();
  const optimize = useOptimizedRoute();

  const pending = (list.data?.items ?? []).filter((x) => x.status !== "found" && x.product);
  const first = pending[0]?.product;

  return (
    <section className="mt-4">
      <div className="panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><div className="eyebrow">Shopping List</div><h1 className="mt-1 text-2xl font-semibold">What do you need?</h1></div>
          <Link to="/" className="rounded-xl bg-card px-4 py-2.5 text-sm font-semibold ring-1 ring-border">Home</Link>
        </div>
        <div className="mt-4 flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Add a product..." className="min-h-12 flex-1 rounded-xl bg-fog px-4 ring-1 ring-border outline-none focus:ring-2 focus:ring-route" />
        </div>
        {q.trim() && (
          <div className="mt-2 max-h-56 overflow-auto rounded-xl bg-card ring-1 ring-border">
            {(products.data ?? []).slice(0, 8).map((p) => (
              <button key={p.id} onClick={() => { add.mutate({ productId: p.id }); setQ(""); }} className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left last:border-0">
                <span><b>{p.name}</b><span className="ml-2 text-xs text-steel">Aisle {p.aisle}</span></span><span className="font-mono">{rupees(p.price)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          <button disabled={!pending.length || optimize.isPending} onClick={() => optimize.mutate({})} className="min-h-12 rounded-xl bg-route px-4 font-semibold text-ink">
            {optimize.isPending ? "Optimizing..." : "Optimize My Route"}
          </button>
          <button disabled={!list.data?.items.length || addAll.isPending} onClick={() => addAll.mutate()} className="min-h-12 rounded-xl bg-ink px-4 font-semibold text-card">
            Add All to Cart
          </button>
          {first && <Link to="/map" search={{ to: first.map_node_id, product: first.id }} className="grid min-h-12 place-items-center rounded-xl bg-card px-4 font-semibold ring-1 ring-border">Navigate Next</Link>}
        </div>

        {optimize.data && (
          <div className="mt-4 rounded-2xl bg-fog p-4">
            <div className="eyebrow">Optimized Shopping Route</div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              {optimize.data.legs.map((leg, i) => (
                <span key={i} className="rounded-full bg-card px-3 py-2 ring-1 ring-border">
                  {i === 0 ? "Start" : "→"} {leg.label}
                </span>
              ))}
              <span className="font-mono font-bold">≈ {optimize.data.totalDistance}m</span>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-2">
          {(list.data?.items ?? []).map((item) => {
            if (!item.product) return null;
            const p = item.product;
            const found = item.status === "found";
            return (
              <div key={item.id} className={`flex flex-wrap items-center gap-3 rounded-xl p-3 ring-1 ring-border ${found ? "bg-fog opacity-70" : "bg-card"}`}>
                <button onClick={() => status.mutate({ productId: p.id, status: found ? "pending" : "found" })} className={`grid size-7 place-items-center rounded-full ring-2 ${found ? "bg-ink text-card ring-ink" : "ring-steel"}`}>{found ? "✓" : ""}</button>
                <div className="min-w-0 flex-1">
                  <div className={`font-semibold ${found ? "line-through" : ""}`}>{p.name}</div>
                  <div className="text-xs text-steel">Aisle {p.aisle} · Shelf {p.shelf} · {rupees(p.price)}</div>
                </div>
                <Link to="/map" search={{ to: p.map_node_id, product: p.id }} className="rounded-lg bg-route px-3 py-2 text-xs font-semibold text-ink">Navigate</Link>
                <button onClick={() => remove.mutate({ productId: p.id })} className="rounded-lg bg-card px-3 py-2 text-xs font-semibold ring-1 ring-border">Remove</button>
              </div>
            );
          })}
          {!list.data?.items.length && <div className="py-8 text-center text-sm text-steel">Your list is empty. Search above to add products.</div>}
        </div>
      </div>
    </section>
  );
}
