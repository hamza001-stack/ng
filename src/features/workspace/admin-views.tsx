import { money } from '@/lib/utils';
import {
  AddArticleForm,
  AddCaseStudyForm,
  AddLeadForm,
  AddProductForm,
  AddProjectForm,
  LeadEditor,
  ProjectStatusEditor,
  ProjectPublicEditor,
} from './admin-actions';
import {
  ArticlesTable,
  AuditTable,
  CaseStudiesTable,
  CouponsTable,
  CoursesTable,
  LeadsTable,
  OrdersTable,
  ProductsTable,
  ProjectsTable,
  UsersTable,
} from './admin-tables';
import { PageHeader, EmptyState } from './page-header';
import { Badge, Panel } from './ui';
import { CreateDrawer } from './create-drawer';
import {
  PricingEditor,
  SitePageEditor,
  type PageOption,
  type PlanView,
  type SavedPage,
} from './admin-pages';
import { humanDate, orderRef, quoteStage } from '@/lib/workspace-format';
import { paymentLabel, shippingLabel } from '@/lib/order-status';
import { KpiCard } from './kpi-card';
import {
  SmtpSettingsForm,
  StripeSettingsForm,
  type SmtpView,
  type StripeView,
} from './integration-settings';
import { publishedContact } from '@/lib/company';
import { OrdersChart, RevenueChart, SourceChart } from './charts';
import { Newspaper, ShoppingBag, Ticket, Users } from 'lucide-react';

export function AdminOverview(props: {
  orders: number;
  leads: number;
  users: number;
  products: number;
  revenue: number;
}) {
  return (
    <PageHeader
      eyebrow="Console"
      title="Overview"
      description={`${props.orders} orders · ${money(props.revenue)} paid revenue. Open this page after dashboard load for charts.`}
    />
  );
}

