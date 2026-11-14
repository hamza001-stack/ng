'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useTransition } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { useCatalog } from '@/components/catalog-provider';
import { usePlatform } from '@/components/providers';
import { money } from '@/lib/utils';
import { orderLabel, paymentLabel, shippingLabel } from '@/lib/order-status';
import { Action, Badge } from './ui';

type OrderRow = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: { productId: string; name: string; quantity: number }[];
};

export function CustomerOrdersTable({ rows }: { rows: OrderRow[] }) {
  const router = useRouter();
  const { add } = usePlatform();
  const [pending, start] = useTransition();

  const columns = useMemo<ColumnDef<OrderRow>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Order number',
        cell: ({ getValue }) => getValue<string>().slice(0, 8).toUpperCase(),
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ getValue }) =>
          new Date(getValue<string>()).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <Badge>{orderLabel(getValue<string>())}</Badge>,
      },
      {
        id: 'payment',
        header: 'Payment',
        accessorFn: (row) => paymentLabel(row.status),
      },
      {
        id: 'shipping',
        header: 'Shipping',
        accessorFn: (row) => shippingLabel(row.status),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ getValue }) => money(getValue<number>()),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="acct-row-actions">
            <Link className="ws-btn" href={`/dashboard/orders/${row.original.id}`}>
              View
            </Link>
            <Link className="ws-btn" href={`/dashboard/orders/${row.original.id}/invoice`}>
              Invoice
            </Link>
            <button
              type="button"
              className="ws-btn"
              disabled={pending}
              onClick={() =>
                start(() => {
                  row.original.items.forEach((item) => add(item.productId, false));
                  router.push('/cart');
                })
              }
            >
              Reorder
            </button>
          </div>
        ),
      },
    ],
    [add, pending, router],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchPlaceholder="Search order number or status…"
      empty="No orders yet. When you check out, they appear here."
      exportName="orders"
    />
  );
}

export function WishlistBoard({
  items,
}: {
  items: { id: string; name: string; price: number; category: string; stock: number }[];
}) {
  const { add, compare, dropWish } = usePlatform();
  const router = useRouter();
  const [pending, start] = useTransition();

  if (items.length === 0) {
    return (
      <div className="ws-empty-card" role="status">
        <strong>Nothing saved yet</strong>
        <p>Save products from the marketplace to keep them here.</p>
        <Action href="/marketplace" primary>
          Browse products
        </Action>
      </div>
    );
  }

  return (
    <div className="acct-list">
      {items.map((item) => (
        <article className="ws-card acct-wish" key={item.id}>
          <div>
            <Badge>{item.category}</Badge>
            <h3>{item.name}</h3>
            <p className="ws-hint">{money(item.price)} · {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}</p>
          </div>
          <div className="acct-row-actions">
            <button
              type="button"
              className="ws-btn primary"
              disabled={pending || item.stock < 1}
              onClick={() => start(() => add(item.id))}
            >
              Move to bag
            </button>
            <button type="button" className="ws-btn" onClick={() => compare(item.id)}>
              Compare
            </button>
            <button
              type="button"
              className="ws-btn"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await fetch('/api/account/wishlist', {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: item.id }),
                  });
                  dropWish(item.id);
                  router.refresh();
                })
              }
            >
              Remove
            </button>
            <Link className="ws-btn" href={`/marketplace/${item.id}`}>
              View
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function NotificationList({
  items,
}: {
  items: { id: string; title: string; body: string; href: string | null; read: boolean; createdAt: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  if (items.length === 0) {
    return (
      <div className="ws-empty-card" role="status">
        <strong>You are up to date</strong>
        <p>Order and quote updates will land here. Nothing is waiting.</p>
      </div>
    );
  }

  function patch(id: string, body: { read?: boolean; delete?: boolean }) {
    start(async () => {
      await fetch('/api/account/notifications', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...body }),
      });
      router.refresh();
    });
  }

  return (
    <div className="acct-list">
      {items.map((item) => (
        <article className={item.read ? 'ws-card' : 'ws-card acct-unread'} key={item.id}>
          <div className="ws-row">
            <div>
              <strong>{item.title}</strong>
              <p className="ws-hint">{item.body}</p>
              <p className="ws-hint">
                {new Date(item.createdAt).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <Badge tone={item.read ? 'blue' : 'gold'}>{item.read ? 'Read' : 'Unread'}</Badge>
          </div>
          <div className="acct-row-actions">
            {item.href ? (
              <Link className="ws-btn" href={item.href}>
                Open
              </Link>
            ) : null}
            <button type="button" className="ws-btn" disabled={pending} onClick={() => patch(item.id, { read: !item.read })}>
              {item.read ? 'Mark unread' : 'Mark read'}
            </button>
            <button type="button" className="ws-btn" disabled={pending} onClick={() => patch(item.id, { delete: true })}>
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export function RecentRail() {
  const { state } = usePlatform();
  const catalog = useCatalog();
  const rows = state.recent
    .map((id) => catalog.find((product) => product.id === id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));
  if (!rows.length) {
    return (
      <div className="ws-empty-card" role="status">
        <strong>No recently viewed items</strong>
        <p>Products you open on this device appear here.</p>
      </div>
    );
  }
  return (
    <div className="acct-chips">
      {rows.map((product) => (
        <Link key={product.id} className="ws-btn" href={`/marketplace/${product.id}`}>
          {product.name}
        </Link>
      ))}
    </div>
  );
}

export function PrintInvoiceButton() {
  return (
    <button type="button" className="ws-btn primary" onClick={() => window.print()}>
      Print
    </button>
  );
}

export function ReorderButton({
  items,
}: {
  items: { productId: string }[];
}) {
  const { add } = usePlatform();
  const router = useRouter();
  return (
    <button
      type="button"
      className="ws-btn primary"
      onClick={() => {
        items.forEach((item) => add(item.productId, false));
        router.push('/cart');
      }}
    >
      Reorder
    </button>
  );
}
