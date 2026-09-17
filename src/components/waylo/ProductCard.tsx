import { Link } from "@tanstack/react-router";

import { rupees } from "@/lib/session";

export type Product = {
  id: number;
  name: string;
  brand: string | null;
  category: string | null;
  price: number | string;
  aisle: number;
  shelf: number;
  availability: string;
  map_node_id: string;
};

type Props = {
  product: Product;
  onAddToCart: () => void;
  onAddToList: () => void;
};

export function ProductCard({ product, onAddToCart, onAddToList }: Props) {
  const inStock = product.availability === "In Stock";
  return (
    <div className="panel rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-steel">{product.brand}</div>
          <Link
            to="/product/$id"
            params={{ id: String(product.id) }}
            className="mt-0.5 block text-base font-semibold leading-tight text-balance"
          >
            {product.name}
          </Link>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${
            inStock ? "bg-olive/15 text-olive" : "bg-steel/25 text-foreground"
          }`}
        >
          {product.availability}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-3 text-[11px]">
        <span>
          Aisle {product.aisle} · Shelf {product.shelf}
        </span>
        <span className="ml-auto font-mono text-lg font-bold tabular-nums">
          {rupees(product.price)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          to="/map"
          search={{ to: product.map_node_id, product: product.id }}
          className="flex min-h-[52px] items-center justify-center rounded-xl bg-route text-sm font-semibold text-ink ring-1 ring-route"
        >
          Navigate
        </Link>
        <button
          onClick={onAddToCart}
          className="min-h-[52px] rounded-xl bg-ink text-sm font-semibold text-card"
        >
          Add to Cart
        </button>
        <Link
          to="/product/$id"
          params={{ id: String(product.id) }}
          className="flex min-h-[44px] items-center justify-center rounded-xl bg-card text-sm font-semibold ring-1 ring-border"
        >
          View Details
        </Link>
        <button
          onClick={onAddToList}
          className="min-h-[44px] rounded-xl bg-card text-sm font-semibold ring-1 ring-border"
        >
          Add to List
        </button>
      </div>
    </div>
  );
}