export function AdminAnalyticsView({
  days,
  leads,
  newsletters,
  users,
  paid,
  contactForms,
  countries = [],
  topProducts = [],
}: {
  days: { day: string; orders: number; revenue: number }[];
  leads: { source: string; _count: { _all: number } }[];
  newsletters: number;
  users: number;
  paid: number;
  contactForms: number;
  countries?: { country: string; orders: number; revenue: number }[];
  topProducts?: { name: string; quantity: number }[];
}) {
  const chartDays = days.map((day) => ({
    label: day.day,
    orders: day.orders,
    revenue: day.revenue,
  }));
  return (
    <>
      <PageHeader
        eyebrow="Insight"
        title="Analytics"
        description="Order volume, enquiries and accounts from this database — not estimated traffic."
      />
      <div className="kpi-grid four">
        <KpiCard label="Paid orders" value={String(paid)} hint="All time" icon={<ShoppingBag size={16} />} />
        <KpiCard label="Accounts" value={String(users)} hint="Registered users" icon={<Users size={16} />} />
        <KpiCard label="Enquiries" value={String(contactForms)} hint="Contact leads" icon={<Ticket size={16} />} />
        <KpiCard label="Newsletter" value={String(newsletters)} hint="Confirmed subscribers" icon={<Newspaper size={16} />} />
      </div>
      <div className="ws-grid-2">
        <Panel title="Revenue · 14 days">
          {chartDays.some((day) => day.revenue > 0 || day.orders > 0) ? (
            <RevenueChart data={chartDays} />
          ) : (
            <EmptyState title="No orders in the last 14 days" copy="This series is built from createdAt on the Order table." />
          )}
        </Panel>
        <Panel title="Orders · 14 days">
          <OrdersChart data={chartDays} />
        </Panel>
      </div>
      <Panel title="Lead sources">
        <SourceChart
          data={leads.map((row) => ({ source: row.source, count: row._count._all }))}
        />
      </Panel>
      <div className="ws-grid-2">
        <Panel title="Countries">
          {countries.length === 0 ? (
            <EmptyState title="No country data" copy="Countries appear from checkout addresses." />
          ) : (
            <ul className="feed">
              {countries.map((row) => (
                <li key={row.country}>
                  <div>
                    <strong>{row.country}</strong>
                    <span className="ws-hint">{row.orders} orders</span>
                  </div>
                  <b>{money(row.revenue)}</b>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Top products">
          {topProducts.length === 0 ? (
            <EmptyState title="No product sales" copy="Quantities come from paid order lines." />
          ) : (
            <ul className="feed">
              {topProducts.map((row) => (
                <li key={row.name}>
                  <strong>{row.name}</strong>
                  <b>{row.quantity}</b>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}

export function AdminCrmView({
  leads,
}: {
  leads: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    status: 'NEW' | 'QUALIFIED' | 'WON' | 'LOST';
    source: string;
    createdAt: Date;
    message: string;
    fileKey?: string | null;
    details?: unknown;
  }[];
}) {
  const stages = ['NEW', 'QUALIFIED', 'WON', 'LOST'] as const;
  return (
    <>
      <PageHeader
        eyebrow="Revenue"
        title="CRM"
        description="Pipeline is live from the Lead table. Status writes immediately."
        actions={
          <CreateDrawer label="Add lead" title="New lead" kicker="CRM">
            <AddLeadForm plain />
          </CreateDrawer>
        }
      />
      <div className="kpi-grid four">
        {stages.map((stage) => (
          <KpiCard
            key={stage}
            label={quoteStage(stage)}
            value={String(leads.filter((lead) => lead.status === stage).length)}
            hint="Live count"
            icon={<Ticket size={16} />}
          />
        ))}
      </div>
      <div className="ws-kanban">
        {stages.map((stage) => {
          const column = leads.filter((lead) => lead.status === stage);
          return (
            <article className="kanban-col" key={stage}>
              <header>
                <h4>{quoteStage(stage)}</h4>
                <span>{column.length}</span>
              </header>
              {column.length === 0 ? (
                <p className="ws-hint">No leads in this stage</p>
              ) : (
                column.map((lead) => (
                  <div className="kanban-card" key={lead.id}>
                    <strong>{lead.name}</strong>
                    <p>{lead.company || lead.email}</p>
                    <LeadEditor id={lead.id} status={lead.status} />
                  </div>
                ))
              )}
            </article>
          );
        })}
      </div>
      <Panel title="Leads">
        <LeadsTable
          leads={leads.map((lead) => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            company: lead.company,
            status: lead.status,
            source: lead.source,
            message: lead.message,
            hasFile: Boolean(lead.fileKey),
            details:
              lead.details && typeof lead.details === 'object'
                ? Object.entries(lead.details as Record<string, unknown>)
                    .filter(([key, value]) => key !== 'consentAt' && typeof value === 'string' && value)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(' · ')
                : '',
            createdAt: humanDate(lead.createdAt),
          }))}
        />
      </Panel>
    </>
  );
}

export function AdminFinanceView({
  orders,
}: {
  orders: {
    id: string;
    email: string;
    name?: string | null;
    phone?: string | null;
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    postcode?: string | null;
    country?: string | null;
    status: string;
    totalPence: number;
    subtotalPence: number;
    vatPence: number;
    shippingPence: number;
    discountPence: number;
    notes?: string | null;
    internalNotes?: string | null;
    createdAt: Date;
    items: { name: string; quantity: number }[];
  }[];
}) {
  return (
    <>
      <PageHeader
        eyebrow="Orders"
        title="Order management"
        description="Search, export and change status. Every change writes to the audit log."
      />
      <Panel>
        <OrdersTable
          orders={orders.map((order) => ({
            id: order.id,
            ref: orderRef(order.id, order.createdAt),
            email: order.email,
            customer: order.name || order.email,
            phone: order.phone || '',
            address: [order.line1, order.line2, order.city, order.postcode, order.country]
              .filter(Boolean)
              .join(', '),
            status: order.status,
            payment: paymentLabel(order.status),
            shipping: shippingLabel(order.status),
            totalPence: order.totalPence,
            subtotalPence: order.subtotalPence,
            vatPence: order.vatPence,
            shippingPence: order.shippingPence,
            discountPence: order.discountPence,
            items: order.items.map((item) => `${item.name} ×${item.quantity}`).join(', '),
            notes: order.notes || '',
            internalNotes: order.internalNotes || '',
            createdAt: humanDate(order.createdAt),
          }))}
        />
      </Panel>
    </>
  );
}

export function AdminMarketplaceView({
  products,
  coupons,
}: {
  products: {
    id: string;
    name: string;
    stock: number;
    published: boolean;
    pricePence: number;
    description: string;
    tag: string | null;
    features: string[];
    imageUrl: string | null;
    updatedAt: Date;
    category: { name: string };
    _count: { reviews: number };
  }[];
  coupons: { code: string; percent: number; active: boolean }[];
}) {
  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Stock and live state save immediately. Create opens in a drawer."
        actions={
          <CreateDrawer label="Add product" title="New product" kicker="Catalogue">
            <AddProductForm
              plain
              categories={[...new Set(products.map((product) => product.category.name))]}
            />
          </CreateDrawer>
        }
      />
      <Panel title="Products">
        <ProductsTable
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            stock: product.stock,
            published: product.published,
            pricePence: product.pricePence,
            category: product.category.name,
            description: product.description,
            tag: product.tag,
            features: product.features,
            imageUrl: product.imageUrl,
            reviews: product._count.reviews,
            updatedAt: humanDate(product.updatedAt),
          }))}
        />
      </Panel>
      <Panel title="Coupons">
        <CouponsTable coupons={coupons} />
      </Panel>
    </>
  );
}

export function AdminCmsView({
  articles,
  courses,
  caseStudies,
}: {
  articles: { id: string; title: string; published: boolean; category: string }[];
  courses: { id: string; title: string; published: boolean; lessons: { id: string }[] }[];
  caseStudies: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    fileUrl: string | null;
    published: boolean;
  }[];
}) {
  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="CMS"
        description="Lists first. Create opens in a drawer."
        actions={
          <>
            <CreateDrawer label="New article" title="Publish article" kicker="CMS">
              <AddArticleForm plain />
            </CreateDrawer>
            <CreateDrawer label="New case study" title="Upload case study" kicker="CMS" fab={false}>
              <AddCaseStudyForm plain />
            </CreateDrawer>
          </>
        }
      />
      <Panel title="Articles">
        <ArticlesTable articles={articles} />
      </Panel>
      <Panel title="Case studies">
        <CaseStudiesTable caseStudies={caseStudies} />
      </Panel>
      <Panel title="Courses">
        <CoursesTable
          courses={courses.map((course) => ({
            id: course.id,
            title: course.title,
            published: course.published,
            lessons: course.lessons.length,
          }))}
        />
      </Panel>
    </>
  );
}

export function AdminPagesView({
  pages,
  saved,
  plans,
  canEditPricing,
}: {
  pages: PageOption[];
  saved: Record<string, SavedPage>;
  plans: PlanView[];
  canEditPricing: boolean;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Pages & pricing"
        description="Edit the SEO title, description and extra HTML of any page, and the engagement plans shown on /pricing. Changes go live within a minute."
      />
      <Panel title="Page content & SEO">
        <SitePageEditor pages={pages} saved={saved} />
      </Panel>
      <Panel title="Pricing plans">
        <PricingEditor plans={plans} canEdit={canEditPricing} />
      </Panel>
    </>
  );
}

export function AdminUsersView({
  users,
  auditLog,
}: {
  users: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: 'CUSTOMER' | 'STAFF' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
    emailVerified: boolean;
    suspended: boolean;
    createdAt: Date;
    orders: number;
    quotes: number;
    wishlist: number;
    recentOrders: { id: string; status: string; total: number; createdAt: string }[];
    recentQuotes: { id: string; status: string; createdAt: string }[];
    saved: string[];
  }[];
  auditLog: {
    id: string;
    action: string;
    entity: string;
    createdAt: Date;
    user: { name: string; email: string } | null;
  }[];
}) {
  return (
    <>
      <PageHeader
        eyebrow="Customers"
        title="Customer accounts"
        description="Profiles, orders, quotes and roles. Changes write to the audit log."
      />
      <Panel title="Users">
        <UsersTable
          users={users.map((user) => ({
            ...user,
            createdAt: humanDate(user.createdAt),
          }))}
        />
      </Panel>
      <Panel title="Audit log">
        <AuditTable
          auditLog={auditLog.map((item) => ({
            id: item.id,
            action: item.action,
            entity: item.entity,
            createdAt: item.createdAt.toISOString().slice(0, 16).replace('T', ' '),
            actor: item.user?.email || 'system',
          }))}
        />
      </Panel>
    </>
  );
}

