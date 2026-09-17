// Each physical cart terminal keeps one shopping session id.
// The id is only a handle — the cart, list and bill all live in the database.
const KEY = "waylo_session_id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = `cart-07-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

export function resetSession() {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}

export const rupees = (value: number | string) =>
  `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
