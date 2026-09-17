import type { MapEdge, MapNode } from "@/lib/astar";

type Aisle = { aisle_number: number; name: string; map_node_id: string | null };

type Props = {
  nodes: MapNode[];
  edges: MapEdge[];
  aisles: Aisle[];
  routeNodeIds?: string[];
  currentNodeId?: string | null;
  destinationNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
};

export function StoreMap({
  nodes,
  edges,
  aisles,
  routeNodeIds = [],
  currentNodeId,
  destinationNodeId,
  onSelectNode,
}: Props) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const aisleByNode = new Map(aisles.map((aisle) => [aisle.map_node_id, aisle]));
  const routePoints = routeNodeIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((node) => `${node!.x},${node!.y}`)
    .join(" ");

  const current = currentNodeId ? byId.get(currentNodeId) : undefined;
  const destination = destinationNodeId ? byId.get(destinationNodeId) : undefined;
  const seen = new Set<string>();

  return (
    <div className="overflow-hidden rounded-xl bg-fog ring-1 ring-border">
      <svg viewBox="-20 40 940 640" className="h-auto w-full" role="img" aria-label="Waylo Mart indoor store map">
        {/* walkable paths */}
        {edges.map((edge) => {
          const key = [edge.from_node, edge.to_node].sort().join("|");
          if (seen.has(key)) return null;
          seen.add(key);
          const a = byId.get(edge.from_node);
          const b = byId.get(edge.to_node);
          if (!a || !b) return null;
          return (
            <line
              key={key}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--steel)"
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })}

        {/* aisle shelving blocks */}
        {nodes
          .filter((node) => node.node_type === "aisle")
          .map((node) => {
            const aisle = aisleByNode.get(node.id);
            const isDestination = node.id === destinationNodeId;
            const onRoute = routeNodeIds.includes(node.id);
            return (
              <g
                key={node.id}
                onClick={onSelectNode ? () => onSelectNode(node.id) : undefined}
                className={onSelectNode ? "cursor-pointer" : undefined}
              >
                <rect
                  x={node.x - 38}
                  y={node.y - 88}
                  width={76}
                  height={176}
                  rx={8}
                  fill={
                    isDestination
                      ? "color-mix(in oklab, var(--carrot) 18%, white)"
                      : onRoute
                        ? "color-mix(in oklab, var(--route) 12%, white)"
                        : "white"
                  }
                  stroke={
                    isDestination
                      ? "var(--carrot)"
                      : onRoute
                        ? "var(--route)"
                        : "oklch(0.194 0.012 232 / 0.14)"
                  }
                  strokeWidth={isDestination || onRoute ? 2 : 1}
                />
                <text
                  x={node.x}
                  y={node.y - 62}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize={15}
                  fontWeight={700}
                  fill="var(--ink)"
                >
                  {aisle ? `A${aisle.aisle_number}` : ""}
                </text>
                <text
                  x={node.x}
                  y={node.y + 20}
                  textAnchor="middle"
                  transform={`rotate(-90 ${node.x} ${node.y + 20})`}
                  fontSize={13}
                  fill="var(--muted-foreground)"
                >
                  {aisle?.name ?? node.label}
                </text>
              </g>
            );
          })}

        {/* entrance + checkout */}
        {nodes
          .filter((node) => node.node_type === "entrance" || node.node_type === "checkout")
          .map((node) => (
            <g key={node.id}>
              <rect
                x={node.x - 46}
                y={node.y - 46}
                width={92}
                height={56}
                rx={8}
                fill="var(--ink)"
              />
              <text
                x={node.x}
                y={node.y - 12}
                textAnchor="middle"
                className="font-mono"
                fontSize={13}
                fill="white"
              >
                {node.node_type === "entrance" ? "ENTRANCE" : "CHECKOUT"}
              </text>
            </g>
          ))}

        {/* calculated A* route */}
        {routePoints && (
          <polyline
            className="route-draw"
            points={routePoints}
            fill="none"
            stroke="var(--route)"
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {current && (
          <g>
            <circle cx={current.x} cy={current.y} r={13} fill="var(--ink)" />
            <circle cx={current.x} cy={current.y} r={5} fill="white" />
          </g>
        )}
        {destination && (
          <g>
            <circle cx={destination.x} cy={destination.y} r={13} fill="var(--carrot)" />
            <circle cx={destination.x} cy={destination.y} r={5} fill="white" />
          </g>
        )}
      </svg>
    </div>
  );
}

export function MapLegend() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px]">
      <span className="flex items-center gap-2">
        <span className="h-[3px] w-6 rounded-full bg-route" />
        Route
      </span>
      <span className="flex items-center gap-2">
        <span className="size-3 rounded-full bg-ink" />
        Cart location
      </span>
      <span className="flex items-center gap-2">
        <span className="size-3 rounded-full bg-carrot" />
        Destination
      </span>
      <span className="flex items-center gap-2">
        <span className="size-3 rounded-sm bg-card ring-1 ring-border" />
        Aisle
      </span>
    </div>
  );
}
