'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useCatalog } from './catalog-provider';

type State = {
  cart: string[];
  wishlist: string[];
  progress: Record<string, number[]>;
  quantities: Record<string, number>;
  recent: string[];
  compare: string[];
};

const initial: State = {
  cart: [],
  wishlist: [],
  progress: {},
  quantities: {},
  recent: [],
  compare: [],
};

type Platform = {
  state: State;
  ready: boolean;
  cartOpen: boolean;
  quickId: string | null;
  count: number;
  setCartOpen: (open: boolean) => void;
  setQuickId: (id: string | null) => void;
  add: (id: string, open?: boolean) => void;
  remove: (id: string) => void;
  quantity: (id: string, value: number) => void;
  wish: (id: string) => void;
  dropWish: (id: string) => void;
  compare: (id: string) => void;
  viewed: (id: string) => void;
  complete: (id: string, index: number) => void;
};

const Context = createContext<Platform | null>(null);

type CartResponse = {
  items?: { id: string; quantity: number }[];
};

async function readCart(): Promise<State> {
  const response = await fetch('/api/cart', { credentials: 'include' });
  const data = (await response.json()) as CartResponse;
  const items = data.items || [];
  return {
    ...initial,
    cart: items.map((item) => item.id),
    quantities: Object.fromEntries(items.map((item) => [item.id, item.quantity])),
  };
}

export function Providers({ children }: { children: ReactNode }) {
  const catalog = useCatalog();
  const validId = useCallback(
    (id: string) => catalog.some((product) => product.id === id),
    [catalog],
  );
  const [query] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60000, retry: 1 } } }),
  );
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickId, setQuickId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let stored: Partial<State> = {};
    try {
      stored = JSON.parse(window.localStorage.getItem('nevie-account') || '{}') as Partial<State>;
    } catch {
      stored = {};
    }
    Promise.all([
      readCart(),
      fetch('/api/account/wishlist', { credentials: 'include' })
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null),
    ])
      .then(([cart, wish]) => {
        if (cancelled) return;
        const remote = Array.isArray(wish?.items)
          ? wish.items.map((item: { id: string }) => item.id)
          : [];
        setState((prev) => ({
          ...prev,
          cart: cart.cart,
          quantities: cart.quantities,
          wishlist: remote.length ? remote : (stored.wishlist || []).filter(validId),
          recent: (stored.recent || []).filter(validId),
          compare: (stored.compare || []).filter(validId),
        }));
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            wishlist: (stored.wishlist || []).filter(validId),
            recent: (stored.recent || []).filter(validId),
          }));
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [validId]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(
      'nevie-account',
      JSON.stringify({
        wishlist: state.wishlist,
        recent: state.recent,
        compare: state.compare,
      }),
    );
  }, [ready, state.wishlist, state.recent, state.compare]);

  const value = useMemo<Platform>(() => {
    return {
      state,
      ready,
      cartOpen,
      quickId,
      count: state.cart.reduce((n, id) => n + (state.quantities[id] || 1), 0),
      setCartOpen,
      setQuickId: (id) => setQuickId(id && validId(id) ? id : null),
      add: (id, open = true) => {
        if (!validId(id)) return;
        void fetch('/api/cart', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id, quantity: 1 }),
        }).then(() =>
          readCart().then((cart) =>
            setState((s) => ({ ...s, cart: cart.cart, quantities: cart.quantities })),
          ),
        );
        if (open) setCartOpen(true);
      },
      remove: (id) => {
        void fetch('/api/cart', {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id }),
        }).then(() =>
          readCart().then((cart) =>
            setState((s) => ({ ...s, cart: cart.cart, quantities: cart.quantities })),
          ),
        );
      },
      quantity: (id, qty) => {
        void fetch('/api/cart', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id, quantity: qty }),
        }).then(() =>
          readCart().then((cart) =>
            setState((s) => ({ ...s, cart: cart.cart, quantities: cart.quantities })),
          ),
        );
      },
      wish: (id) => {
        if (!validId(id)) return;
        setState((s) => {
          const next = s.wishlist.includes(id)
            ? s.wishlist.filter((value) => value !== id)
            : [...s.wishlist, id];
          void fetch('/api/account/wishlist', {
            method: s.wishlist.includes(id) ? 'DELETE' : 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: id }),
          }).catch(() => undefined);
          return { ...s, wishlist: next };
        });
      },
      dropWish: (id) => {
        setState((s) => ({ ...s, wishlist: s.wishlist.filter((value) => value !== id) }));
      },
      compare: (id) => {
        if (!validId(id)) return;
        setState((s) => ({
          ...s,
          compare: s.compare.includes(id)
            ? s.compare.filter((value) => value !== id)
            : [...s.compare, id].slice(0, 4),
        }));
      },
      viewed: (id) => {
        if (!validId(id)) return;
        setState((s) =>
          s.recent[0] === id
            ? s
            : { ...s, recent: [id, ...s.recent.filter((value) => value !== id)].slice(0, 8) },
        );
      },
      complete: (id, index) =>
        setState((s) => ({
          ...s,
          progress: { ...s.progress, [id]: [...new Set([...(s.progress[id] || []), index])] },
        })),
    };
  }, [state, ready, cartOpen, quickId, validId]);

  return (
    <QueryClientProvider client={query}>
      <Context.Provider value={value}>{children}</Context.Provider>
    </QueryClientProvider>
  );
}

export const usePlatform = () => {
  const value = useContext(Context);
  if (!value) {
    throw new Error('usePlatform must be used inside Providers');
  }
  return value;
};
