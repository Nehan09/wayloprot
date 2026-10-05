import { Link } from "@tanstack/react-router";

import { rupees } from "@/lib/session";
import {
  useAddToCart,
  useProductSearch,
} from "@/lib/waylo-client";

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
  stock_quantity: number;
};

type Props = {
  product: Product;
  onAddToCart: () => void;
  onAddToList: () => void;
};

export function ProductCard({
  product,
  onAddToCart,
  onAddToList,
}: Props) {
  const inStock =
  product.availability === "In Stock" &&
  Number(product.stock_quantity ?? 0) > 0;

  // Find possible alternatives when this product is out of stock.
  const {
    data: alternativeProducts,
    isLoading: alternativesLoading,
  } = useProductSearch(
    "",
    product.category ?? "",
  );

  const alternatives =
    !inStock && Array.isArray(alternativeProducts)
      ? alternativeProducts
          .filter(
            (alternative) =>
              Number(alternative.id) !==
                Number(product.id) &&
              alternative.availability === "In Stock",
          )
          .slice(0, 2)
      : [];

  const addAlternativeToCart =
    useAddToCart();

  return (
    <div className="panel rounded-2xl p-4">
      {/* Product Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-steel">
            {product.brand}
          </div>

          <Link
            to="/product/$id"
            params={{
              id: String(product.id),
            }}
            className="mt-0.5 block text-base font-semibold leading-tight text-balance"
          >
            {product.name}
          </Link>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${
            inStock
              ? "bg-olive/15 text-olive"
              : "bg-steel/25 text-foreground"
          }`}
        >
          {product.availability}
        </span>
      </div>

      {/* Product Information */}
      <div className="mt-2 flex items-center gap-3 text-[11px]">
        <span>
          Aisle {product.aisle} · Shelf {product.shelf}
        </span>

        <span className="ml-auto font-mono text-lg font-bold tabular-nums">
          {rupees(product.price)}
        </span>
      </div>

      {/* Main Actions */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {/* Navigate */}
        <Link
          to="/map"
          search={{
            to: product.map_node_id,
            product: product.id,
          }}
          className="flex min-h-[52px] items-center justify-center rounded-xl bg-route text-sm font-semibold text-ink ring-1 ring-route"
        >
          Navigate
        </Link>

        {/* Add to Cart */}
        <button
          type="button"
          onClick={onAddToCart}
          disabled={!inStock}
          className={`min-h-[52px] rounded-xl text-sm font-semibold ${
            inStock
              ? "bg-ink text-card"
              : "cursor-not-allowed bg-steel/20 text-steel"
          }`}
        >
          {inStock
            ? "Add to Cart"
            : "Out of Stock"}
        </button>

        {/* View Details */}
        <Link
          to="/product/$id"
          params={{
            id: String(product.id),
          }}
          className="flex min-h-[44px] items-center justify-center rounded-xl bg-card text-sm font-semibold ring-1 ring-border"
        >
          View Details
        </Link>

        {/* Add to List */}
        <button
          type="button"
          onClick={onAddToList}
          className="min-h-[44px] rounded-xl bg-card text-sm font-semibold ring-1 ring-border"
        >
          Add to List
        </button>
      </div>

      {/* Out-of-Stock Alternatives */}
      {!inStock && (
        <div className="mt-4 rounded-xl bg-background p-4 ring-1 ring-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">
                Try an alternative
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Similar products available in this category.
              </p>
            </div>
          </div>

          {alternativesLoading ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Finding alternatives...
            </p>
          ) : alternatives.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              No alternatives currently available.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {alternatives.map((alternative) => (
                <div
                  key={alternative.id}
                  className="rounded-lg bg-card p-3 ring-1 ring-border"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {alternative.name}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {alternative.brand ??
                          "Alternative product"}
                      </p>

                      <p className="mt-1 font-mono text-sm font-bold">
                        {rupees(alternative.price)}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        addAlternativeToCart.isPending
                      }
                      onClick={() => {
                        addAlternativeToCart.mutate({
                          productId:
                            Number(alternative.id),
                        });
                      }}
                      className="shrink-0 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-card disabled:opacity-50"
                    >
                      {addAlternativeToCart.isPending
                        ? "Adding..."
                        : "Add"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}