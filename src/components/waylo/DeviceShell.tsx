import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { rupees } from "@/lib/session";
import { useCart } from "@/lib/waylo-client";

const tabs = [
  {
    to: "/",
    label: "Home",
    icon: <path d="M3 9l7-5 7 5v7H3z" strokeLinejoin="round" />,
  },
  {
    to: "/search",
    label: "Search",
    icon: (
      <>
        <circle cx="9" cy="9" r="6" />
        <path d="M14 14l4 4" strokeLinecap="round" />
      </>
    ),
  },
  {
    to: "/list",
    label: "List",
    icon: (
      <>
        <path d="M4 3h9l3 3v11H4z" strokeLinejoin="round" />
        <path d="M8 9h6M8 13h6" strokeLinecap="round" />
      </>
    ),
  },
  {
    to: "/map",
    label: "Map",
    icon: (
      <>
        <path d="M3 6l4-2 6 2 4-2v12l-4 2-6-2-4 2z" strokeLinejoin="round" />
        <path d="M7 4v12M13 6v12" strokeLinecap="round" />
      </>
    ),
  },
  {
    to: "/cart",
    label: "Cart",
    icon: (
      <>
        <path d="M3 4h2l2 10h8l2-7H6" strokeLinejoin="round" />
        <circle cx="9" cy="17" r="1.2" />
        <circle cx="15" cy="17" r="1.2" />
      </>
    ),
  },
] as const;

export function DeviceShell({ children }: { children: ReactNode }) {
  const { data } = useCart();
  const itemCount = data?.itemCount ?? 0;
  const total = data?.total ?? 0;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed -right-16 -top-24 size-[420px] rounded-full bg-fog/70 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -left-24 size-[460px] rounded-full bg-steel/30 blur-3xl" />

      <div className="relative mx-auto max-w-[1240px] px-4 pb-32 sm:px-6 sm:pb-28 lg:px-8">
        <header className="mt-4 flex items-center justify-between rounded-2xl bg-ink/90 px-4 py-3 ring-1 ring-white/10 sm:mt-6 sm:px-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-route font-mono text-base font-bold text-ink">
              W
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-[0.22em] text-card">WAYLO</div>
              <div className="text-[11px] text-steel">SMART SHOPPING CART · 07</div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-steel sm:flex">
              <span className="size-2 rounded-full bg-olive" />
              <span className="text-card">Waylo Mart</span> · GATE 2
            </div>
            <Link to="/cart" className="text-right leading-tight">
              <div className="font-mono text-2xl font-bold tabular-nums text-card">
                {rupees(total)}
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-steel">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </div>
            </Link>
          </div>
        </header>

        {children}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-10">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-stretch gap-1 rounded-t-[18px] bg-card/70 px-2 py-2 ring-1 ring-border backdrop-blur-xl">
            {tabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                activeOptions={{ exact: tab.to === "/" }}
                className="flex min-h-[64px] flex-1 flex-col items-center justify-center gap-1 rounded-xl text-foreground data-[status=active]:bg-ink data-[status=active]:text-card"
              >
                <span className="relative">
                  <svg
                    className="size-5 shrink-0"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {tab.icon}
                  </svg>
                  {tab.label === "Cart" && itemCount > 0 && (
                    <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-carrot text-[9px] font-bold text-card">
                      {itemCount}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-medium">{tab.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
