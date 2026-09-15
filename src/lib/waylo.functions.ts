// Typed RPC boundary between the Waylo touchscreen UI and the backend.
// The UI never touches the database directly.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const sessionSchema = z.object({ sessionId: z.string().min(1) });

export const fetchStore = createServerFn({ method: "GET" }).handler(async () => {
  const { getStore } = await import("./waylo.server");
  return getStore();
});

export const fetchCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { getCategories } = await import("./waylo.server");
  return getCategories();
});

export const searchProducts = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ q: z.string().optional(), category: z.string().optional() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { searchProducts } = await import("./waylo.server");
    return searchProducts(data.q, data.category);
  });

export const fetchProduct = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.number() }).parse(data))
  .handler(async ({ data }) => {
    const { getProduct } = await import("./waylo.server");
    return getProduct(data.id);
  });

export const fetchCart = createServerFn({ method: "GET" })
  .inputValidator((data) => sessionSchema.parse(data))
  .handler(async ({ data }) => {
    const { getCart } = await import("./waylo.server");
    return getCart(data.sessionId);
  });

export const addToCart = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    sessionSchema
      .extend({ productId: z.number(), quantity: z.number().optional() })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { addCartItem } = await import("./waylo.server");
    return addCartItem(data.sessionId, data.productId, data.quantity ?? 1);
  });

export const updateCartItem = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    sessionSchema.extend({ productId: z.number(), quantity: z.number() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { setCartItemQuantity } = await import("./waylo.server");
    return setCartItemQuantity(data.sessionId, data.productId, data.quantity);
  });

export const removeFromCart = createServerFn({ method: "POST" })
  .inputValidator((data) => sessionSchema.extend({ productId: z.number() }).parse(data))
  .handler(async ({ data }) => {
    const { removeCartItem } = await import("./waylo.server");
    return removeCartItem(data.sessionId, data.productId);
  });

export const scanProduct = createServerFn({ method: "POST" })
  .inputValidator((data) => sessionSchema.extend({ barcode: z.string().min(3) }).parse(data))
  .handler(async ({ data }) => {
    const { scanBarcode } = await import("./waylo.server");
    return scanBarcode(data.sessionId, data.barcode);
  });

export const checkout = createServerFn({ method: "POST" })
  .inputValidator((data) => sessionSchema.parse(data))
  .handler(async ({ data }) => {
    const { checkoutCart } = await import("./waylo.server");
    return checkoutCart(data.sessionId);
  });

export const fetchList = createServerFn({ method: "GET" })
  .inputValidator((data) => sessionSchema.parse(data))
  .handler(async ({ data }) => {
    const { getList } = await import("./waylo.server");
    return getList(data.sessionId);
  });

export const addToList = createServerFn({ method: "POST" })
  .inputValidator((data) => sessionSchema.extend({ productId: z.number() }).parse(data))
  .handler(async ({ data }) => {
    const { addListItem } = await import("./waylo.server");
    return addListItem(data.sessionId, data.productId);
  });

export const removeFromList = createServerFn({ method: "POST" })
  .inputValidator((data) => sessionSchema.extend({ productId: z.number() }).parse(data))
  .handler(async ({ data }) => {
    const { removeListItem } = await import("./waylo.server");
    return removeListItem(data.sessionId, data.productId);
  });

export const setListStatus = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    sessionSchema
      .extend({ productId: z.number(), status: z.enum(["pending", "found"]) })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { setListItemStatus } = await import("./waylo.server");
    return setListItemStatus(data.sessionId, data.productId, data.status);
  });

export const addListToCart = createServerFn({ method: "POST" })
  .inputValidator((data) => sessionSchema.parse(data))
  .handler(async ({ data }) => {
    const { addListToCart } = await import("./waylo.server");
    return addListToCart(data.sessionId);
  });

export const updateCartPosition = createServerFn({ method: "POST" })
  .inputValidator((data) => sessionSchema.extend({ nodeId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { setCartPosition } = await import("./waylo.server");
    return setCartPosition(data.sessionId, data.nodeId);
  });

export const calculateRoute = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ from: z.string(), to: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { calculateRoute } = await import("./waylo.server");
    return calculateRoute(data.from, data.to);
  });

export const optimizeRoute = createServerFn({ method: "POST" })
  .inputValidator((data) => sessionSchema.extend({ from: z.string().optional() }).parse(data))
  .handler(async ({ data }) => {
    const { optimizeListRoute } = await import("./waylo.server");
    return optimizeListRoute(data.sessionId, data.from);
  });
