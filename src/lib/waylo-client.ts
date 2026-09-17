// UI-side data access. Components call these hooks; the hooks call the backend.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getSessionId } from "./session";
import {
  addToCart,
  addToList,
  addListToCart,
  calculateRoute,
  checkout,
  fetchCart,
  fetchCategories,
  fetchList,
  fetchProduct,
  fetchStore,
  optimizeRoute,
  removeFromCart,
  removeFromList,
  scanProduct,
  searchProducts,
  setListStatus,
  updateCartItem,
  updateCartPosition,
} from "./waylo.functions";

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => setSessionId(getSessionId()), []);
  return sessionId;
}

export function useStore() {
  return useQuery({ queryKey: ["store"], queryFn: () => fetchStore(), staleTime: Infinity });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
    staleTime: Infinity,
  });
}

export function useProductSearch(q: string, category: string) {
  return useQuery({
    queryKey: ["products", q, category],
    queryFn: () => searchProducts({ data: { q, category } }),
  });
}

export function useProduct(id: number) {  return useQuery({    queryKey: ["product", id],    queryFn: () => fetchProduct({ data: { id } }),   enabled: Number.isFinite(id),  });}export function useCart() {
  const sessionId = useSession();
  return useQuery({
    queryKey: ["cart", sessionId],
    queryFn: () => fetchCart({ data: { sessionId: sessionId! } }),
    enabled: !!sessionId,
  });
}

export function useList() {
  const sessionId = useSession();
  return useQuery({
    queryKey: ["list", sessionId],
    queryFn: () => fetchList({ data: { sessionId: sessionId! } }),
    enabled: !!sessionId,
  });
}

function useSessionMutation<TVars, TData>(
  run: (sessionId: string, vars: TVars) => Promise<TData>,
  invalidate: ("cart" | "list")[],
) {
  const sessionId = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: TVars) => run(sessionId ?? getSessionId(), vars),
    onSuccess: () => {
      for (const key of invalidate) queryClient.invalidateQueries({ queryKey: [key] });
    },
  });
}

export const useAddToCart = () =>
  useSessionMutation<{ productId: number }, unknown>(
    (sessionId, { productId }) => addToCart({ data: { sessionId, productId } }),
    ["cart"],
  );

export const useUpdateCartItem = () =>
  useSessionMutation<{ productId: number; quantity: number }, unknown>(
    (sessionId, vars) => updateCartItem({ data: { sessionId, ...vars } }),
    ["cart"],
  );

export const useRemoveFromCart = () =>
  useSessionMutation<{ productId: number }, unknown>(
    (sessionId, vars) => removeFromCart({ data: { sessionId, ...vars } }),
    ["cart"],
  );

export const useScan = () =>
  useSessionMutation<{ barcode: string }, Awaited<ReturnType<typeof scanProduct>>>(
    (sessionId, vars) => scanProduct({ data: { sessionId, ...vars } }),
    ["cart"],
  );

export const useCheckout = () =>
  useSessionMutation<void, Awaited<ReturnType<typeof checkout>>>(
    (sessionId) => checkout({ data: { sessionId } }),
    ["cart"],
  );

export const useAddToList = () =>
  useSessionMutation<{ productId: number }, unknown>(
    (sessionId, vars) => addToList({ data: { sessionId, ...vars } }),
    ["list"],
  );

export const useRemoveFromList = () =>
  useSessionMutation<{ productId: number }, unknown>(
    (sessionId, vars) => removeFromList({ data: { sessionId, ...vars } }),
    ["list"],
  );

export const useSetListStatus = () =>
  useSessionMutation<{ productId: number; status: "pending" | "found" }, unknown>(
    (sessionId, vars) => setListStatus({ data: { sessionId, ...vars } }),
    ["list"],
  );

export const useAddListToCart = () =>
  useSessionMutation<void, unknown>(
    (sessionId) => addListToCart({ data: { sessionId } }),
    ["cart", "list"],
  );

export const useSetPosition = () =>
  useSessionMutation<{ nodeId: string }, unknown>(
    (sessionId, vars) => updateCartPosition({ data: { sessionId, ...vars } }),
    ["cart"],
  );

export type Route = Awaited<ReturnType<typeof calculateRoute>>;
export type OptimizedRoute = Awaited<ReturnType<typeof optimizeRoute>>;

export const useRoute = () =>
  useMutation({
    mutationFn: (vars: { from: string; to: string }) => calculateRoute({ data: vars }),
  });

export const useOptimizedRoute = () => {
  const sessionId = useSession();
  return useMutation({
    mutationFn: (vars: { from?: string }) =>
      optimizeRoute({ data: { sessionId: sessionId ?? getSessionId(), from: vars.from } }),
  });
};
