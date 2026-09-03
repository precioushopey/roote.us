import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { lsGet, lsSet } from './persistence';

export type CartLine = { sku: string; qty: number };

type State = { lines: CartLine[] };
const EMPTY: State = { lines: [] };
const MAX_QTY = 20;

type Action =
  | { type: 'ADD'; sku: string }
  | { type: 'SET_QTY'; sku: string; qty: number }
  | { type: 'REMOVE'; sku: string }
  | { type: 'CLEAR' };

function clampQty(n: number): number {
  return Math.max(1, Math.min(MAX_QTY, Math.round(n)));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD': {
      const existing = state.lines.find((l) => l.sku === action.sku);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.sku === action.sku ? { ...l, qty: clampQty(l.qty + 1) } : l,
          ),
        };
      }
      return { lines: [...state.lines, { sku: action.sku, qty: 1 }] };
    }
    case 'SET_QTY': {
      if (action.qty <= 0) return { lines: state.lines.filter((l) => l.sku !== action.sku) };
      return {
        lines: state.lines.map((l) => (l.sku === action.sku ? { ...l, qty: clampQty(action.qty) } : l)),
      };
    }
    case 'REMOVE':
      return { lines: state.lines.filter((l) => l.sku !== action.sku) };
    case 'CLEAR':
      return EMPTY;
    default:
      return state;
  }
}

type CartApi = State & {
  count: number;
  add: (sku: string) => void;
  setQty: (sku: string, qty: number) => void;
  remove: (sku: string) => void;
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
      add: (sku) => dispatch({ type: 'ADD', sku }),
      setQty: (sku, qty) => dispatch({ type: 'SET_QTY', sku, qty }),
      remove: (sku) => dispatch({ type: 'REMOVE', sku }),
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
