'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { money } from '@/lib/utils';
import { productImages } from '@/lib/commerce';
import { ORDER_TIMELINE, orderLabel, timelineIndex } from '@/lib/order-status';
import { orderRef } from '@/lib/workspace-format';
import { Badge, StatusPill } from './ui';
import { RecordDrawer } from './record-drawer';
import { AvatarMark, RowMenu } from './row-menu';
import {
  CaseStudyPublish,
  LeadEditor,
  OrderNotesForm,
  OrderStatusEditor,
  ProductEditor,
  ProjectStatusEditor,
  RecordDelete,
  RoleEditor,
  UserActions,
} from './admin-actions';

async function jsonAction(url: string, method: string, body: unknown) {
  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(payload.error || 'Action failed');
}

export function LeadsTable({
  leads,
}: {
  leads: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    status: 'NEW' | 'QUALIFIED' | 'WON' | 'LOST';
    source: string;
    createdAt: string;
    message: string;
    hasFile?: boolean;
    details?: string;
  }[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = leads.find((lead) => lead.id === selectedId) || null;
  const columns = useMemo<ColumnDef<(typeof leads)[number]>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'company',
        header: 'Company',
        cell: ({ getValue }) => getValue<string | null>() || '—',
      },
      { accessorKey: 'source', header: 'Source' },
      {
        accessorKey: 'status',
        header: 'Stage',
        cell: ({ row }) => <LeadEditor id={row.original.id} status={row.original.status} />,
        enableSorting: false,
      },
      { accessorKey: 'createdAt', header: 'Created' },
      {
        id: 'open',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <button type="button" className="ws-btn" onClick={() => setSelectedId(row.original.id)}>
            View
          </button>
        ),
      },
    ],
    [],
  );
  return (
    <>
      <DataTable
        columns={columns}
        data={leads}
        searchPlaceholder="Search name, email, company…"
        empty="No leads yet. Submissions from /contact appear here."
        exportName="leads"
      />
      <RecordDrawer
        open={Boolean(selected)}
        title={selected?.name || 'Lead'}
        kicker="Lead"
        onClose={() => setSelectedId(null)}
      >
        {selected ? (
          <>
            <p>
              {selected.email}
              <br />
              {selected.company || 'No company'}
            </p>
            <dl className="drawer-meta">
              <div>
                <dt>Source</dt>
                <dd>{selected.source}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{selected.createdAt}</dd>
              </div>
            </dl>
            <h3>Notes</h3>
            <p>{selected.message}</p>
            {selected.details ? <p className="ws-hint">{selected.details}</p> : null}
            {selected.hasFile ? (
              <a className="ws-btn" href={`/api/admin/leads/file?id=${selected.id}`}>
                Download attachment
              </a>
            ) : null}
            <LeadEditor id={selected.id} status={selected.status} />
          </>
        ) : null}
      </RecordDrawer>
    </>
  );
}

