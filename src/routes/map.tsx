import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapLegend, StoreMap } from "@/components/waylo/StoreMap";
import { useCart, useRoute, useSetPosition, useStore } from "@/lib/waylo-client";
import { rupees } from "@/lib/session";

export const Route = createFileRoute("/map")({
  validateSearch: (search: Record<string, unknown>) => ({
    to: typeof search.to === "string" ? search.to : undefined,
    product: search.product ? Number(search.product) : undefined,
  }),
  component: MapPage,
});

function MapPage() {
  const { to, product } = Route.useSearch();
  const store = useStore();
  const cart = useCart();
  const route = useRoute();
  const setPosition = useSetPosition();
  const [destination, setDestination] = useState<string | undefined>(to);
  const [routeIds, setRouteIds] = useState<string[]>([]);

  const current = cart.data?.cart.current_node_id ?? "entrance";
  const destinationProduct = useMemo(
    () => product && store.data ? undefined : undefined,
    [product, store.data],
  );

  useEffect(() => {
    setDestination(to);
    setRouteIds([]);
  }, [to]);

  const calculate = (target: string) => {
    setDestination(target);
    route.mutate(
      { from: current, to: target },
      { onSuccess: (data) => setRouteIds(data.nodeIds) },
    );
  };

  const targetNode = store.data?.nodes.find((n) => n.id === destination);
  const currentNode = store.data?.nodes.find((n) => n.id === current);

  return (
    <section className="mt-4">
      <div className="panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="eyebrow">Indoor Navigation · Waylo Mart</div>
            <h1 className="mt-1 text-2xl font-semibold">Find the shortest path</h1>
            <p className="mt-1 text-sm text-steel">
              Current cart location: <b className="text-foreground">{currentNode?.label ?? "Entrance"}</b>
            </p>
          </div>
          <Link to="/search" className="rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-card">Find Product</Link>
        </div>

        {store.data && (
          <>
            <div className="mt-4">
              <StoreMap
                nodes={store.data.nodes}
                edges={store.data.edges}
                aisles={store.data.aisles}
                currentNodeId={current}
                destinationNodeId={destination}
                routeNodeIds={routeIds}
                onSelectNode={(nodeId) => setPosition.mutate({ nodeId })}
              />
            </div>
            <MapLegend />
            <div className="mt-4 rounded-2xl bg-fog p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-steel">Demo location control</div>
              <p className="mt-1 text-xs text-steel">Tap an aisle on the map to simulate the cart moving there.</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {store.data.aisles.map((aisle) => (
                  <button
                    key={aisle.id}
                    disabled={setPosition.isPending}
                    onClick={() => aisle.map_node_id && setPosition.mutate({ nodeId: aisle.map_node_id })}
                    className="rounded-xl bg-card px-3 py-2 text-left text-xs font-semibold ring-1 ring-border"
                  >
                    A{aisle.aisle_number} · {aisle.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {destination && (
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="rounded-2xl bg-route/15 p-4 ring-1 ring-route/30">
              <div className="eyebrow">Destination</div>
              <div className="mt-1 font-semibold">{targetNode?.label ?? destination}</div>
              {route.data && (
                <div className="mt-2 text-sm">
                  <b>{route.data.distance} m</b> away · {route.data.instructions.length} navigation steps
                </div>
              )}
            </div>
            <button
              disabled={route.isPending}
              onClick={() => calculate(destination)}
              className="min-h-14 rounded-xl bg-ink px-6 font-semibold text-card"
            >
              {route.isPending ? "Calculating..." : routeIds.length ? "Recalculate Route" : "Start Navigation"}
            </button>
          </div>
        )}

        <div className="mt-4">
          <div className="text-sm font-semibold">Choose a destination</div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {store.data?.aisles.map((aisle) => (
              <button
                key={aisle.id}
                onClick={() => aisle.map_node_id && calculate(aisle.map_node_id)}
                className={`rounded-xl px-3 py-3 text-left text-sm font-semibold ring-1 ${
                  destination === aisle.map_node_id ? "bg-ink text-card ring-ink" : "bg-card ring-border"
                }`}
              >
                A{aisle.aisle_number}<span className="block text-xs font-normal opacity-70">{aisle.name}</span>
              </button>
            ))}
          </div>
        </div>

        {route.data && (
          <div className="mt-4 rounded-2xl bg-ink p-4 text-card">
            <div className="eyebrow">Turn-by-turn</div>
            <div className="mt-2 space-y-2">
              {route.data.instructions.map((instruction, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-card/15 font-mono">{i + 1}</span>
                  <span>{instruction}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
