import { notFound } from 'next/navigation';
import { adminSections } from '@/lib/workspace-ia';
import {
  AdminAnalyticsView,
  AdminCmsView,
  AdminCrmView,
  AdminEmptyModule,
  AdminFinanceView,
  AdminMarketplaceView,
  AdminPagesView,
  AdminProjectsView,
  AdminSettingsView,
  AdminUsersView,
} from '@/features/workspace/admin-views';
import { can, consoleAccess } from '@/server/rbac';
import { headers } from 'next/headers';
import {
  adminAnalytics,
  adminAudit,
  adminCms,
  adminCoupons,
  adminLeads,
  adminOrders,
  adminPlans,
  adminSitePages,
  adminCustomisedPlanIds,
  adminProducts,
  adminProjects,
  adminUsers,
} from '@/server/admin-data';
import { maskSecret, smtpSettings, stripeSettings } from '@/server/settings';
import { publicSiteUrl } from '@/lib/site';
import { editablePages } from '@/lib/site-pages';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return adminSections.map((section) => ({ section }));
}

export default async function AdminSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const access = await consoleAccess(await headers());
  if (!access) return null;
  const { section } = await params;
  if (!adminSections.includes(section)) notFound();
  const query = ((await searchParams).q || '').trim();

  if (section === 'analytics') {
    const data = await adminAnalytics();
    return <AdminAnalyticsView {...data} />;
  }
  if (section === 'crm') {
    return <AdminCrmView leads={await adminLeads(query)} />;
  }
  if (section === 'finance') {
    return <AdminFinanceView orders={await adminOrders(query)} />;
  }
  if (section === 'marketplace') {
    const [products, coupons] = await Promise.all([
      adminProducts(query),
      adminCoupons(),
    ]);
    return <AdminMarketplaceView products={products} coupons={coupons} />;
  }
  if (section === 'cms') {
    const data = await adminCms();
    return (
      <AdminCmsView
        articles={data.articles}
        courses={data.courses}
        caseStudies={data.caseStudies}
      />
    );
  }
  if (section === 'pages') {
    const [rows, plans, dbPlanRows] = await Promise.all([adminSitePages(), adminPlans(), adminCustomisedPlanIds()]);
    const saved = Object.fromEntries(
      rows.map((row) => [
        row.key,
        { title: row.title ?? '', description: row.description ?? '', html: row.html, published: row.published },
      ]),
    );
    return (
      <AdminPagesView
        pages={editablePages}
        saved={saved}
        plans={plans.map((plan) => ({
          ...plan,
          featured: Boolean(plan.featured),
          customised: dbPlanRows.has(plan.id),
        }))}
        canEditPricing={can(access.role, 'MANAGER')}
      />
    );
  }
  if (section === 'users') {
    const [users, auditLog] = await Promise.all([adminUsers(query), adminAudit()]);
    return <AdminUsersView users={users} auditLog={auditLog} />;
  }
  if (section === 'settings') {
    const [stripe, smtp] = await Promise.all([stripeSettings(), smtpSettings()]);
    const active = stripe[stripe.mode];
    const view = (mode: 'test' | 'live') => ({
      secretKey: maskSecret(stripe[mode].secretKey),
      publishableKey: stripe[mode].publishableKey ?? null,
      webhookSecret: maskSecret(stripe[mode].webhookSecret),
    });
    return (
      <AdminSettingsView
        canEdit={can(access.role, 'ADMIN')}
        stripe={{
          mode: stripe.mode,
          webhookUrl: `${publicSiteUrl()}/api/webhooks/stripe`,
          keys: { test: view('test'), live: view('live') },
        }}
        smtp={{
          host: smtp.host ?? '',
          port: smtp.port,
          secure: smtp.secure,
          user: smtp.user ?? '',
          from: smtp.from ?? '',
          passSet: Boolean(smtp.pass),
        }}
        flags={[
          {
            label: 'Database',
            ok: true,
            detail: 'PostgreSQL connected for this request.',
          },
          {
            label: `Stripe (${stripe.mode})`,
            ok: Boolean(active.secretKey),
            detail: active.secretKey
              ? active.webhookSecret
                ? `Checkout charges in ${stripe.mode} mode. Webhook signing is set.`
                : `Checkout charges in ${stripe.mode} mode. Add the webhook secret so paid orders update.`
              : `No ${stripe.mode} secret key. Checkout returns 503.`,
          },
          {
            label: 'Email (SMTP)',
            ok: Boolean(smtp.host),
            detail: smtp.host
              ? `Delivering through ${smtp.host}:${smtp.port}.`
              : 'No SMTP host. Emails are skipped in development and fail in production.',
          },
          {
            label: 'Redis',
            ok: Boolean(process.env.REDIS_URL),
            detail: process.env.REDIS_URL
              ? 'Rate limits use Redis.'
              : 'In-memory rate limits (single instance).',
          },
          {
            label: 'Site URL',
            ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
            detail: process.env.NEXT_PUBLIC_SITE_URL || 'Not set',
          },
          {
            label: 'Turnstile',
            ok: Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
            detail:
              process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
                ? 'Captcha verification is on.'
                : 'Captcha skipped until both Turnstile keys are set.',
          },
        ]}
      />
    );
  }
  if (section === 'automation') {
    return (
      <AdminEmptyModule
        title="Automation & tickets."
        copy="There is no job queue or ticket table in this release. Support stays on /contact leads."
      />
    );
  }
  if (section === 'projects') {
    return <AdminProjectsView projects={await adminProjects()} />;
  }
  if (section === 'library') {
    return (
      <AdminEmptyModule
        title="Libraries."
        copy="Templates and agent skills are not stored as records. Use CMS and marketplace instead."
      />
    );
  }
  notFound();
}
