import { createFileRoute, Link } from "@tanstack/react-router";
import { useAddToCart, useAddToList, useProduct } from "@/lib/waylo-client";
import { rupees } from "@/lib/session";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const product = useProduct(Number(id));
  const addCart = useAddToCart();
  const addList = useAddToList();

  if (product.isLoading) return <div className="mt-4 panel rounded-2xl p-6">Loading product...</div>;
  if (product.isError || !product.data) return <div className="mt-4 panel rounded-2xl p-6">Product not found.</div>;

  const p = product.data;
  return (
    <section className="mt-4">
      <div className="panel rounded-2xl p-5 sm:p-7">
        <Link to="/search" className="text-sm font-semibold text-steel">← Back to search</Link>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid min-h-64 place-items-center rounded-2xl bg-fog ring-1 ring-border">
            {p.image_url ? <img src={p.image_url} alt={p.name} className="max-h-64 object-contain" /> : <div className="font-mono text-6xl text-steel">WAYLO</div>}
          </div>
          <div>
            <div className="eyebrow">{p.category ?? "Product"}</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{p.name}</h1>
            <div className="mt-1 text-sm text-steel">{p.brand}</div>
            <div className="mt-5 font-mono text-3xl font-bold">{rupees(p.price)}</div>
            <p className="mt-4 text-sm leading-6 text-steel">{p.description}</p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-fog p-3"><span className="text-steel">Aisle</span><br /><b>{p.aisle}</b></div>
              <div className="rounded-xl bg-fog p-3"><span className="text-steel">Shelf</span><br /><b>{p.shelf}</b></div>
              <div className="rounded-xl bg-fog p-3"><span className="text-steel">Availability</span><br /><b>{p.availability}</b></div>
              <div className="rounded-xl bg-fog p-3"><span className="text-steel">Barcode</span><br /><b className="font-mono text-xs">{p.barcode}</b></div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Link to="/map" search={{ to: p.map_node_id, product: p.id }} className="grid min-h-14 place-items-center rounded-xl bg-route font-semibold text-ink">Navigate to Product</Link>
              <button onClick={() => addCart.mutate({ productId: p.id })} className="min-h-14 rounded-xl bg-ink font-semibold text-card">Add to Cart</button>
              <button onClick={() => addList.mutate({ productId: p.id })} className="min-h-12 rounded-xl bg-card font-semibold ring-1 ring-border">Add to Shopping List</button>
              <Link to="/cart" className="grid min-h-12 place-items-center rounded-xl bg-card font-semibold ring-1 ring-border">View Cart</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
