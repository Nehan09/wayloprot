import { createFileRoute } from "@tanstack/react-router";
import {
  useInventoryRecommendations,
  useRetailerDashboard,
  useRetailerInventory,
} from "@/lib/waylo-client";

export const Route = createFileRoute("/retailer")({
  component: RetailerPage,
});

function RetailerPage() {
  const { data, isLoading, error } = useRetailerDashboard();

  const {
    data: inventory,
    isLoading: inventoryLoading,
    error: inventoryError,
  } = useRetailerInventory();

  const {
    data: recommendations,
    isLoading: recommendationsLoading,
  } = useInventoryRecommendations();

  if (isLoading) {
    return (
      <section className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-6xl">
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
        <div className="mx-auto max-w-6xl">
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

  const urgentProducts =
    recommendations?.filter(
      (item) => item.status === "urgent",
    ) ?? [];

  return (
    <section className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">
            WAYLO RETAILER
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Today's store performance
          </p>
        </div>

        {/* Sales Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Today's Revenue"
            value={`₹${data?.revenue?.toFixed(2) ?? "0.00"}`}
          />

          <DashboardCard
            title="Orders Today"
            value={String(data?.orders ?? 0)}
          />

          <DashboardCard
            title="Items Sold"
            value={String(data?.itemsSold ?? 0)}
          />

          <DashboardCard
            title="Average Order"
            value={`₹${data?.averageOrder?.toFixed(2) ?? "0.00"}`}
          />
        </div>

        {/* Inventory Overview */}
        <div className="mt-8">
          <h2 className="text-xl font-bold">
            Inventory Overview
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <DashboardCard
              title="Total Products"
              value={String(data?.inventory?.total ?? 0)}
            />

            <DashboardCard
              title="In Stock"
              value={String(data?.inventory?.inStock ?? 0)}
            />

            <DashboardCard
              title="Out of Stock"
              value={String(data?.inventory?.outOfStock ?? 0)}
            />
          </div>
        </div>

        {/* AI Inventory Management */}
        <div className="mt-8 rounded-2xl bg-route p-5 ring-1 ring-route">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              AI INVENTORY MANAGEMENT
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Smart Stock Recommendations
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Waylo analyzes your inventory and identifies products
              that need attention.
            </p>
          </div>

          {recommendationsLoading ? (
            <p className="mt-5 text-sm text-muted-foreground">
              Analyzing inventory...
            </p>
          ) : urgentProducts.length === 0 ? (
            <div className="mt-5 rounded-xl bg-card p-4">
              <p className="font-semibold text-green-600">
                ✓ Inventory looks healthy
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                No products currently require urgent restocking.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {urgentProducts.map((product) => (
                <div
                  key={product.productId}
                  className="rounded-xl bg-card p-4 ring-1 ring-border"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        {product.productName}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {product.brand ?? "Unknown brand"} ·{" "}
                        {product.category ?? "Uncategorized"}
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        Aisle: {product.aisle ?? "-"}
                      </p>
                    </div>

                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                      Urgent
                    </span>
                  </div>

                  <div className="mt-3 border-t border-border pt-3">
                    <p className="text-sm font-semibold">
                      {product.recommendation}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Inventory */}
        <div className="mt-8">
          <h2 className="text-xl font-bold">
            Product Inventory
          </h2>

          <div className="mt-4 overflow-x-auto rounded-2xl bg-card shadow-sm ring-1 ring-border">
            {inventoryLoading ? (
              <p className="p-5 text-sm text-muted-foreground">
                Loading inventory...
              </p>
            ) : inventoryError ? (
              <p className="p-5 text-sm text-red-500">
                Failed to load inventory.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      Product
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Brand
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
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {inventory?.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-5 py-4 font-medium">
                        {product.name}
                      </td>

                      <td className="px-5 py-4">
                        {product.brand ?? "-"}
                      </td>

                      <td className="px-5 py-4">
                        {product.category ?? "-"}
                      </td>

                      <td className="px-5 py-4">
                        ₹{Number(product.price).toFixed(2)}
                      </td>

                      <td className="px-5 py-4">
                        {product.aisle ?? "-"}
                      </td>

                      <td className="px-5 py-4">
                        {product.availability ? (
                          <span className="font-medium text-green-600">
                            In Stock
                          </span>
                        ) : (
                          <span className="font-medium text-red-500">
                            Out of Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
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