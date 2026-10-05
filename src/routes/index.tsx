import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import {
  useCart,
  useRetailerSalesIntelligence,
  useStore,
} from "@/lib/waylo-client";

import { MapLegend, StoreMap } from "@/components/waylo/StoreMap";
import { rupees } from "@/lib/session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Waylo Cart Home — Waylo Mart" },
      {
        name: "description",
        content:
          "Start shopping: search products, open your list, scan items and see your live bill on the Waylo smart cart.",
      },
      {
        property: "og:title",
        content: "Waylo Cart Home — Waylo Mart",
      },
      {
        property: "og:description",
        content:
          "Smart cart home screen with live bill and indoor store map.",
      },
    ],
  }),
  component: Home,
});

const translations = {
  English: {
    cartHome: "Cart Home",
    title: "Find it fast, walk the shortest path.",
    search: "Search a product…",
    list: "List",
    cart: "Cart",
    map: "Map",
    scan: "Scan Product",
    indoorMap: "Indoor Map · Waylo Mart",
    openMap: "Open map",
    cartAt: "Cart is at",
    liveBill: "Live Bill",
    emptyCart: "Cart is empty — scan or add a product to start",
    total: "Total",
    items: "items",
  },

  Hindi: {
    cartHome: "कार्ट होम",
    title: "जल्दी खोजें, सबसे छोटा रास्ता अपनाएं।",
    search: "उत्पाद खोजें…",
    list: "सूची",
    cart: "कार्ट",
    map: "मानचित्र",
    scan: "उत्पाद स्कैन करें",
    indoorMap: "इनडोर मैप · Waylo Mart",
    openMap: "मैप खोलें",
    cartAt: "कार्ट यहाँ है",
    liveBill: "लाइव बिल",
    emptyCart:
      "कार्ट खाली है — शुरू करने के लिए उत्पाद स्कैन या जोड़ें",
    total: "कुल",
    items: "आइटम",
  },

  Telugu: {
    cartHome: "కార్ట్ హోమ్",
    title: "త్వరగా కనుగొని, చిన్న మార్గంలో వెళ్లండి.",
    search: "ఉత్పత్తిని వెతకండి…",
    list: "జాబితా",
    cart: "కార్ట్",
    map: "మ్యాప్",
    scan: "ఉత్పత్తిని స్కాన్ చేయండి",
    indoorMap: "ఇండోర్ మ్యాప్ · Waylo Mart",
    openMap: "మ్యాప్ తెరవండి",
    cartAt: "కార్ట్ ఇక్కడ ఉంది",
    liveBill: "లైవ్ బిల్",
    emptyCart:
      "కార్ట్ ఖాళీగా ఉంది — ప్రారంభించడానికి ఉత్పత్తిని స్కాన్ లేదా జోడించండి",
    total: "మొత్తం",
    items: "ఐటమ్స్",
  },
};

const actions = [
  {
    to: "/search" as const,
    key: "search" as const,
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
    key: "list" as const,
    icon: (
      <>
        <path
          d="M4 3h9l3 3v11H4z"
          strokeLinejoin="round"
        />
        <path
          d="M8 9h6M8 13h6"
          strokeLinecap="round"
        />
      </>
    ),
  },

  {
    to: "/cart" as const,
    key: "cart" as const,
    icon: (
      <>
        <path
          d="M3 4h2l2 10h8l2-7H6"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="17" r="1.2" />
        <circle cx="15" cy="17" r="1.2" />
      </>
    ),
  },

  {
    to: "/map" as const,
    key: "map" as const,
    icon: (
      <>
        <path
          d="M3 6l4-2 6 2 4-2v12l-4 2-6-2-4 2z"
          strokeLinejoin="round"
        />
        <path
          d="M7 4v12M13 6v12"
          strokeLinecap="round"
        />
      </>
    ),
  },
];

