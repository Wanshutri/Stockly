"use client";

import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";

export type LineItem = {
  id: number;
  sku: string;
  name: string;
  price: number; // CLP (entero), ideal sin decimales
  qty: number;
};

type State = {
  lines: LineItem[];
  ivaRate: number;      // Chile: 0.19
  loading: boolean;
  error?: string;
  discount: number;     // si manejas descuentos, acá (por ahora 0)
};

type Action =
  | { type: "ADD_OR_INC"; item: Omit<LineItem, "qty"> } // si existe, ++qty; si no, add qty=1
  | { type: "REMOVE"; id: number }
  | { type: "CLEAR" }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error?: string }
  | { type: "SET_DISCOUNT"; discount: number }
  | { type: "HYDRATE"; lines: LineItem[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_OR_INC": {
      const idx = state.lines.findIndex(l => l.id === action.item.id);
      if (idx >= 0) {
        const next = state.lines.slice();
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return { ...state, lines: next, loading: false, error: undefined };
      }
      return { ...state, lines: [...state.lines, { ...action.item, qty: 1 }], loading: false, error: undefined };
    }
    case "REMOVE":
      return { ...state, lines: state.lines.filter(l => l.id !== action.id) };
    case "CLEAR":
      return { ...state, lines: [] };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error, loading: false };
    case "SET_DISCOUNT":
      return { ...state, discount: action.discount };
    case "HYDRATE":
      return { ...state, lines: action.lines };
    default:
      return state;
  }
}

type Ctx = State & {
  addBySku: (skuOrCode: string) => Promise<void>;
  remove: (id: number) => void;
  clear: () => void;
  setDiscount: (amount: number) => void;
  // selectores de totales:
  subtotal: number;
  tax: number;
  total: number;
};

const CartContext = createContext<Ctx | undefined>(undefined);

export function CartProvider({
  children,
  initialLines = [],
  ivaRate = 0.19,
}: {
  children: React.ReactNode;
  initialLines?: LineItem[];
  ivaRate?: number;
}) {
  const [state, dispatch] = useReducer(reducer, {
    lines: [],
    ivaRate,
    loading: false,
    error: undefined,
    discount: 0,
  });

  // hidrata si quieres partir con items demo
  React.useEffect(() => {
    if (initialLines?.length) dispatch({ type: "HYDRATE", lines: initialLines });
  }, [initialLines]);

  // Ajusta al endpoint real. Recomendado: proxy en /api/products?sku=...
  const fetchBySku = useCallback(async (sku: string) => {
    const res = await fetch(`/api/products?sku=${encodeURIComponent(sku)}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Producto no encontrado");
    // Normaliza al shape que usarás como LineItem (sin qty)
    const data = await res.json();
    const item = {
      id: Number(data.id),
      sku: String(data.sku),
      name: String(data.name),
      price: Number(data.price), // CLP enteros
    };
    return item as Omit<LineItem, "qty">;
  }, []);

  const addBySku = useCallback(async (skuOrCode: string) => {
    if (!skuOrCode.trim()) return;
    dispatch({ type: "SET_LOADING", loading: true });
    try {
      const item = await fetchBySku(skuOrCode.trim());
      dispatch({ type: "ADD_OR_INC", item });
    } catch (err) {
      // No usar `any`. Normaliza el mensaje comprobando el tipo en tiempo de ejecución.
      let message = "Error al agregar producto";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      } else {
        message = String(err);
      }
      dispatch({ type: "SET_ERROR", error: message });
    }
  }, [fetchBySku]);

  const remove = useCallback((id: number) => dispatch({ type: "REMOVE", id }), []);
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const setDiscount = useCallback((amount: number) => dispatch({ type: "SET_DISCOUNT", discount: amount }), []);

  // totales (CLP, enteros)
  const subtotal = useMemo(
    () => state.lines.reduce((acc, l) => acc + l.price * l.qty, 0),
    [state.lines]
  );
  const tax = useMemo(() => Math.round((Math.max(subtotal - state.discount, 0)) * state.ivaRate), [subtotal, state.discount, state.ivaRate]);
  const total = useMemo(() => Math.max(subtotal - state.discount, 0) + tax, [subtotal, state.discount, tax]);

  const value = useMemo<Ctx>(() => ({
    ...state,
    addBySku,
    remove,
    clear,
    setDiscount,
    subtotal,
    tax,
    total,
  }), [state, addBySku, remove, clear, setDiscount, subtotal, tax, total]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}

// Util para mostrar CLP
export const clp = (n: number) => new Intl.NumberFormat("es-CL", {
  style: "currency", currency: "CLP", maximumFractionDigits: 0
}).format(n);
