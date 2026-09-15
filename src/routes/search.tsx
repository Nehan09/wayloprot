import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ProductCard } from "@/components/waylo/ProductCard";
import { useAddToCart, useAddToList, useCategories, useProductSearch } from "@/lib/waylo-client";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const categories = useCategories();
  const products = useProductSearch(q, category);
  const addCart = useAddToCart();
  const addList = useAddToList();

  return (
    <section className="mt-4">
      <div className="panel rounded-2xl p-4 sm:p-5">
        <div className="eyebrow">Product Discovery</div>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Find a product</h1>
            <p className="mt-1 text-sm text-steel">Search the Waylo Mart inventory and go straight to the aisle.</p>
          </div>
          <Link to="/" className="rounded-xl bg-card px-4 py-2.5 text-sm font-semibold ring-1 ring-border">Home</Link>
        </div>

        <form
          className="mt-5 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search milk, shampoo, coffee..."
            className="min-h-14 flex-1 rounded-xl bg-fog px-4 text-base outline-none ring-1 ring-border focus:ring-2 focus:ring-route"
          />
          <button className="min-h-14 rounded-xl bg-ink px-6 text-sm font-semibold text-card">Search</button>
        </form>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {["All", ...(categories.data ?? [])].map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${
                category === item ? "bg-ink text-card" : "bg-card ring-1 ring-border"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {products.isLoading ? (
          <div className="panel rounded-2xl p-6 text-sm text-steel">Searching Waylo Mart...</div>
        ) : products.isError ? (
          <div className="panel rounded-2xl p-6 text-sm text-carrot">Could not load products. Check your Supabase connection.</div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-semibold">{products.data?.length ?? 0} products found</span>
              <span className="text-steel">Tap Navigate to find an item</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(products.data ?? []).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => addCart.mutate({ productId: product.id })}
                  onAddToList={() => addList.mutate({ productId: product.id })}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