export function OrdersTable({
  orders,
}: {
  orders: {
    id: string;
    ref: string;
    email: string;
    customer: string;
    phone: string;
    address: string;
    status: string;
    payment: string;
    shipping: string;
    totalPence: number;
    subtotalPence: number;
    vatPence: number;
    shippingPence: number;
    discountPence: number;
    items: string;
    notes: string;
    internalNotes: string;
    createdAt: string;
  }[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = orders.find((order) => order.id === selectedId) || null;
  const reached = selected ? timelineIndex(selected.status) : -1;
  const columns = useMemo<ColumnDef<(typeof orders)[number]>[]>(
    () => [
      { accessorKey: 'ref', header: 'Order #' },
      { accessorKey: 'customer', header: 'Customer' },
      { accessorKey: 'items', header: 'Products' },
      { accessorKey: 'payment', header: 'Payment' },
      { accessorKey: 'shipping', header: 'Shipping' },
      {
        accessorKey: 'totalPence',
        header: 'Total',
        cell: ({ getValue }) => money(getValue<number>() / 100),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusPill tone="neutral">{orderLabel(row.original.status)}</StatusPill>,
      },
      { accessorKey: 'createdAt', header: 'Created' },
      {
        id: 'open',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <button type="button" className="ws-btn" onClick={() => setSelectedId(row.original.id)}>
            View
          </button>
        ),
      },
    ],
    [],
  );
  return (
    <>
      <DataTable
        columns={columns}
        data={orders}
        searchPlaceholder="Search customer, order or status…"
        empty="No orders yet."
        exportName="orders"
      />
      <RecordDrawer
        open={Boolean(selected)}
        title={selected?.ref || 'Order'}
        kicker="Order"
        onClose={() => setSelectedId(null)}
      >
        {selected ? (
          <>
            <p>
              {selected.customer}
              <br />
              {selected.email}
              {selected.phone ? (
                <>
                  <br />
                  {selected.phone}
                </>
              ) : null}
            </p>
            <div className="ws-timeline">
              {ORDER_TIMELINE.map((step, index) => (
                <span key={step} className={reached >= index ? 'done' : undefined}>
                  {orderLabel(step)}
                </span>
              ))}
            </div>
            <dl className="drawer-meta">
              <div>
                <dt>Payment</dt>
                <dd>{selected.payment}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>{selected.shipping}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{selected.createdAt}</dd>
              </div>
              <div>
                <dt>Subtotal</dt>
                <dd>{money(selected.subtotalPence / 100)}</dd>
              </div>
              <div>
                <dt>VAT</dt>
                <dd>{money(selected.vatPence / 100)}</dd>
              </div>
              <div>
                <dt>Shipping fee</dt>
                <dd>{money(selected.shippingPence / 100)}</dd>
              </div>
              <div>
                <dt>Discount</dt>
                <dd>{money(selected.discountPence / 100)}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{money(selected.totalPence / 100)}</dd>
              </div>
            </dl>
            <h3>Address</h3>
            <p>{selected.address || 'No address stored'}</p>
            <h3>Products</h3>
            <p>{selected.items}</p>
            <OrderStatusEditor id={selected.id} status={selected.status} />
            <OrderNotesForm id={selected.id} notes={selected.notes} internalNotes={selected.internalNotes} />
            <div className="ws-inline-form">
              <a className="ws-btn" href={`/dashboard/orders/${selected.id}/invoice`} target="_blank" rel="noreferrer">
                Invoice
              </a>
              <button type="button" className="ws-btn" onClick={() => window.print()}>
                Print
              </button>
            </div>
          </>
        ) : null}
      </RecordDrawer>
    </>
  );
}

export function ProductsTable({
  products,
}: {
  products: {
    id: string;
    name: string;
    stock: number;
    published: boolean;
    pricePence: number;
    category: string;
    description: string;
    tag: string | null;
    features: string[];
    imageUrl: string | null;
    reviews: number;
    updatedAt: string;
  }[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = products.find((product) => product.id === selectedId) || null;
  const columns = useMemo<ColumnDef<(typeof products)[number]>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Product',
        cell: ({ row }) => {
          const art = productImages(row.original.id, row.original.imageUrl);
          return (
            <div className="ws-product-cell">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={art.thumbnail} alt="" width={40} height={40} />
              <div>
                {row.original.name}
                <div className="ws-hint">{row.original.category}</div>
              </div>
            </div>
          );
        },
      },
      { accessorKey: 'category', header: 'Category' },
      {
        accessorKey: 'pricePence',
        header: 'Price',
        cell: ({ getValue }) => money(getValue<number>() / 100),
      },
      { accessorKey: 'stock', header: 'Inventory' },
      {
        accessorKey: 'published',
        header: 'Status',
        cell: ({ getValue }) => (
          <StatusPill tone={getValue<boolean>() ? 'ok' : 'neutral'}>
            {getValue<boolean>() ? 'Live' : 'Draft'}
          </StatusPill>
        ),
      },
      { accessorKey: 'updatedAt', header: 'Updated' },
      {
        id: 'controls',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <RowMenu
            items={[
              { label: 'Edit', onClick: () => setSelectedId(row.original.id) },
              {
                label: 'Duplicate',
                onClick: () =>
                  jsonAction('/api/admin/products', 'PATCH', { id: row.original.id, action: 'duplicate' }).then(() =>
                    router.refresh(),
                  ),
              },
              { label: 'Preview', href: `/marketplace/${row.original.id}` },
              {
                label: 'Archive',
                onClick: () =>
                  jsonAction('/api/admin/products', 'PATCH', { id: row.original.id, action: 'archive' }).then(() =>
                    router.refresh(),
                  ),
              },
              {
                label: 'Delete',
                danger: true,
                onClick: () => {
                  if (!window.confirm('Delete this product? This cannot be undone.')) return;
                  jsonAction('/api/admin/products', 'DELETE', { id: row.original.id }).then(() => router.refresh());
                },
              },
            ]}
          />
        ),
      },
    ],
    [router],
  );
  return (
    <>
      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="Search products…"
        empty="No products in the database."
        exportName="products"
      />
      <RecordDrawer
        open={Boolean(selected)}
        title={selected?.name || 'Product'}
        kicker="Product"
        badge={
          selected ? (
            <StatusPill tone={selected.published ? 'ok' : 'neutral'}>
              {selected.published ? 'Live' : 'Draft'}
            </StatusPill>
          ) : null
        }
        onClose={() => setSelectedId(null)}
      >
        {selected ? (
          <>
            <p className="drawer-amount">{money(selected.pricePence / 100)}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="drawer-image"
              src={productImages(selected.id, selected.imageUrl).cover}
              alt=""
            />
            <dl className="drawer-meta">
              <div>
                <dt>Category</dt>
                <dd>{selected.category}</dd>
              </div>
              <div>
                <dt>Inventory</dt>
                <dd>{selected.stock}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{selected.updatedAt}</dd>
              </div>
              <div>
                <dt>Reviews</dt>
                <dd>{selected.reviews}</dd>
              </div>
              {selected.tag ? (
                <div>
                  <dt>Tag</dt>
                  <dd>{selected.tag}</dd>
                </div>
              ) : null}
            </dl>
            <ProductEditor id={selected.id} stock={selected.stock} published={selected.published} />
            <h3>Description</h3>
            <p>{selected.description}</p>
            {selected.features.length > 0 ? (
              <>
                <h3>Features</h3>
                <ul>
                  {selected.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </>
        ) : null}
      </RecordDrawer>
    </>
  );
}

export function CouponsTable({
  coupons,
}: {
  coupons: { code: string; percent: number; active: boolean }[];
}) {
  const columns = useMemo<ColumnDef<(typeof coupons)[number]>[]>(
    () => [
      { accessorKey: 'code', header: 'Code' },
      {
        accessorKey: 'percent',
        header: 'Discount',
        cell: ({ getValue }) => `${getValue<number>()}%`,
      },
      {
        accessorKey: 'active',
        header: 'State',
        cell: ({ getValue }) => <Badge>{getValue<boolean>() ? 'Active' : 'Off'}</Badge>,
      },
    ],
    [],
  );
  return <DataTable columns={columns} data={coupons} searchPlaceholder="Search codes…" empty="No coupons." />;
}

export function ArticlesTable({
  articles,
}: {
  articles: { id: string; title: string; published: boolean; category: string }[];
}) {
  const router = useRouter();
  const columns = useMemo<ColumnDef<(typeof articles)[number]>[]>(
    () => [
      { accessorKey: 'title', header: 'Title' },
      { accessorKey: 'category', header: 'Category' },
      {
        accessorKey: 'published',
        header: 'Live',
        cell: ({ row }) => (
          <StatusPill tone={row.original.published ? 'ok' : 'neutral'}>
            {row.original.published ? 'Live' : 'Draft'}
          </StatusPill>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <RowMenu
            items={[
              { label: 'Preview', href: `/blog/${row.original.id}` },
              {
                label: row.original.published ? 'Unpublish' : 'Publish',
                onClick: () =>
                  jsonAction('/api/admin/articles', 'PATCH', {
                    id: row.original.id,
                    published: !row.original.published,
                  }).then(() => router.refresh()),
              },
              {
                label: 'Duplicate',
                onClick: () =>
                  jsonAction('/api/admin/articles', 'PATCH', { id: row.original.id, action: 'duplicate' }).then(() =>
                    router.refresh(),
                  ),
              },
              {
                label: 'Delete',
                danger: true,
                onClick: () => {
                  if (!window.confirm('Delete this article? This cannot be undone.')) return;
                  jsonAction('/api/admin/articles', 'DELETE', { id: row.original.id }).then(() => router.refresh());
                },
              },
            ]}
          />
        ),
      },
    ],
    [router],
  );
  return (
    <DataTable
      columns={columns}
      data={articles}
      searchPlaceholder="Search articles…"
      empty="No articles."
      exportName="articles"
    />
  );
}

export function CaseStudiesTable({
  caseStudies,
}: {
  caseStudies: {
    id: string;
    title: string;
    slug: string;
    fileUrl: string | null;
    published: boolean;
  }[];
}) {
  const columns = useMemo<ColumnDef<(typeof caseStudies)[number]>[]>(
    () => [
      { accessorKey: 'title', header: 'Title' },
      { accessorKey: 'slug', header: 'Slug' },
      {
        accessorKey: 'published',
        header: 'Live',
        cell: ({ row }) => (
          <StatusPill tone={row.original.published ? 'ok' : 'neutral'}>
            {row.original.published ? 'Live' : 'Draft'}
          </StatusPill>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <RowMenu
            items={[
              { label: 'Preview', href: `/case-studies/${row.original.slug}` },
              ...(row.original.fileUrl ? [{ label: 'File', href: row.original.fileUrl }] : []),
            ]}
          />
        ),
      },
      {
        id: 'publish',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="ws-inline-form">
            <CaseStudyPublish id={row.original.id} published={row.original.published} />
            <RecordDelete url="/api/admin/case-studies" id={row.original.id} />
          </div>
        ),
      },
    ],
    [],
  );
  return (
    <DataTable
      columns={columns}
      data={caseStudies}
      searchPlaceholder="Search case studies…"
      empty="No case studies uploaded."
    />
  );
}

export function CoursesTable({
  courses,
  progress,
}: {
  courses: { id: string; title: string; published?: boolean; lessons: number }[];
  progress?: { courseId: string; count: number }[];
}) {
  const columns = useMemo<ColumnDef<(typeof courses)[number]>[]>(
    () => [
      { accessorKey: 'title', header: 'Course' },
      { accessorKey: 'lessons', header: 'Lessons' },
      ...(progress
        ? [
            {
              id: 'completions',
              header: 'Completions',
              accessorFn: (row: (typeof courses)[number]) =>
                progress.find((item) => item.courseId === row.id)?.count || 0,
            } satisfies ColumnDef<(typeof courses)[number]>,
          ]
        : []),
    ],
    [progress],
  );
  return (
    <DataTable columns={columns} data={courses} searchPlaceholder="Search courses…" empty="No courses." />
  );
}

export function UsersTable({
  users,
}: {
  users: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: 'CUSTOMER' | 'STAFF' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
    emailVerified: boolean;
    suspended: boolean;
    createdAt: string;
    orders: number;
    quotes: number;
    wishlist: number;
    recentOrders: { id: string; status: string; total: number; createdAt: string }[];
    recentQuotes: { id: string; status: string; createdAt: string }[];
    saved: string[];
  }[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = users.find((user) => user.id === selectedId) || null;
  const columns = useMemo<ColumnDef<(typeof users)[number]>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Customer',
        cell: ({ row }) => (
          <div className="ws-product-cell">
            <AvatarMark name={row.original.name} image={row.original.image} />
            <div>
              {row.original.name}
              <div className="ws-hint">{row.original.email}</div>
            </div>
          </div>
        ),
      },
      { accessorKey: 'orders', header: 'Orders' },
      { accessorKey: 'quotes', header: 'Quotes' },
      {
        accessorKey: 'emailVerified',
        header: 'Verified',
        cell: ({ getValue }) => (getValue<boolean>() ? 'Yes' : 'No'),
      },
      {
        accessorKey: 'suspended',
        header: 'Status',
        cell: ({ getValue }) => (
          <StatusPill tone={getValue<boolean>() ? 'bad' : 'ok'}>
            {getValue<boolean>() ? 'Suspended' : 'Active'}
          </StatusPill>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => <RoleEditor id={row.original.id} role={row.original.role} />,
        enableSorting: false,
      },
      {
        id: 'open',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <button type="button" className="ws-btn" onClick={() => setSelectedId(row.original.id)}>
            Profile
          </button>
        ),
      },
    ],
    [],
  );
  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="Search users…"
        empty="No users."
        exportName="customers"
      />
      <RecordDrawer
        open={Boolean(selected)}
        title={selected?.name || 'Customer'}
        kicker="Customer"
        onClose={() => setSelectedId(null)}
      >
        {selected ? (
          <>
            <div className="ws-product-cell">
              <AvatarMark name={selected.name} image={selected.image} />
              <div>
                <strong>{selected.email}</strong>
                <div className="ws-hint">Joined {selected.createdAt}</div>
              </div>
            </div>
            <dl className="drawer-meta">
              <div>
                <dt>Orders</dt>
                <dd>{selected.orders}</dd>
              </div>
              <div>
                <dt>Quotes</dt>
                <dd>{selected.quotes}</dd>
              </div>
              <div>
                <dt>Wishlist</dt>
                <dd>{selected.wishlist}</dd>
              </div>
            </dl>
            <h3>Recent orders</h3>
            {selected.recentOrders.length === 0 ? (
              <p className="ws-hint">No orders</p>
            ) : (
              <ul className="feed">
                {selected.recentOrders.map((order) => (
                  <li key={order.id}>
                    <span>{orderRef(order.id, order.createdAt)}</span>
                    <b>{money(order.total)}</b>
                  </li>
                ))}
              </ul>
            )}
            <h3>Quotes</h3>
            {selected.recentQuotes.length === 0 ? (
              <p className="ws-hint">No quotes</p>
            ) : (
              <ul className="feed">
                {selected.recentQuotes.map((quote) => (
                  <li key={quote.id}>
                    <span>{quote.status}</span>
                    <span className="ws-hint">{quote.createdAt}</span>
                  </li>
                ))}
              </ul>
            )}
            <h3>Wishlist</h3>
            <p>{selected.saved.length ? selected.saved.join(', ') : 'Empty'}</p>
            <RoleEditor id={selected.id} role={selected.role} />
            <UserActions id={selected.id} suspended={selected.suspended} />
          </>
        ) : null}
      </RecordDrawer>
    </>
  );
}

