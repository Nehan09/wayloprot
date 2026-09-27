// Waylo backend data layer. All database access and route calculation lives here,
// so server functions (app UI) and REST routes (future ESP32 / scanner / RFID
// hardware) share exactly the same logic.

import { supabaseAdmin as db } from "@/integrations/supabase/client.server";
import {
  aStar,
  buildGraph,
  routeInstructions,
  type MapEdge,
  type MapNode,
} from "./astar";

const ENTRANCE = "entrance";
const CHECKOUT = "checkout";

/* ---------------------------------- store --------------------------------- */

export async function getStore() {
  const [nodes, edges, aisles] = await Promise.all([
    db.from("map_nodes").select("*"),
    db.from("map_edges").select("from_node,to_node,distance"),
    db.from("aisles").select("*").order("aisle_number"),
  ]);

  if (nodes.error) throw nodes.error;
  if (edges.error) throw edges.error;
  if (aisles.error) throw aisles.error;

  return {
    store: "Waylo Mart",
    nodes: nodes.data.map((n) => ({
      ...n,
      x: Number(n.x),
      y: Number(n.y),
    })) as MapNode[],
    edges: edges.data as MapEdge[],
    aisles: aisles.data,
  };
}

async function getGraph() {
  const { nodes, edges } = await getStore();
  return buildGraph(nodes, edges);
}

/* --------------------------------- products -------------------------------- */

export async function searchProducts(
  query?: string,
  category?: string,
) {
  let request = db
    .from("products")
    .select("*")
    .order("name")
    .limit(60);

  if (query && query.trim()) {
    const term = `%${query.trim()}%`;

    request = request.or(
      `name.ilike.${term},brand.ilike.${term},category.ilike.${term}`,
    );
  }

  if (category && category !== "All") {
    request = request.eq("category", category);
  }

  const { data, error } = await request;

  if (error) throw error;

  return data ?? [];
}

export async function getCategories() {
  const { data, error } = await db
    .from("products")
    .select("category");

  if (error) throw error;

  return [
    ...new Set(
      data
        .map((row) => row.category)
        .filter(Boolean),
    ),
  ].sort() as string[];
}

export async function getProduct(id: number) {
  const { data, error } = await db
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function getProductByBarcode(barcode: string) {
  const { data, error } = await db
    .from("products")
    .select("*")
    .eq("barcode", barcode.trim())
    .maybeSingle();

  if (error) throw error;

  return data;
}

/* ----------------------------------- cart ---------------------------------- */

export async function ensureCart(sessionId: string) {
  const existing = await db
    .from("carts")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing.error) throw existing.error;

  if (existing.data) {
    return existing.data;
  }

  const created = await db
    .from("carts")
    .insert({
      session_id: sessionId,
      current_node_id: ENTRANCE,
    })
    .select("*")
    .single();

  if (created.error) throw created.error;

  return created.data;
}

async function recalculateTotal(cartId: string) {
  const { data, error } = await db
    .from("cart_items")
    .select("quantity,price")
    .eq("cart_id", cartId);

  if (error) throw error;

  const total = (data ?? []).reduce(
    (sum, item) =>
      sum + Number(item.price) * item.quantity,
    0,
  );

  const updated = await db
    .from("carts")
    .update({
      total,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cartId);

  if (updated.error) throw updated.error;

  return total;
}

export async function getCart(sessionId: string) {
  const cart = await ensureCart(sessionId);

  const { data, error } = await db
    .from("cart_items")
    .select(
      "id,quantity,price,source,product:products(*)",
    )
    .eq("cart_id", cart.id)
    .order("id");

  if (error) throw error;

  const items = (data ?? []).map((item) => ({
    ...item,
    price: Number(item.price),
    subtotal: Number(item.price) * item.quantity,
  }));

  return {
    cart: {
      ...cart,
      total: Number(cart.total),
    },

    items,

    itemCount: items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    ),

    total: items.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    ),
  };
}