function Home() {
  const store = useStore();
  const cart = useCart();

  const { data: rawSalesIntelligence } =
    useRetailerSalesIntelligence();

  const [language, setLanguage] =
    useState<keyof typeof translations>("English");

  const t = translations[language];

  const currentNode =
    cart.data?.cart.current_node_id ?? "entrance";

  const currentLabel =
    store.data?.nodes.find(
      (node) => node.id === currentNode,
    )?.label ?? "Entrance";

  /*
   * Store Picks
   *
   * We intentionally use a flexible local type here because
   * the backend may not yet return promotionOpportunity.
   */
  const salesIntelligence = Array.isArray(
    rawSalesIntelligence,
  )
    ? (rawSalesIntelligence as Array<{
        productId: number;
        productName: string;
        brand?: string | null;
        category?: string | null;
        aisle?: string | null;
        unitsSold: number;
        revenue: number;
        stockQuantity: number;
        reorderLevel: number;
        priority: string;
        revenueAtRisk: number;
        price?: number;
        promotionOpportunity?: boolean;
      }>)
    : [];

  /*
   * For now, Store Picks are based on products that
   * sold today.
   *
   * This avoids depending on promotionOpportunity
   * until that field is added to the backend.
   */
  const promotedProducts = salesIntelligence
    .filter((product) => product.unitsSold > 0)
    .slice(0, 4);

  return (
    <>
      {/* HOME + MAP */}
      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* LEFT PANEL */}
        <div className="lg:col-span-5">
          <div className="panel rounded-2xl p-4 sm:p-5">

            <div className="mb-4 flex items-center justify-between">
              <div className="eyebrow">WAYLO</div>

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(
                    e.target.value as keyof typeof translations,
                  )
                }
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium"
              >
                <option value="English">
                  English
                </option>

                <option value="Hindi">
                  हिन्दी
                </option>

                <option value="Telugu">
                  తెలుగు
                </option>
              </select>
            </div>

            <div className="eyebrow">
              {t.cartHome}
            </div>

            <h1 className="mt-1 max-w-[26ch] text-2xl font-semibold tracking-tight text-balance">
              {t.title}
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

                <path
                  d="M14 14l4 4"
                  strokeLinecap="round"
                />
              </svg>

              <span className="text-base text-steel">
                {t.search}
              </span>
            </Link>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {actions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className={`flex min-h-[76px] flex-col items-start justify-between rounded-xl px-4 py-3 ${
                    action.dark
                      ? "bg-ink text-card"
                      : "bg-card ring-1 ring-border"
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

                  <span className="text-sm font-semibold">
                    {t[action.key]}
                  </span>
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
                    <path
                      d="M4 8V4h4M16 8V4h-4M4 12v4h4M16 12v4h-4M8 10h4"
                      strokeLinecap="round"
                    />
                  </svg>

                  {t.scan}
                </span>

                <svg
                  className="size-5 shrink-0"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M8 5l5 5-5 5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* MAP */}
        <div className="lg:col-span-7">
          <div className="panel flex h-full flex-col rounded-2xl p-4 sm:p-5">

            <div className="flex items-center justify-between">
              <div>
                <div className="eyebrow">
                  {t.indoorMap}
                </div>

                <div className="mt-1 text-lg font-semibold tracking-tight">
                  {t.cartAt} {currentLabel}
                </div>
              </div>

             <a
  href="/map"
  className="rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-card"
>
  {t.openMap}
</a>
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

      {/* STORE PICKS */}
      {promotedProducts.length > 0 && (
        <section className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-border sm:p-5">

          <div className="mb-4">
            <div className="eyebrow">
              WAYLO PICKS
            </div>

            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              Store Picks
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Popular products you might want to check out.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {promotedProducts.map((product) => (
              <Link
                key={product.productId}
                to="/product/$id"
                params={{
                  id: String(product.productId),
                }}
                className="rounded-xl bg-fog p-4 ring-1 ring-border transition hover:ring-2"
              >
                <p className="font-semibold">
                  {product.productName}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {product.brand ?? "Unknown brand"}
                </p>

                {product.category && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {product.category}
                  </p>
                )}

                <p className="mt-3 text-lg font-bold">
                  ₹
                  {Number(
                    product.price ?? 0,
                  ).toFixed(2)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {product.unitsSold} sold today
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* LIVE BILL */}
      <section className="mt-4 rounded-2xl bg-ink/90 px-4 py-4 ring-1 ring-white/10 sm:px-5">
        <div className="flex items-center justify-between gap-4">

          <div>
            <div className="eyebrow">
              {t.liveBill}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-card">
              {cart.data?.items.length ? (
                cart.data.items.map((item) => (
                  <span
                    key={item.id}
                    className="font-mono tabular-nums"
                  >
                    {item.product?.name
                      .split(" ")
                      .slice(0, 2)
                      .join(" ")}{" "}
                    ×{item.quantity} ·{" "}
                    {rupees(item.subtotal)}
                  </span>
                ))
              ) : (
                <span className="text-steel">
                  {t.emptyCart}
                </span>
              )}
            </div>
          </div>

          <div className="text-right leading-tight">
            <div className="font-mono text-3xl font-bold tabular-nums text-card">
              {rupees(
                cart.data?.total ?? 0,
              )}
            </div>

            <div className="text-[10px] uppercase tracking-[0.22em] text-steel">
              {t.total} ·{" "}
              {cart.data?.itemCount ?? 0}{" "}
              {t.items}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}