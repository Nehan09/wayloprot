import { createFileRoute } from "@tanstack/react-router";
import {
  useRetailerDashboard,
  useRetailerInventory,
  useRetailerSalesIntelligence,
  useRestockProduct,
} from "@/lib/waylo-client";

export const Route = createFileRoute("/retailer")({
  component: RetailerPage,
});

type InventoryProduct = {
  id: number;
  name: string;
  brand: string | null;
  category: string | null;
  price: number;
  aisle: number | string | null;
  availability: string | null;
  stock_quantity: number;
  reorder_level: number;
};

type RetailerData = {
  revenue: number;
  orders: number;
  itemsSold: number;
  averageOrder: number;
  inventory: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
};

type SalesProduct = {
  productId: number;
  productName: string;
  brand: string | null;
  category: string | null;
  aisle: number | null;
  unitsSold: number;
  revenue: number;
  stockQuantity: number;
  reorderLevel: number;
  priority: "High" | "Medium" | "Normal";
  revenueAtRisk: number;
  suggestedRestock: number;
  reason: string;
  promotionOpportunity: boolean;
  price: number;
};

function RetailerPage() {
  const {
    data,
    isLoading,
    error,
  } = useRetailerDashboard();

  const {
    data: inventory,
    isLoading: inventoryLoading,
    error: inventoryError,
  } = useRetailerInventory();

  const {
    data: salesIntelligence,
    isLoading: salesLoading,
    error: salesError,
  } = useRetailerSalesIntelligence();

  const restockMutation = useRestockProduct();

  const retailerData =
    data as RetailerData | undefined;

  const products: InventoryProduct[] = Array.isArray(
    inventory,
  )
    ? inventory.map((product: any) => ({
        id: Number(product.id),
        name: String(product.name ?? ""),
        brand: product.brand ?? null,
        category: product.category ?? null,
        price: Number(product.price ?? 0),
        aisle: product.aisle ?? null,
        availability: product.availability ?? null,
        stock_quantity: Number(
          product.stock_quantity ?? 0,
        ),
        reorder_level: Number(
          product.reorder_level ?? 10,
        ),
      }))
    : [];

  const salesProducts: SalesProduct[] =
    Array.isArray(salesIntelligence)
      ? salesIntelligence.map((product: any) => ({
          productId: Number(product.productId),
          productName: String(
            product.productName ?? "",
          ),
          brand: product.brand ?? null,
          category: product.category ?? null,
          aisle:
            product.aisle !== null &&
            product.aisle !== undefined
              ? Number(product.aisle)
              : null,
          unitsSold: Number(
            product.unitsSold ?? 0,
          ),
          revenue: Number(
            product.revenue ?? 0,
          ),
          stockQuantity: Number(
            product.stockQuantity ?? 0,
          ),
          reorderLevel: Number(
            product.reorderLevel ?? 10,
          ),
          priority:
            product.priority === "High"
              ? "High"
              : product.priority === "Medium"
                ? "Medium"
                : "Normal",
          revenueAtRisk: Number(
            product.revenueAtRisk ?? 0,
          ),
          suggestedRestock: Number(
            product.suggestedRestock ?? 0,
          ),
          reason: String(
            product.reason ??
              "No additional information.",
          ),
          promotionOpportunity: Boolean(
            product.promotionOpportunity,
          ),
          price: Number(product.price ?? 0),
        }))
      : [];

  if (isLoading) {
    return (
      <section className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-muted-foreground">
            Loading retailer dashboard...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-xl font-bold">
            Retailer Dashboard
          </h1>

          <p className="mt-3 text-sm text-red-500">
            Failed to load dashboard data.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold tracking-wide text-muted-foreground">
            WAYLO RETAILER
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Store Operations
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Monitor sales and live inventory from your Waylo store.
          </p>
        </div>

        {/* Today's Performance */}
        <section>
          <h2 className="text-xl font-bold">
            Today's Performance
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Today's Revenue"
              value={`₹${Number(
                retailerData?.revenue ?? 0,
              ).toFixed(2)}`}
            />

            <DashboardCard
              title="Orders"
              value={String(
                retailerData?.orders ?? 0,
              )}
            />

            <DashboardCard
              title="Items Sold"
              value={String(
                retailerData?.itemsSold ?? 0,
              )}
            />

            <DashboardCard
              title="Average Order"
              value={`₹${Number(
                retailerData?.averageOrder ?? 0,
              ).toFixed(2)}`}
            />
          </div>
        </section>

        {/* Inventory Health */}
        <section className="mt-8">
          <h2 className="text-xl font-bold">
            Inventory Health
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Total Products"
              value={String(
                retailerData?.inventory?.total ?? 0,
              )}
            />

            <DashboardCard
              title="In Stock"
              value={String(
                retailerData?.inventory?.inStock ?? 0,
              )}
            />

            <DashboardCard
              title="Low Stock"
              value={String(
                retailerData?.inventory?.lowStock ?? 0,
              )}
            />

            <DashboardCard
              title="Out of Stock"
              value={String(
                retailerData?.inventory?.outOfStock ?? 0,
              )}
            />
          </div>
        </section>

        {/* Sales Intelligence */}
        <section className="mt-8">
          <div className="rounded-2xl bg-card p-6 ring-1 ring-border">

            <p className="text-sm font-semibold tracking-wide text-muted-foreground">
              WAYLO SALES INTELLIGENCE
            </p>

            <h2 className="mt-1 text-xl font-bold">
              What customers are buying
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Waylo uses actual checkout data to identify
              high-demand products, restocking priorities,
              and promotion opportunities.
            </p>

            {salesLoading ? (
              <p className="mt-5 text-sm text-muted-foreground">
                Analyzing sales...
              </p>
            ) : salesError ? (
              <p className="mt-5 text-sm text-red-500">
                Failed to load sales intelligence.
              </p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[950px] text-left text-sm">

                  <thead className="border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-semibold">
                        Product
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Units Sold
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Revenue
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Current Stock
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Priority
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Action
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Promotion
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {salesProducts
                      .slice(0, 10)
                      .map((product) => (
                        <tr
                          key={product.productId}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-4 py-4">
                            <p className="font-medium">
                              {product.productName}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {product.category ??
                                "Uncategorized"}
                            </p>
                          </td>

                          <td className="px-4 py-4 font-semibold">
                            {product.unitsSold}
                          </td>

                          <td className="px-4 py-4">
                            ₹
                            {Number(
                              product.revenue,
                            ).toFixed(2)}
                          </td>

                          <td className="px-4 py-4">
                            {product.stockQuantity}
                          </td>

                          <td className="px-4 py-4">
                            {product.priority === "High" ? (
                              <span className="font-semibold text-red-500">
                                High
                              </span>
                            ) : product.priority === "Medium" ? (
                              <span className="font-semibold text-amber-600">
                                Medium
                              </span>
                            ) : (
                              <span className="font-semibold text-green-600">
                                Normal
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {product.priority === "High" ? (
                              <div>
                                <p className="font-semibold text-red-500">
                                  Restock Now
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                  Suggested:{" "}
                                  {
                                    product.suggestedRestock
                                  }{" "}
                                  units
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                  {product.reason}
                                </p>
                              </div>
                            ) : product.priority === "Medium" ? (
                              <div>
                                <p className="font-semibold text-amber-600">
                                  Monitor
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                  {product.reason}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                No Action
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {product.promotionOpportunity ? (
                              <div>
                                <p className="font-semibold text-amber-600">
                                  Promote
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                  Slow sales · high stock
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}

                    {salesProducts.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          No sales data yet.
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>
            )}
          </div>
        </section>

        {/* Store Attention */}
        <section className="mt-8">
          <div className="rounded-2xl bg-card p-6 ring-1 ring-border">

            <p className="text-sm font-semibold tracking-wide text-muted-foreground">
              STORE ATTENTION
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Products requiring attention
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Waylo monitors stock levels and highlights
              products that have reached their reorder threshold.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <div className="rounded-xl bg-background p-5 ring-1 ring-border">
                <p className="text-sm text-muted-foreground">
                  Low Stock
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {retailerData?.inventory?.lowStock ?? 0}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  Products at or below reorder level.
                </p>
              </div>

              <div className="rounded-xl bg-background p-5 ring-1 ring-border">
                <p className="text-sm text-muted-foreground">
                  Out of Stock
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {retailerData?.inventory?.outOfStock ?? 0}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  Products currently unavailable.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Live Inventory */}
        <section className="mt-8">
          <h2 className="text-xl font-bold">
            Live Inventory
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Stock levels reflect customer purchases made through Waylo.
          </p>

          <div className="mt-4 overflow-x-auto rounded-2xl bg-card ring-1 ring-border">

            {inventoryLoading ? (
              <p className="p-5 text-sm text-muted-foreground">
                Loading inventory...
              </p>
            ) : inventoryError ? (
              <p className="p-5 text-sm text-red-500">
                Failed to load inventory.
              </p>
            ) : products.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">
                No products found.
              </p>
            ) : (
              <table className="w-full min-w-[900px] text-left text-sm">

                <thead className="border-b border-border">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      Product
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Category
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Price
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Aisle
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Stock
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Reorder At
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const stock = Number(
                      product.stock_quantity ?? 0,
                    );

                    const reorderLevel = Number(
                      product.reorder_level ?? 10,
                    );

                    let status:
                      | "In Stock"
                      | "Low Stock"
                      | "Out of Stock";

                    if (stock <= 0) {
                      status = "Out of Stock";
                    } else if (
                      stock <= reorderLevel
                    ) {
                      status = "Low Stock";
                    } else {
                      status = "In Stock";
                    }

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {product.brand ??
                              "Unknown brand"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          {product.category ?? "-"}
                        </td>

                        <td className="px-5 py-4">
                          ₹
                          {Number(
                            product.price ?? 0,
                          ).toFixed(2)}
                        </td>

                        <td className="px-5 py-4">
                          {product.aisle ?? "-"}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {stock}
                        </td>

                        <td className="px-5 py-4">
                          {reorderLevel}
                        </td>

                        <td className="px-5 py-4">
                          {status === "In Stock" && (
                            <span className="font-semibold text-green-600">
                              In Stock
                            </span>
                          )}

                          {status === "Low Stock" && (
                            <span className="font-semibold text-amber-600">
                              Low Stock
                            </span>
                          )}

                          {status === "Out of Stock" && (
                            <span className="font-semibold text-red-500">
                              Out of Stock
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {status !== "In Stock" ? (
                            <button
                              type="button"
                              disabled={
                                restockMutation.isPending
                              }
                              onClick={() => {
                                const quantity =
                                  reorderLevel * 2;

                                restockMutation.mutate({
                                  productId:
                                    product.id,
                                  quantity,
                                });
                              }}
                              className="rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-card disabled:opacity-50"
                            >
                              {restockMutation.isPending
                                ? "Restocking..."
                                : "Restock"}
                            </button>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No action
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            )}
          </div>
        </section>

      </div>
    </section>
  );
}

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
      <p className="text-sm font-medium text-muted-foreground">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}