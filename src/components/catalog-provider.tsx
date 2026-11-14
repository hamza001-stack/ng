'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { ShopProduct } from '@/lib/commerce';

const CatalogContext = createContext<ShopProduct[]>([]);

export function CatalogProvider({
  products,
  children,
}: {
  products: ShopProduct[];
  children: ReactNode;
}) {
  return <CatalogContext.Provider value={products}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}