export async function addCartItem(
  sessionId: string,
  productId: number,
  quantity = 1,
  source = "manual",
) {
  const cart = await ensureCart(sessionId);

  const product = await getProduct(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  const existing = await db
    .from("cart_items")
    .select("id,quantity")
    .eq("cart_id", cart.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing.error) throw existing.error;

  if (existing.data) {
    const updated = await db
      .from("cart_items")
      .update({
        quantity:
          existing.data.quantity + quantity,
      })
      .eq("id", existing.data.id);

    if (updated.error) throw updated.error;
  } else {
    const inserted = await db
      .from("cart_items")
      .insert({
        cart_id: cart.id,
        product_id: productId,
        quantity,
        price: product.price,
        source,
      });

    if (inserted.error) throw inserted.error;
  }

  await recalculateTotal(cart.id);

  return {
    product,
    cart: await getCart(sessionId),
  };
}

export async function setCartItemQuantity(
  sessionId: string,
  productId: number,
  quantity: number,
) {
  const cart = await ensureCart(sessionId);

  if (quantity <= 0) {
    return removeCartItem(sessionId, productId);
  }

  const updated = await db
    .from("cart_items")
    .update({ quantity })
    .eq("cart_id", cart.id)
    .eq("product_id", productId);

  if (updated.error) throw updated.error;

  await recalculateTotal(cart.id);

  return getCart(sessionId);
}

export async function removeCartItem(
  sessionId: string,
  productId: number,
) {
  const cart = await ensureCart(sessionId);

  const deleted = await db
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.id)
    .eq("product_id", productId);

  if (deleted.error) throw deleted.error;

  await recalculateTotal(cart.id);

  return getCart(sessionId);
}

export async function scanBarcode(
  sessionId: string,
  barcode: string,
) {
  const product = await getProductByBarcode(barcode);

  if (!product) {
    return {
      found: false as const,
      product: null,
      cart: await getCart(sessionId),
    };
  }

  const { cart } = await addCartItem(
    sessionId,
    product.id,
    1,
    "scanner",
  );

  return {
    found: true as const,
    product,
    cart,
  };
}

export async function checkoutCart(sessionId: string) {
  const { cart, items, total, itemCount } = await getCart(sessionId);

  const inserted = await db
    .from("checkouts")
    .insert({
      cart_id: cart.id,
      total,
      item_count: itemCount,
    })
    .select("*")
    .single();

  if (inserted.error) throw inserted.error;

  // Clear all items from the cart after successful checkout
  const deleted = await db
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.id);

  if (deleted.error) throw deleted.error;

  // Reset cart for the next shopping session
  const updated = await db
    .from("carts")
    .update({
      total: 0,
      status: "active",
      current_node_id: ENTRANCE,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cart.id);

  if (updated.error) throw updated.error;

  return {
    receipt: inserted.data,
    items,
    total,
    itemCount,
  };
}
/* ------------------------------ shopping list ----------------------------- */

export async function ensureList(sessionId: string) {
  const existing = await db
    .from("shopping_lists")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing.error) throw existing.error;

  if (existing.data) {
    return existing.data;
  }

  const created = await db
    .from("shopping_lists")
    .insert({
      session_id: sessionId,
    })
    .select("*")
    .single();

  if (created.error) throw created.error;

  return created.data;
}

export async function getList(sessionId: string) {
  const list = await ensureList(sessionId);

  const { data, error } = await db
    .from("shopping_list_items")
    .select("id,status,product:products(*)")
    .eq("shopping_list_id", list.id)
    .order("id");

  if (error) throw error;

  return {
    list,
    items: data ?? [],
  };
}

export async function addListItem(
  sessionId: string,
  productId: number,
) {
  const list = await ensureList(sessionId);

  const inserted = await db
    .from("shopping_list_items")
    .upsert(
      {
        shopping_list_id: list.id,
        product_id: productId,
        status: "pending",
      },
      {
        onConflict:
          "shopping_list_id,product_id",
        ignoreDuplicates: true,
      },
    );

  if (inserted.error) throw inserted.error;

  return getList(sessionId);
}

export async function removeListItem(
  sessionId: string,
  productId: number,
) {
  const list = await ensureList(sessionId);

  const deleted = await db
    .from("shopping_list_items")
    .delete()
    .eq("shopping_list_id", list.id)
    .eq("product_id", productId);

  if (deleted.error) throw deleted.error;

  return getList(sessionId);
}

