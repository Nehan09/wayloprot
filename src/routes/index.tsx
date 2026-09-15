import { createFileRoute, Link } from "@tanstack/react-router";

import { MapLegend, StoreMap } from "@/components/waylo/StoreMap";
import { rupees } from "@/lib/session";
import { useCart, useStore } from "@/lib/waylo-client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Waylo Cart Home — Waylo Mart" },
      {
        name: "description",
        content:
          "Start shopping: search products, open your list, scan items and see your live bill on the Waylo smart cart.",
      },
      { property: "og:title", content: "Waylo Cart Home — Waylo Mart" },
      {
        property: "og:description",
        content: "Smart cart home screen with live bill and indoor store map.",
      },
    ],
  }),
  component: Home,
});

const actions = [
  {
    to: "/search" as const,
    label: "Search",
    icon: (
      <>
        <circle cx="9" cy="9" r="6" />
        <path d="M14 14l4 4" strokeLinecap="round" />
      </>
    ),
    dark: true,
  },
  {
    to: "/list" as const,
    label: "List",
    icon: (
      <>
        <path d="M4 3h9l3 3v11H4z" strokeLinejoin="round" />
        <path d="M8 9h6M8 13h6" strokeLinecap="round" />
      </>
    ),
  },
  {
    to: "/cart" as const,
    label: "Cart",
    icon: (
      <>
        <path d="M3 4h2l2 10h8l2-7H6" strokeLinejoin="round" />
        <circle cx="9" cy="17" r="1.2" />
        <circle cx="15" cy="17" r="1.2" />
      </>
    ),
  },
  {
    to: "/map" as const,
    label: "Map",
    icon: (
      <>
        <path d="M3 6l4-2 6 2 4-2v12l-4 2-6-2-4 2z" strokeLinejoin="round" />
        <path d="M7 4v12M13 6v12" strokeLinecap="round" />
      </>
    ),
  },
];

function Home() {
  const store = useStore();
  const cart = useCart();
  const currentNode = cart.data?.cart.current_node_id ?? "entrance";
  const currentLabel =
    store.data?.nodes.find((node) => node.id === currentNode)?.label ?? "Entrance";

  return (
    <>
      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="panel rounded-2xl p-4 sm:p-5">
            <div className="eyebrow">Cart Home</div>
            <h1 className="mt-1 max-w-[26ch] text-2xl font-semibold tracking-tight text-balance">
              Find it fast, walk the shortest path.
            </h1>

            <Link
              to="/search"
              className="mt-4 flex items-center gap-2 rounded-xl bg-fog px-3 py-3 ring-1 ring-border"
            >
              <svg
                className="size-4 shrink-0 text-steel"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="9" cy="9" r="6" />
                <path d="M14 14l4 4" strokeLinecap="round" />
              </svg>
              <span className="text-base text-steel">Search a product…</span>
            </Link>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {actions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className={`flex min-h-[76px] flex-col items-start justify-between rounded-xl px-4 py-3 ${
                    action.dark ? "bg-ink text-card" : "bg-card ring-1 ring-border"
                  }`}
                >
                  <svg
                    className="size-5 shrink-0"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {action.icon}
                  </svg>
                  <span className="text-sm font-semibold">{action.label}</span>
                </Link>
              ))}
              <Link
                to="/scan"
                className="col-span-2 flex min-h-[64px] items-center justify-between rounded-xl bg-route px-4 py-3 text-ink ring-1 ring-route"
              >
                <span className="flex items-center gap-3 text-base font-semibold">
                  <svg
                    className="size-5 shrink-0"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 8V4h4M16 8V4h-4M4 12v4h4M16 12v4h-4M8 10h4" strokeLinecap="round" />
                  </svg>
                  Scan Product
                </span>
                <svg
                  className="size-5 shrink-0"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M8 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="panel flex h-full flex-col rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="eyebrow">Indoor Map · Waylo Mart</div>
                <div className="mt-1 text-lg font-semibold tracking-tight">
                  Cart is at {currentLabel}
                </div>
              </div>
              <Link
                to="/map"
                className="rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-card"
              >
                Open map
              </Link>
            </div>
            <div className="mt-4">
              {store.data && (
                <StoreMap
                  nodes={store.data.nodes}
                  edges={store.data.edges}
                  aisles={store.data.aisles}
                  currentNodeId={currentNode}
                />
              )}
            </div>
            <MapLegend />
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl bg-ink/90 px-4 py-4 ring-1 ring-white/10 sm:px-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="eyebrow">Live Bill</div>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-card">
              {cart.data?.items.length ? (
                cart.data.items.map((item) => (
                  <span key={item.id} className="font-mono tabular-nums">
                    {item.product?.name.split(" ").slice(0, 2).join(" ")} ×{item.quantity} ·{" "}
                    {rupees(item.subtotal)}
                  </span>
                ))
              ) : (
                <span className="text-steel">Cart is empty — scan or add a product to start</span>
              )}
            </div>
          </div>
          <div className="text-right leading-tight">
            <div className="font-mono text-3xl font-bold tabular-nums text-card">
              {rupees(cart.data?.total ?? 0)}
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-steel">
              Total · {cart.data?.itemCount ?? 0} items
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
