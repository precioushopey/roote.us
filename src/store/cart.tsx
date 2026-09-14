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
  | { type: 'ADD_SKU'; sku: string }
  | { type: 'ADD_BUNDLE'; bundleId: string }
  | { type: 'SET_QTY'; id: string; qty: number }
  | { type: 'REMOVE'; id: string }
  | { type: 'CLEAR' };

function clampQty(n: number): number {
  return Math.max(1, Math.min(MAX_QTY, Math.round(n)));
}

function addLine(state: State, line: CartLine): State {
  const id = lineId(line);
  const existing = state.lines.find((l) => lineId(l) === id);
  if (existing) {
    return { lines: state.lines.map((l) => (lineId(l) === id ? { ...l, qty: clampQty(l.qty + 1) } : l)) };
  }
  return { lines: [...state.lines, line] };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_SKU':
      return addLine(state, { kind: 'sku', sku: action.sku, qty: 1 });
    case 'ADD_BUNDLE':
      return addLine(state, { kind: 'bundle', bundleId: action.bundleId, qty: 1 });
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
  add: (sku: string) => void;
  addBundle: (bundleId: string) => void;
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
      add: (sku) => dispatch({ type: 'ADD_SKU', sku }),
      addBundle: (bundleId) => dispatch({ type: 'ADD_BUNDLE', bundleId }),
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
