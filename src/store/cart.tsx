import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { lsGet, lsSet } from './persistence';

/** A single product, or a fixed `ShopBundle` (its own discounted price, not
 *  the sum of its component SKUs — see content/bundles.ts). */
export type CartLine = ({ kind: 'sku'; sku: string } | { kind: 'bundle'; bundleId: string }) & {
  qty: number;
};

export function lineId(line: CartLine): string {
  return line.kind === 'sku' ? `sku:${line.sku}` : `bundle:${line.bundleId}`;
}

type State = { lines: CartLine[] };
const EMPTY: State = { lines: [] };
const MAX_QTY = 20;

type Action =
  | { type: 'ADD_SKU'; sku: string; qty: number }
  | { type: 'ADD_BUNDLE'; bundleId: string; qty: number }
  | { type: 'SET_QTY'; id: string; qty: number }
  | { type: 'REMOVE'; id: string }
  | { type: 'CLEAR' };

function clampQty(n: number): number {
  return Math.max(1, Math.min(MAX_QTY, Math.round(n)));
}

/** Adds `line.qty` on top of any existing quantity for the same line (not a
 *  flat +1) — lets a caller add a caller-chosen quantity in one action, e.g.
 *  a quantity stepper next to an "Add to Cart" button. */
function addLine(state: State, line: CartLine): State {
  const id = lineId(line);
  const existing = state.lines.find((l) => lineId(l) === id);
  if (existing) {
    return { lines: state.lines.map((l) => (lineId(l) === id ? { ...l, qty: clampQty(l.qty + line.qty) } : l)) };
  }
  return { lines: [...state.lines, { ...line, qty: clampQty(line.qty) }] };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_SKU':
      return addLine(state, { kind: 'sku', sku: action.sku, qty: action.qty });
    case 'ADD_BUNDLE':
      return addLine(state, { kind: 'bundle', bundleId: action.bundleId, qty: action.qty });
    case 'SET_QTY': {
      if (action.qty <= 0) return { lines: state.lines.filter((l) => lineId(l) !== action.id) };
      return {
        lines: state.lines.map((l) => (lineId(l) === action.id ? { ...l, qty: clampQty(action.qty) } : l)),
      };
    }
    case 'REMOVE':
      return { lines: state.lines.filter((l) => lineId(l) !== action.id) };
    case 'CLEAR':
      return EMPTY;
    default:
      return state;
  }
}

type CartApi = State & {
  count: number;
  /** `qty` defaults to 1 — pass a larger value (e.g. from a quantity
   *  stepper shown next to an "Add to Cart" button) to add several at once. */
  add: (sku: string, qty?: number) => void;
  addBundle: (bundleId: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartApi | null>(null);
const STORAGE_KEY = 'cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY, () => lsGet<State>(STORAGE_KEY, EMPTY));

  useEffect(() => {
    lsSet(STORAGE_KEY, state);
  }, [state]);

  const value = useMemo<CartApi>(
    () => ({
      ...state,
      count: state.lines.reduce((n, l) => n + l.qty, 0),
      add: (sku, qty = 1) => dispatch({ type: 'ADD_SKU', sku, qty }),
      addBundle: (bundleId, qty = 1) => dispatch({ type: 'ADD_BUNDLE', bundleId, qty }),
      setQty: (id, qty) => dispatch({ type: 'SET_QTY', id, qty }),
      remove: (id) => dispatch({ type: 'REMOVE', id }),
      clear: () => dispatch({ type: 'CLEAR' }),
    }),
    [state],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const c = useContext(CartContext);
  if (!c) throw new Error('useCart must be used within <CartProvider>');
  return c;
}
