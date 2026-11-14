'use client';
import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { commerce, type CommerceData } from '@/lib/commerce';
const CommerceContext = createContext<CommerceData>(commerce);
export function CommerceProvider({ initialData, children }: { initialData: CommerceData; children: ReactNode }) {
  const { data } = useQuery({ queryKey: ['catalogue-facts'], queryFn: async () => { const response = await fetch('/api/catalogue'); if (!response.ok) throw new Error('Catalogue unavailable'); return response.json() as Promise<CommerceData>; }, initialData, staleTime: 60000, refetchInterval: process.env.NEXT_PUBLIC_STATIC_PREVIEW === 'true' ? false : 60000, enabled: process.env.NEXT_PUBLIC_STATIC_PREVIEW !== 'true', retry: 1 });
  return <CommerceContext.Provider value={data}>{children}</CommerceContext.Provider>;
}
export const useCommerce = () => useContext(CommerceContext);