export function AdminSettingsView({
  flags,
  stripe,
  smtp,
  canEdit,
}: {
  flags: { label: string; ok: boolean; detail: string }[];
  stripe: StripeView;
  smtp: SmtpView;
  canEdit: boolean;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Control"
        title="Settings"
        description="Payments, email and system health. Secrets are encrypted and never shown in full."
      />
      <section className="ws-settings-block">
        <h3>Published company facts</h3>
        <Panel title="nevie-global.com (source of truth)">
          <p className="ws-hint">
            Contact {publishedContact.email}. Socials: Instagram, X, LinkedIn only. Phone, WhatsApp,
            Facebook and UK Companies House details are To Be Confirmed. Override the inbox with
            LEGAL_CONTACT_EMAIL if operations use a different mailbox.
          </p>
        </Panel>
      </section>
      <section className="ws-settings-block">
        <h3>Payments</h3>
        <StripeSettingsForm view={stripe} canEdit={canEdit} />
      </section>
      <section className="ws-settings-block">
        <h3>SMTP</h3>
        <SmtpSettingsForm view={smtp} canEdit={canEdit} />
      </section>
      <section className="ws-settings-block">
        <h3>Security · system</h3>
      <div className="ws-grid-3">
        {flags.map((flag) => (
          <Panel key={flag.label} title={flag.label}>
            <Badge tone={flag.ok ? 'gold' : 'red'}>{flag.ok ? 'Configured' : 'Missing'}</Badge>
            <p className="ws-hint" style={{ marginTop: 10 }}>
              {flag.detail}
            </p>
          </Panel>
        ))}
      </div>
      </section>
    </>
  );
}