export function AuditTable({
  auditLog,
}: {
  auditLog: {
    id: string;
    action: string;
    entity: string;
    createdAt: string;
    actor: string;
  }[];
}) {
  const columns = useMemo<ColumnDef<(typeof auditLog)[number]>[]>(
    () => [
      { accessorKey: 'actor', header: 'Actor' },
      { accessorKey: 'action', header: 'Action' },
      { accessorKey: 'entity', header: 'Entity' },
      { accessorKey: 'createdAt', header: 'When' },
    ],
    [],
  );
  return (
    <DataTable
      columns={columns}
      data={auditLog}
      searchPlaceholder="Search audit log…"
      empty="No audited actions yet."
    />
  );
}

export function ProjectsTable({
  projects,
}: {
  projects: {
    id: string;
    title: string;
    client: string;
    summary: string;
    status: 'BACKLOG' | 'DOING' | 'REVIEW' | 'DONE';
    fileUrl: string | null;
  }[];
}) {
  const columns = useMemo<ColumnDef<(typeof projects)[number]>[]>(
    () => [
      { accessorKey: 'title', header: 'Project' },
      { accessorKey: 'client', header: 'Client' },
      { accessorKey: 'summary', header: 'Scope' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <ProjectStatusEditor id={row.original.id} status={row.original.status} />,
        enableSorting: false,
      },
      {
        id: 'actions',
        header: 'Action',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="ws-inline-form">
            {row.original.fileUrl ? (
              <a className="ws-link" href={row.original.fileUrl} target="_blank" rel="noreferrer">
                File
              </a>
            ) : null}
            <RecordDelete url="/api/admin/projects" id={row.original.id} />
          </div>
        ),
      },
    ],
    [],
  );
  return (
    <DataTable
      columns={columns}
      data={projects}
      searchPlaceholder="Search projects…"
      empty="No delivery projects yet."
    />
  );
}

export function WorkspaceOrdersTable({
  rows,
}: {
  rows: { id: string; status: string; total: number; createdAt: string }[];
}) {
  const columns = useMemo<ColumnDef<(typeof rows)[number]>[]>(
    () => [
      { accessorKey: 'id', header: 'Order' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge>,
      },
      {
        accessorKey: 'total',
        header: 'Amount',
        cell: ({ getValue }) => money(getValue<number>()),
      },
      { accessorKey: 'createdAt', header: 'Date' },
    ],
    [],
  );
  return (
    <DataTable columns={columns} data={rows} searchPlaceholder="Search orders…" empty="No orders yet." />
  );
}
