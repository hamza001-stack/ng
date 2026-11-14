import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { money } from '@/lib/utils';
import { ORDER_TIMELINE, orderLabel, paymentLabel, shippingLabel } from '@/lib/order-status';
import { Action, Badge, Kpi, Panel } from './ui';
import { EmptyState, PageHeader } from './page-header';
import {
  CustomerOrdersTable,
  NotificationList,
  RecentRail,
  ReorderButton,
  WishlistBoard,
} from './user-client';

function Head({ kicker, title, copy }: { kicker: string; title: string; copy: string }) {
  return <PageHeader eyebrow={kicker} title={title} description={copy} />;
}

export function UserHome({
  name,
  orderCount,
  activeCount,
  quoteCount,
  wishlistCount,
  unread,
  profileCompletion,
  recentOrders,
}: {
  name: string;
  orderCount: number;
  activeCount: number;
  quoteCount: number;
  wishlistCount: number;
  unread: number;
  profileCompletion: number;
  recentOrders: { id: string; status: string; total: number; createdAt: string }[];
}) {
  return (
    <>
      <Head
        kicker="Account"
        title={`Welcome back, ${name.split(' ')[0] || 'there'}.`}
        copy="Your orders, saved products and quotes — only what belongs to this account."
      />
      <div className="ws-kpis">
        <Kpi label="Orders" value={String(orderCount)} hint="All time" />
        <Kpi label="Active" value={String(activeCount)} hint="Not yet completed" />
        <Kpi label="Wishlist" value={String(wishlistCount)} hint="Saved products" />
        <Kpi label="Quotes" value={String(quoteCount)} hint="Submitted requests" />
      </div>
      <div className="ws-grid-2">
        <Panel title="Recent orders">
          {recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" copy="When you pay at checkout, the latest orders appear here." />
          ) : (
            <ul className="feed">
              {recentOrders.slice(0, 5).map((order) => (
                <li key={order.id}>
                  <div>
                    <strong>{order.id.slice(0, 8).toUpperCase()}</strong>
                    <span className="ws-hint">
                      {new Date(order.createdAt).toLocaleDateString('en-GB')} · {orderLabel(order.status)}
                    </span>
                  </div>
                  <div className="feed-end">
                    <Link className="ws-btn" href={`/dashboard/orders/${order.id}`}>
                      View
                    </Link>
                    <b>{money(order.total)}</b>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Profile completion">
          <div className="acct-complete">
            <strong>{profileCompletion}%</strong>
            <p className="ws-hint">Name, email, photo, phone and a delivery address from your last order.</p>
            <div className="ws-progress" aria-label={`${profileCompletion}% complete`}>
              <i style={{ width: `${profileCompletion}%` }} />
            </div>
            <Action href="/dashboard/profile">Update profile</Action>
          </div>
        </Panel>
      </div>
      <div className="ws-grid-2">
        <Panel title="Notifications">
          <p className="ws-hint">{unread ? `${unread} unread` : 'All caught up.'}</p>
          <Action href="/dashboard/notifications">Open notifications</Action>
        </Panel>
        <Panel title="Recently viewed">
          <RecentRail />
        </Panel>
      </div>
      <div className="ws-actions">
        <Action href="/dashboard/orders" primary>
          View orders
        </Action>
        <Action href="/contact">Request a quote</Action>
        <Action href="/marketplace">Continue shopping</Action>
        <Action href="/contact">Contact us</Action>
      </div>
    </>
  );
}

export function UserOrders({
  rows,
}: {
  rows: {
    id: string;
    status: string;
    total: number;
    createdAt: string;
    items: { productId: string; name: string; quantity: number }[];
  }[];
}) {
  return (
    <>
      <Head
        kicker="Orders"
        title="Order history"
        copy="Search, sort and export your orders. Open any row for the timeline, invoice and tracking."
      />
      <Panel>
        <CustomerOrdersTable rows={rows} />
      </Panel>
    </>
  );
}

export function UserOrderDetail({
  order,
}: {
  order: {
    id: string;
    status: string;
    total: number;
    createdAt: string;
    updatedAt: string;
    name: string | null;
    email: string;
    phone: string | null;
    line1: string | null;
    line2: string | null;
    city: string | null;
    postcode: string | null;
    country: string | null;
    subtotal: number;
    vat: number;
    shippingPence: number;
    discount: number;
    items: { productId: string; name: string; quantity: number; unit: number }[];
  };
}) {
  const cancelled = ['CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'FAILED'].includes(order.status);
  const current = ORDER_TIMELINE.indexOf(order.status as (typeof ORDER_TIMELINE)[number]);
  return (
    <>
      <Head
        kicker={`Order ${order.id.slice(0, 8).toUpperCase()}`}
        title={orderLabel(order.status)}
        copy={`${paymentLabel(order.status)} · ${shippingLabel(order.status)} · placed ${new Date(order.createdAt).toLocaleDateString('en-GB')}`}
      />
      <div className="ws-actions">
        <Action href={`/dashboard/orders/${order.id}/invoice`} primary>
          Invoice
        </Action>
        <ReorderButton items={order.items} />
        <Action href="/dashboard/orders">Back to orders</Action>
      </div>
      <ol className="acct-timeline">
        {ORDER_TIMELINE.map((step, index) => (
          <li key={step} className={cancelled ? 'muted' : index <= current ? 'done' : undefined}>
            <span>{orderLabel(step)}</span>
          </li>
        ))}
      </ol>
      {cancelled ? <p className="ws-hint">This order is {orderLabel(order.status).toLowerCase()}.</p> : null}
      <div className="ws-grid-2">
        <Panel title="Delivery">
          {order.line1 ? (
            <p>
              {order.name}
              <br />
              {order.line1}
              {order.line2 ? <><br />{order.line2}</> : null}
              <br />
              {order.city} {order.postcode}
              <br />
              {order.country}
              {order.phone ? <><br />{order.phone}</> : null}
            </p>
          ) : (
            <EmptyState title="No address on this order" copy="Newer checkouts collect delivery details at payment." />
          )}
        </Panel>
        <Panel title="Tracking">
          <p className="ws-hint">{shippingLabel(order.status)}</p>
          <p className="ws-hint">Last update {new Date(order.updatedAt).toLocaleString('en-GB')}</p>
        </Panel>
      </div>
      <Panel title="Products">
        <table className="ws-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId + item.name}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{money(item.unit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="ws-hint">
          Subtotal {money(order.subtotal)}
          {order.discount ? ` · Discount ${money(order.discount)}` : ''}
          {` · Shipping ${money(order.shippingPence)} · VAT ${money(order.vat)} · Total ${money(order.total)}`}
        </p>
      </Panel>
    </>
  );
}

export function UserWishlist({
  items,
}: {
  items: { id: string; name: string; price: number; category: string; stock: number }[];
}) {
  return (
    <>
      <Head kicker="Wishlist" title="Saved products" copy="Move an item to your bag, compare it, or remove it." />
      <WishlistBoard items={items} />
    </>
  );
}

export function UserQuotes({
  rows,
}: {
  rows: {
    id: string;
    statusLabel: string;
    source: string;
    company: string | null;
    message: string;
    notes: string | null;
    createdAt: string;
  }[];
}) {
  return (
    <>
      <Head kicker="Quotes" title="Your quotations" copy="Every request submitted from your email or this account." />
      {rows.length === 0 ? (
        <EmptyState title="No quotes yet" copy="Send a brief and the status will show here as we review it." />
      ) : (
        <div className="acct-list">
          {rows.map((row) => (
            <article className="ws-card" key={row.id}>
              <div className="ws-row">
                <div>
                  <strong>{row.source}</strong>
                  <p className="ws-hint">{new Date(row.createdAt).toLocaleDateString('en-GB')}</p>
                </div>
                <Badge>{row.statusLabel}</Badge>
              </div>
              <p>{row.message}</p>
              {row.notes ? <p className="ws-hint">Update: {row.notes}</p> : null}
            </article>
          ))}
        </div>
      )}
      <div className="ws-actions">
        <Action href="/contact" primary>
          New quote
        </Action>
      </div>
    </>
  );
}

export function UserNotifications({
  items,
}: {
  items: { id: string; title: string; body: string; href: string | null; read: boolean; createdAt: string }[];
}) {
  return (
    <>
      <Head kicker="Notifications" title="Updates" copy="Read, unread and delete — these are your order and quote events." />
      <NotificationList items={items} />
    </>
  );
}

export function UserSupport({
  tickets,
}: {
  tickets: { id: string; statusLabel: string; source: string; message: string; notes: string | null; createdAt: string }[];
}) {
  return (
    <>
      <Head
        kicker="Support"
        title="Help"
        copy="Open a conversation. Replies from the team appear as notes on your request."
      />
      <div className="ws-actions">
        <Action href="/contact" primary>
          New message
        </Action>
        <Action href="/faq">Help articles</Action>
      </div>
      {tickets.length === 0 ? (
        <EmptyState title="No open requests" copy="Contact us and the thread will list here against this account." />
      ) : (
        <div className="acct-list">
          {tickets.map((ticket) => (
            <article className="ws-card" key={ticket.id}>
              <div className="ws-row">
                <strong>{ticket.source}</strong>
                <Badge>{ticket.statusLabel}</Badge>
              </div>
              <p>{ticket.message}</p>
              {ticket.notes ? (
                <div className="ws-msg">
                  <strong>Reply</strong>
                  <p>{ticket.notes}</p>
                </div>
              ) : (
                <p className="ws-hint">No reply yet.</p>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export function UserDownloads({
  invoices,
}: {
  invoices: { id: string; createdAt: string; total: number; status: string }[];
}) {
  return (
    <>
      <Head kicker="Downloads" title="Invoices and documents" copy="Paid and completed orders can be opened as invoices." />
      {invoices.length === 0 ? (
        <EmptyState title="No documents yet" copy="Invoices appear after an order is placed." />
      ) : (
        <div className="acct-list">
          {invoices.map((invoice) => (
            <article className="ws-card" key={invoice.id}>
              <div className="ws-row">
                <div>
                  <strong>Invoice {invoice.id.slice(0, 8).toUpperCase()}</strong>
                  <p className="ws-hint">
                    {new Date(invoice.createdAt).toLocaleDateString('en-GB')} · {orderLabel(invoice.status)} · {money(invoice.total)}
                  </p>
                </div>
                <Action href={`/dashboard/orders/${invoice.id}/invoice`}>Open</Action>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export function UserProfile({
  name,
  email,
  image,
  address,
}: {
  name: string;
  email: string;
  image: string | null;
  address: {
    name: string | null;
    phone: string | null;
    line1: string | null;
    line2: string | null;
    city: string | null;
    postcode: string | null;
    country: string | null;
  } | null;
}) {
  return (
    <>
      <Head kicker="Profile" title="Personal details" copy="Identity, delivery address from your last order, and password." />
      <div className="ws-grid-2">
        <Panel title="Photo and name">
          <div className="acct-profile">
            <span className="ws-avatar">{(name[0] || 'N').toUpperCase()}</span>
            <div>
              <strong>{name}</strong>
              <p className="ws-hint">{email}</p>
              {image ? <p className="ws-hint">Photo on file.</p> : <p className="ws-hint">No photo uploaded yet.</p>}
            </div>
          </div>
        </Panel>
        <Panel title="Security">
          <p>Password sign-in with email verification.</p>
          <p className="ws-hint">Two-factor authentication will be offered here later.</p>
          <Action href="/forgot-password">Change password</Action>
        </Panel>
        <Panel title="Addresses">
          {address?.line1 ? (
            <p>
              {address.name}
              <br />
              {address.line1}
              {address.line2 ? <><br />{address.line2}</> : null}
              <br />
              {address.city} {address.postcode}
              <br />
              {address.country}
              {address.phone ? <><br />{address.phone}</> : null}
            </p>
          ) : (
            <EmptyState title="No saved address" copy="The address from your next checkout will show here." />
          )}
        </Panel>
        <Panel title="Contact">
          <p>{email}</p>
          <p className="ws-hint">{address?.phone || 'No phone on file yet.'}</p>
        </Panel>
      </div>
    </>
  );
}

export function UserSettings({ newsletter }: { newsletter: boolean }) {
  return (
    <>
      <Head kicker="Settings" title="Preferences" copy="Theme, language and how we write to you." />
      <div className="ws-grid-2">
        <Panel title="Theme">
          <p className="ws-hint">Light or dark. Saved on this device.</p>
          <ThemeToggle className="ws-btn" />
        </Panel>
        <Panel title="Language">
          <p>English (United Kingdom)</p>
          <p className="ws-hint">The storefront and invoices use en-GB.</p>
        </Panel>
        <Panel title="Privacy">
          <Action href="/privacy">Privacy policy</Action>
          <Action href="/gdpr">GDPR</Action>
          <Action href="/cookies">Cookies</Action>
        </Panel>
        <Panel title="Communication">
          <p>{newsletter ? 'This email is on the newsletter list.' : 'This email is not subscribed to the newsletter.'}</p>
          <Action href="/#newsletter">Manage newsletter</Action>
        </Panel>
      </div>
    </>
  );
}