export async function setListItemStatus(
  sessionId: string,
  productId: number,
  status: string,
) {
  const list = await ensureList(sessionId);

  const updated = await db
    .from("shopping_list_items")
    .update({ status })
    .eq("shopping_list_id", list.id)
    .eq("product_id", productId);

  if (updated.error) throw updated.error;

  return getList(sessionId);
}

export async function addListToCart(sessionId: string) {
  const { items } = await getList(sessionId);

  for (const item of items) {
    if (item.product) {
      await addCartItem(
        sessionId,
        item.product.id,
        1,
        "list",
      );
    }
  }

  return getCart(sessionId);
}

/* -------------------------------- navigation ------------------------------- */

export async function setCartPosition(
  sessionId: string,
  nodeId: string,
) {
  const cart = await ensureCart(sessionId);

  const updated = await db
    .from("carts")
    .update({
      current_node_id: nodeId,
    })
    .eq("id", cart.id);

  if (updated.error) throw updated.error;

  return {
    ...cart,
    current_node_id: nodeId,
  };
}

export async function calculateRoute(
  fromNodeId: string,
  toNodeId: string,
) {
  const graph = await getGraph();

  const result = aStar(
    graph,
    fromNodeId,
    toNodeId,
  );

  if (!result) {
    throw new Error(
      `No walkable route from ${fromNodeId} to ${toNodeId}`,
    );
  }

  return {
    from: fromNodeId,
    to: toNodeId,
    path: result.path,
    nodeIds: result.path.map(
      (node) => node.id,
    ),
    distance: result.distance,
    instructions: routeInstructions(
      result.path,
    ),
  };
}

export async function optimizeListRoute(
  sessionId: string,
  fromNodeId?: string,
) {
  const [
    { items },
    cart,
    graph,
  ] = await Promise.all([
    getList(sessionId),
    ensureCart(sessionId),
    getGraph(),
  ]);

  const start =
    fromNodeId ??
    cart.current_node_id ??
    ENTRANCE;

  const pending = items.filter(
    (item) =>
      item.status !== "found" &&
      item.product,
  );

  const stops: {
    nodeId: string;
    label: string;
    products: {
      id: number;
      name: string;
      price: number;
    }[];
  }[] = [];

  for (const item of pending) {
    const product = item.product!;

    const stop = stops.find(
      (s) =>
        s.nodeId === product.map_node_id,
    );

    const entry = {
      id: product.id,
      name: product.name,
      price: Number(product.price),
    };

    if (stop) {
      stop.products.push(entry);
    } else {
      stops.push({
        nodeId: product.map_node_id,
        label: `Aisle ${product.aisle}`,
        products: [entry],
      });
    }
  }

  const legs: {
    from: string;
    to: string;
    label: string;
    distance: number;
    nodeIds: string[];
    products: {
      id: number;
      name: string;
      price: number;
    }[];
  }[] = [];

  let current = start;
  const remaining = [...stops];

  while (remaining.length > 0) {
    let bestIndex = 0;

    const firstStop = remaining[0];

    if (!firstStop) {
      break;
    }

    let bestRoute = aStar(
      graph,
      current,
      firstStop.nodeId,
    );

    for (
      let i = 1;
      i < remaining.length;
      i++
    ) {
      const stop = remaining[i];

      if (!stop) {
        continue;
      }

      const candidate = aStar(
        graph,
        current,
        stop.nodeId,
      );

      if (
        candidate &&
        (!bestRoute ||
          candidate.distance <
            bestRoute.distance)
      ) {
        bestRoute = candidate;
        bestIndex = i;
      }
    }

    const next = remaining.splice(
      bestIndex,
      1,
    )[0];

    if (!next || !bestRoute) {
      continue;
    }

    legs.push({
      from: current,
      to: next.nodeId,
      label: next.label,
      distance: bestRoute.distance,
      nodeIds: bestRoute.path.map(
        (node) => node.id,
      ),
      products: next.products,
    });

    current = next.nodeId;
  }

  const finalLeg = aStar(
    graph,
    current,
    CHECKOUT,
  );

  if (finalLeg) {
    legs.push({
      from: current,
      to: CHECKOUT,
      label: "Checkout",
      distance: finalLeg.distance,
      nodeIds: finalLeg.path.map(
        (node) => node.id,
      ),
      products: [],
    });
  }

  const nodeIds = legs.flatMap(
    (leg, index) =>
      index === 0
        ? leg.nodeIds
        : leg.nodeIds.slice(1),
  );

  return {
    start,
    legs,
    nodeIds,
    totalDistance: Number(
      legs
        .reduce(
          (sum, leg) =>
            sum + leg.distance,
          0,
        )
        .toFixed(1),
    ),
  };
}

