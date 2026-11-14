import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { money } from '@/lib/utils';
import { orderLabel } from '@/lib/order-status';
import { PrintInvoiceButton } from '@/features/workspace/user-client';
import { customerOrder } from '@/server/user-data';
import { requireSession } from '@/server/rbac';

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession(await headers());
  const { id } = await params;
  const order = await customerOrder(session.user.id, session.user.email, id);
  if (!order) notFound();

  return (
    <article className="acct-invoice">
      <header>
        <p className="ws-kicker">NEVIE-GLOBAL UK</p>
        <h1 className="ws-title">Invoice {order.id.slice(0, 8).toUpperCase()}</h1>
        <p className="ws-copy">
          {new Date(order.createdAt).toLocaleDateString('en-GB')} · {orderLabel(order.status)}
        </p>
      </header>
      <section>
        <h2>Bill to</h2>
        <p>
          {order.name || session.user.name}
          <br />
          {order.email}
          {order.line1 ? (
            <>
              <br />
              {order.line1}
              {order.line2 ? (
                <>
                  <br />
                  {order.line2}
                </>
              ) : null}
              <br />
              {order.city} {order.postcode}
              <br />
              {order.country}
            </>
          ) : null}
        </p>
      </section>
      <table className="ws-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Line</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.productId + item.name}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{money(item.unit)}</td>
              <td>{money(item.unit * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Subtotal {money(order.subtotal)}
        {order.discount ? ` · Discount ${money(order.discount)}` : ''}
        {` · Shipping ${money(order.shippingPence)} · VAT ${money(order.vat)}`}
      </p>
      <p>
        <strong>Total {money(order.total)}</strong>
      </p>
      <PrintInvoiceButton />
    </article>
  );
}