export function AdminProjectsView({
  projects,
}: {
  projects: {
    id: string;
    title: string;
    client: string;
    summary: string;
    status: 'BACKLOG' | 'DOING' | 'REVIEW' | 'DONE';
    fileUrl: string | null;
    phase: string;
    progress: number | null;
    isPublic: boolean;
  }[];
}) {
  const columns = ['BACKLOG', 'DOING', 'REVIEW', 'DONE'] as const;
  return (
    <>
      <PageHeader
        eyebrow="Delivery"
        title="Projects"
        description="Create a project, upload a file, and move it across the board."
        actions={
          <CreateDrawer label="New project" title="Create project" kicker="Delivery">
            <AddProjectForm plain />
          </CreateDrawer>
        }
      />
      <div className="ws-kanban">
        {columns.map((col) => {
          const cards = projects.filter((project) => project.status === col);
          return (
            <article className="kanban-col" key={col}>
              <header>
                <h4>{col}</h4>
                <span>{cards.length}</span>
              </header>
              {cards.length === 0 ? (
                <p className="ws-hint">Empty</p>
              ) : (
                cards.map((project) => (
                  <div className="kanban-card" key={project.id}>
                    <strong>{project.title}</strong>
                    <p>{project.client}</p>
                    <ProjectStatusEditor id={project.id} status={project.status} />
                    <ProjectPublicEditor
                      id={project.id}
                      phase={project.phase}
                      progress={project.progress}
                      isPublic={project.isPublic}
                    />
                  </div>
                ))
              )}
            </article>
          );
        })}
      </div>
      <Panel title="All projects">
        <ProjectsTable projects={projects} />
      </Panel>
    </>
  );
}

export function AdminEmptyModule({
  title,
  copy,
}: {
  title: string;
  copy: string;
}) {
  return (
    <>
      <PageHeader eyebrow="Not in this release" title={title} description={copy} />
      <EmptyState
        title="No live records"
        copy="This module is hidden from operations until a real data model ships."
      />
    </>
  );
}