/* ----------------------------- retailer ----------------------------------- */

export async function getRetailerDashboard() {
  const now = new Date();

  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString();

  const {
    data: checkouts,
    error: checkoutError,
  } = await db
    .from("checkouts")
    .select(
      "total, item_count, created_at",
    )
    .gte("created_at", startOfDay);

  if (checkoutError) {
    throw checkoutError;
  }

  const revenue = (
    checkouts ?? []
  ).reduce(
    (sum, checkout) =>
      sum +
      Number(checkout.total ?? 0),
    0,
  );

  const orders =
    checkouts?.length ?? 0;

  const itemsSold = (
    checkouts ?? []
  ).reduce(
    (sum, checkout) =>
      sum +
      Number(
        checkout.item_count ?? 0,
      ),
    0,
  );

  const averageOrder =
    orders > 0
      ? revenue / orders
      : 0;

  const {
    data: products,
    error: productError,
  } = await db
    .from("products")
    .select(
      "id, availability",
    );

  if (productError) {
    throw productError;
  }

  const totalProducts =
    products?.length ?? 0;

  const outOfStock =
    products?.filter(
      (product) =>
        !product.availability,
    ).length ?? 0;

  const inStock =
    totalProducts -
    outOfStock;

  return {
    revenue,
    orders,
    itemsSold,
    averageOrder,
    inventory: {
      total: totalProducts,
      inStock,
      outOfStock,
    },
  };
}

export async function getRetailerInventory() {
  const {
    data,
    error,
  } = await db
    .from("products")
    .select(
      "id, name, brand, category, price, aisle, availability",
    )
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/* -------------------------- AI savings ------------------------------------ */

export async function getSavingsRecommendations(
  sessionId: string,
) {
  const cart = await getCart(
    sessionId,
  );

  const recommendations: {
    currentProduct: string;
    currentPrice: number;
    suggestedProduct: string;
    suggestedPrice: number;
    saving: number;
    reason: string;
  }[] = [];

  for (const item of cart.items) {
    const product = item.product;

    if (!product) {
      continue;
    }

    const alternatives =
      await searchProducts(
        "",
        product.category ?? "",
      );

    const cheaper =
      alternatives
        .filter(
          (alternative) =>
            alternative.id !==
              product.id &&
            Number(
              alternative.price,
            ) <
              Number(
                product.price,
              ),
        )
        .sort(
          (a, b) =>
            Number(a.price) -
            Number(b.price),
        );

    const alternative =
      cheaper[0];

    if (!alternative) {
      continue;
    }

    const currentPrice =
      Number(product.price);

    const suggestedPrice =
      Number(alternative.price);

    recommendations.push({
      currentProduct:
        product.name,

      currentPrice,

      suggestedProduct:
        alternative.name,

      suggestedPrice,

      saving:
        currentPrice -
        suggestedPrice,

      reason:
        "Similar product available for less",
    });
  }

  return recommendations;
}
export async function getInventoryRecommendations() {
  const { data: products, error } = await db
    .from("products")
    .select("id, name, brand, category, price, availability, aisle")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  const recommendations = (products ?? []).map((product) => {
    if (!product.availability) {
      return {
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        category: product.category,
        aisle: product.aisle,
        status: "urgent",
        recommendation: "Restock immediately",
        reason: "Product is currently out of stock",
      };
    }

    return {
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      category: product.category,
      aisle: product.aisle,
      status: "healthy",
      recommendation: "Stock level is healthy",
      reason: "Product is currently available",
    };
  });

  return recommendations;
}