'use client';

import Link from 'next/link';
import { Boxes, ShoppingBag, Users, Wallet } from 'lucide-react';
import { money } from '@/lib/utils';
import { orderLabel } from '@/lib/order-status';
import { humanDate, orderRef } from '@/lib/workspace-format';
import { KpiCard } from './kpi-card';
import { PageHeader, EmptyState } from './page-header';
import { Badge } from './ui';

export type DashboardPayload = {
  orders: number;
  leads: number;
  users: number;
  products: number;
  pendingLeads: number;
  wonLeads: number;
  newsletter: number;
  conversion: number;
  revenue: number;
  deltas: { revenue: number | null; orders: number | null; leads: number | null };
  days: { day: string; label: string; orders: number; revenue: number }[];
  leadStatus: { status: string; count: number }[];
  leadSources: { source: string; count: number }[];
  recentOrders: { id: string; email: string; status: string; total: number; createdAt: string }[];
  recentLeads: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    status: string;
    createdAt: string;
  }[];
  activity: { id: string; action: string; entity: string; actor: string; createdAt: string }[];
  today: { orders: number; revenue: number; users: number };
  pendingOrders: number;
  completedOrders: number;
  lowStock: number;
  recentPayments: { id: string; email: string; status: string; total: number; createdAt: string }[];
};

export function AdminHome({
  data,
  adminBase = '/admin',
}: {
  data: DashboardPayload;
  adminBase?: string;
}) {
  const href = (path: string) => `${adminBase}${path === '/' ? '' : path}`;
  return (
    <>
      <PageHeader
        eyebrow="Home"
        title="Operations"
        description="Live totals from PostgreSQL. Empty cards mean the count is zero — nothing is invented."
      />
      <section className="metric-board">
        <div className="metric-row">
          <article>
            <span>Today’s orders</span>
            <strong>{data.today.orders}</strong>
            <em>Created since midnight</em>
          </article>
          <article>
            <span>Today’s revenue</span>
            <strong>{money(data.today.revenue)}</strong>
            <em>Paid today</em>
          </article>
          <article>
            <span>Collected</span>
            <strong>{money(data.revenue)}</strong>
            <em className={data.deltas.revenue == null ? 'new' : data.deltas.revenue >= 0 ? 'up' : 'down'}>
              {data.deltas.revenue == null
                ? data.revenue > 0
                  ? 'New'
                  : 'No previous data'
                : `${data.deltas.revenue >= 0 ? '▲' : '▼'} ${Math.abs(data.deltas.revenue)}% vs prior 14 days`}
            </em>
          </article>
        </div>
      </section>
      <div className="kpi-grid">
        <KpiCard
          label="Pending orders"
          value={String(data.pendingOrders)}
          hint="Awaiting payment or preparation"
          icon={<ShoppingBag size={16} />}
        />
        <KpiCard
          label="Completed"
          value={String(data.completedOrders)}
          hint="Delivered or fulfilled"
          icon={<Wallet size={16} />}
        />
        <KpiCard
          label="New users today"
          value={String(data.today.users)}
          hint={`${data.users} accounts in total`}
          icon={<Users size={16} />}
        />
        <KpiCard
          label="Low stock"
          value={String(data.lowStock)}
          hint="Published products with 3 or fewer"
          icon={<Boxes size={16} />}
        />
      </div>
      <section className="ws-card">
        <div className="ws-card-head">
          <h3>Quick actions</h3>
        </div>
        <div className="ws-inline-form">
          <Link className="ws-btn primary" href={href('/finance')}>
            Orders
          </Link>
          <Link className="ws-btn" href={href('/marketplace')}>
            Products
          </Link>
          <Link className="ws-btn" href={href('/crm')}>
            Leads
          </Link>
          <Link className="ws-btn" href={href('/users')}>
            Customers
          </Link>
        </div>
      </section>
      <div className="ws-grid-2">
        <section className="ws-card">
          <div className="ws-card-head">
            <h3>Latest orders</h3>
          </div>
          {data.recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" copy="Stripe checkouts list here with status and totals." />
          ) : (
            <ul className="feed">
              {data.recentOrders.map((order) => (
                <li key={order.id}>
                  <div>
                    <strong>{orderRef(order.id, order.createdAt)}</strong>
                    <span className="ws-hint">
                      {order.email} · {humanDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="feed-end">
                    <Badge>{orderLabel(order.status)}</Badge>
                    <b>{money(order.total)}</b>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="ws-card">
          <div className="ws-card-head">
            <h3>Recent leads</h3>
          </div>
          {data.recentLeads.length === 0 ? (
            <EmptyState title="No quotes yet" copy="Contact and quote forms appear instantly." />
          ) : (
            <ul className="feed">
              {data.recentLeads.map((lead) => (
                <li key={lead.id}>
                  <div>
                    <strong>{lead.name}</strong>
                    <span className="ws-hint">{lead.company || lead.email}</span>
                  </div>
                  <Badge>{lead.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <div className="ws-grid-2">
        <section className="ws-card">
          <div className="ws-card-head">
            <h3>Recent activity</h3>
          </div>
          {data.activity.length === 0 ? (
            <EmptyState title="No audit events" copy="Role changes, order updates and publishes write here." />
          ) : (
            <ul className="feed">
              {data.activity.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.action}</strong>
                    <span className="ws-hint">
                      {item.actor} · {item.entity}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="ws-card">
          <div className="ws-card-head">
            <h3>System health</h3>
          </div>
          <ul className="feed">
            <li>
              <div>
                <strong>PostgreSQL</strong>
                <span className="ws-hint">This page loaded from the live database.</span>
              </div>
              <Badge>Up</Badge>
            </li>
            <li>
              <div>
                <strong>Newsletter</strong>
                <span className="ws-hint">{data.newsletter} subscribers</span>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
