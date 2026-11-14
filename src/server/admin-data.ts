
import 'server-only';
import { loadPlans } from './site-content';
import { academySales } from '@/server/academy-payment';
import { prisma } from './db';
import type { LeadStatus, Role } from '@prisma/client';

export async function adminAnalytics() {
  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const [leads, newsletters, orders, users, paid, countries, items] =
    await Promise.all([
      prisma.lead.groupBy({ by: ['source'], _count: { _all: true } }),
      prisma.newsletterSubscriber.count(),
      prisma.order.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, totalPence: true, status: true },
      }),
      prisma.user.count(),
      prisma.order.count({ where: { status: 'PAID' } }),
      prisma.order.groupBy({
        by: ['country'],
        _count: { _all: true },
        _sum: { totalPence: true },
      }),
      prisma.orderItem.groupBy({
        by: ['name'],
        _sum: { quantity: true },
      }),
    ]);

  const days = Array.from({ length: 14 }, (_, index) => {
    const day = new Date(since);
    day.setDate(since.getDate() + index);
    const key = day.toISOString().slice(0, 10);
    const rows = orders.filter(
      (order) => order.createdAt.toISOString().slice(0, 10) === key,
    );

    return {
      day: key.slice(5),
      orders: rows.length,
      revenue:
        rows
          .filter((order) => order.status === 'PAID')
          .reduce((sum, order) => sum + order.totalPence, 0) / 100,
    };
  });

  return {
    leads,
    newsletters,
    users,
    paid,
    days,
    contactForms: leads.reduce((sum, row) => sum + row._count._all, 0),
    countries: countries.map((row) => ({
      country: row.country || 'Unknown',
      orders: row._count._all,
      revenue: (row._sum.totalPence || 0) / 100,
    })),
    topProducts: items
      .map((row) => ({
        name: row.name,
        quantity: row._sum.quantity || 0,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8),
  };
}

function startOfDay(offset: number) {
  const day = new Date();
  day.setDate(day.getDate() + offset);
  day.setHours(0, 0, 0, 0);
  return day;
}

function pctDelta(current: number, previous: number) {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export async function adminDashboard() {
  const currentFrom = startOfDay(-13);
  const previousFrom = startOfDay(-27);
  const previousTo = startOfDay(-13);

  const [
    orders,
    leads,
    users,
    products,
    paidAgg,
    pendingLeads,
    wonLeads,
    newsletter,
    currentOrders,
    previousOrders,
    currentLeads,
    previousLeads,
    leadStatus,
    leadSources,
    recentOrders,
    recentLeads,
    activity,
    todayOrders,
    todayPaid,
    pendingOrders,
    completedOrders,
    newUsersToday,
    lowStock,
    recentPaid,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.lead.count(),
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { totalPence: true },
    }),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.lead.count({ where: { status: 'WON' } }),
    prisma.newsletterSubscriber.count(),
    prisma.order.findMany({
      where: { createdAt: { gte: currentFrom } },
      select: { createdAt: true, totalPence: true, status: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: previousFrom, lt: previousTo } },
      select: { totalPence: true, status: true },
    }),
    prisma.lead.count({ where: { createdAt: { gte: currentFrom } } }),
    prisma.lead.count({
      where: { createdAt: { gte: previousFrom, lt: previousTo } },
    }),
    prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.lead.groupBy({ by: ['source'], _count: { _all: true } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        status: true,
        totalPence: true,
        createdAt: true,
      },
    }),
    prisma.lead.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfDay(0) } } }),
    prisma.order.aggregate({
      where: { status: 'PAID', createdAt: { gte: startOfDay(0) } },
      _sum: { totalPence: true },
    }),
    prisma.order.count({
      where: { status: { in: ['PENDING', 'PROCESSING'] } },
    }),
    prisma.order.count({
      where: { status: { in: ['FULFILLED', 'DELIVERED'] } },
    }),
    prisma.user.count({ where: { createdAt: { gte: startOfDay(0) } } }),
    prisma.product.count({
      where: { published: true, stock: { lte: 3 } },
    }),
    prisma.order.findMany({
      where: {
        status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'FULFILLED'] },
      },
      take: 6,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        email: true,
        status: true,
        totalPence: true,
        createdAt: true,
      },
    }),
  ]);

  const days = Array.from({ length: 14 }, (_, index) => {
    const day = new Date(currentFrom);
    day.setDate(currentFrom.getDate() + index);
    const key = day.toISOString().slice(0, 10);
    const rows = currentOrders.filter(
      (order) => order.createdAt.toISOString().slice(0, 10) === key,
    );
    const paid = rows.filter((order) => order.status === 'PAID');

    return {
      day: key.slice(5),
      label: day.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      }),
      orders: rows.length,
      revenue:
        paid.reduce((sum, order) => sum + order.totalPence, 0) / 100,
    };
  });

  const currentRevenue =
    currentOrders
      .filter((order) => order.status === 'PAID')
      .reduce((sum, order) => sum + order.totalPence, 0) / 100;

  const previousRevenue =
    previousOrders
      .filter((order) => order.status === 'PAID')
      .reduce((sum, order) => sum + order.totalPence, 0) / 100;

  const conversion = leads === 0 ? 0 : Math.round((wonLeads / leads) * 1000) / 10;

  return {
    orders,
    leads,
    users,
    products,
    pendingLeads,
    wonLeads,
    newsletter,
    conversion,
    revenue: (paidAgg._sum.totalPence || 0) / 100,
    deltas: {
      revenue: pctDelta(currentRevenue, previousRevenue),
      orders: pctDelta(currentOrders.length, previousOrders.length),
      leads: pctDelta(currentLeads, previousLeads),
    },
    days,
    leadStatus: leadStatus.map((row) => ({
      status: row.status,
      count: row._count._all,
    })),
    leadSources: leadSources.map((row) => ({
      source: row.source,
      count: row._count._all,
    })),
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      email: order.email,
      status: order.status,
      total: order.totalPence / 100,
      createdAt: order.createdAt.toISOString().slice(0, 10),
    })),
    recentLeads: recentLeads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      status: lead.status,
      createdAt: lead.createdAt.toISOString().slice(0, 10),
    })),
    activity: activity.map((item) => ({
      id: item.id,
      action: item.action,
      entity: item.entity,
      actor: item.user?.email || 'system',
      createdAt: item.createdAt.toISOString(),
    })),
    today: {
      orders: todayOrders,
      revenue: (todayPaid._sum.totalPence || 0) / 100,
      users: newUsersToday,
    },
    pendingOrders,
    completedOrders,
    lowStock,
    recentPayments: recentPaid.map((order) => ({
      id: order.id,
      email: order.email,
      status: order.status,
      total: order.totalPence / 100,
      createdAt: order.createdAt.toISOString().slice(0, 10),
    })),
  };
}

export async function adminActivity(limit = 8) {
  const activity = await prisma.auditLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true, name: true } } },
  });

  return activity.map((item) => ({
    id: item.id,
    action: item.action,
    entity: item.entity,
    actor: item.user?.email || 'system',
    createdAt: item.createdAt.toISOString(),
  }));
}

export async function adminLeads(query?: string) {
  return prisma.lead.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function adminOrders(query?: string) {
  return prisma.order.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
            { id: { contains: query, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: {
      items: true,
      user: { select: { name: true, email: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function adminProducts(query?: string) {
  return prisma.product.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { id: { contains: query, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: { category: true, _count: { select: { reviews: true } } },
    orderBy: { name: 'asc' },
  });
}

export async function adminUsers(query?: string) {
  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      twoFactorEnabled: true,
      orders: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          totalPence: true,
          createdAt: true,
        },
      },
      leads: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true, createdAt: true },
      },
      wishlist: {
        take: 8,
        select: { product: { select: { name: true } } },
      },
      _count: { select: { orders: true, leads: true, wishlist: true } },
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    emailVerified: user.emailVerified,
    suspended: Boolean((user as { suspended?: boolean }).suspended),
    createdAt: user.createdAt,
    orders: user._count.orders,
    quotes: user._count.leads,
    wishlist: user._count.wishlist,
    recentOrders: user.orders.map((order) => ({
      id: order.id,
      status: order.status,
      total: order.totalPence / 100,
      createdAt: order.createdAt.toISOString(),
    })),
    recentQuotes: user.leads.map((lead) => ({
      id: lead.id,
      status: lead.status,
      createdAt: lead.createdAt.toISOString(),
    })),
    saved: user.wishlist.map((item) => item.product.name),
  }));
}

export async function adminAudit() {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 40,
    include: { user: { select: { email: true, name: true } } },
  });
}

export async function adminCms() {
  const [articles, courses, caseStudies] = await Promise.all([
    prisma.cmsArticle.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.cmsCourse.findMany({ include: { lessons: true } }),
    prisma.caseStudy.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  return { articles, courses, caseStudies };
}

export async function adminProjects() {
  return prisma.deliveryProject.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

/* ───────── Academy admin translation helpers ───────── */

export type AdminProgrammeTranslation = {
  title: string;
  level: string;
  price: number | null;
  hours: string;
  weeks: string;
  promise: string;
  blurb: string;
  outcomes: string;
  syllabus: string;
  seoTitle: string;
  seoDescription: string;
};

function emptyAdminFrenchTranslation(): AdminProgrammeTranslation {
  return {
    title: '',
    level: '',
    price: null,
    hours: '',
    weeks: '',
    promise: '',
    blurb: '',
    outcomes: '',
    syllabus: '',
    seoTitle: '',
    seoDescription: '',
  };
}

function toAdminFrenchTranslation(value: unknown): AdminProgrammeTranslation {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return emptyAdminFrenchTranslation();
  }

  const translations = value as Record<string, unknown>;
  const fr = translations.fr;

  if (!fr || typeof fr !== 'object' || Array.isArray(fr)) {
    return emptyAdminFrenchTranslation();
  }

  const data = fr as Record<string, unknown>;

  const outcomes = Array.isArray(data.outcomes)
    ? data.outcomes.map(String).join('\n')
    : '';

  const syllabus = Array.isArray(data.syllabus)
    ? (data.syllabus as { title?: unknown; body?: unknown }[])
        .map(
          (row) =>
            `${String(row.title ?? '')} | ${String(row.body ?? '')}`,
        )
        .join('\n')
    : '';

  return {
    title: String(data.title ?? ''),
    level: String(data.level ?? ''),
    price: typeof data.price === 'number' ? data.price : null,
    hours: String(data.hours ?? ''),
    weeks: String(data.weeks ?? ''),
    promise: String(data.promise ?? ''),
    blurb: String(data.blurb ?? ''),
    outcomes,
    syllabus,
    seoTitle: String(data.seoTitle ?? ''),
    seoDescription: String(data.seoDescription ?? ''),
  };
}

export async function adminAcademy() {
  const empty = {
    programmes: [] as AdminProgramme[],
    registrations: [] as AdminRegistration[],
    enrolments: [] as AdminEnrolment[],
    sales: {
      livePence: 0,
      liveCount: 0,
      testPence: 0,
      testCount: 0,
    },
  };

  let data = empty;

  try {
    const [programmes, registrations, enrolments, sales] =
      await Promise.all([
        prisma.nvAcademyProgramme.findMany({
          orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
          include: {
            sessions: { orderBy: { startsOn: 'asc' } },
          },
        }),
        prisma.nvAcademyPreRegistration.findMany({
          orderBy: { createdAt: 'desc' },
          take: 1000,
        }),
        prisma.nvAcademyEnrolment.findMany({
          orderBy: { createdAt: 'desc' },
          take: 1000,
        }),
        // If the payments table is unavailable, the rest of Academy still loads.
        academySales().catch(() => ({
          livePence: 0,
          liveCount: 0,
          testPence: 0,
          testCount: 0,
        })),
      ]);

    data = {
      sales,

      enrolments: enrolments.map((e) => ({
        id: e.id,
        ref: e.ref,
        name: e.name,
        email: e.email,
        phone: e.phone ?? '',
        programmeId: e.programmeId,
        sessionId: e.sessionId ?? '',
        goal: e.goal ?? '',
        status: e.status,
        paymentStatus: e.paymentStatus,
        amountPence: e.amountPence ?? 0,
        paymentIsTest: e.paymentIsTest,
        staffNote: e.staffNote ?? '',
        consentAt: e.consentAt
          ? e.consentAt.toISOString().slice(0, 10)
          : '',
        createdAt: e.createdAt.toISOString().slice(0, 10),
        history: (
          Array.isArray(e.history)
            ? (e.history as {
                status?: string;
                at?: string;
                by?: string;
                note?: string;
              }[])
            : []
        ).map((h) => ({
          status: String(h.status ?? ''),
          at: String(h.at ?? '').slice(0, 10),
          by: String(h.by ?? ''),
          note: h.note ?? '',
        })),
      })),

      programmes: programmes.map((p) => ({
        id: p.id,
        cat: p.cat,
        theme: p.theme,
        title: p.title,
        level: p.level,
        price: p.price,
        intro: p.intro,
        introCourseId: p.introCourseId ?? '',
        lessons: p.lessons,
        hours: p.hours,
        weeks: p.weeks,
        promise: p.promise,
        blurb: p.blurb,
        outcomes: p.outcomes.join('\n'),
        syllabus: (
          Array.isArray(p.syllabus)
            ? (p.syllabus as { title?: string; body?: string }[])
            : []
        )
          .map(
            (row) =>
              `${row.title ?? ''} | ${row.body ?? ''}`,
          )
          .join('\n'),
        seoTitle: p.seoTitle ?? '',
        seoDescription: p.seoDescription ?? '',

        // French programme content is read from NvAcademyProgramme.translations.fr.
        fr: toAdminFrenchTranslation(p.translations),

        sortOrder: p.sortOrder,
        published: p.published,

        sessions: p.sessions.map((s) => ({
          id: s.id,
          startsOn: s.startsOn.toISOString().slice(0, 10),
          days: s.days,
          time: s.time,
          mode: s.mode,
          seats: s.seats,
          taken: s.taken,
          published: s.published,
        })),
      })),

      registrations: registrations.map((r) => ({
        id: r.id,
        ref: r.ref ?? '',
        name: r.name,
        email: r.email,
        phone: r.phone ?? '',
        programmeId: r.courseId,
        sessionId: r.sessionId ?? '',
        experience: r.experience ?? '',
        message: r.message ?? '',
        status: r.status,
        consentAt: r.consentAt
          ? r.consentAt.toISOString().slice(0, 10)
          : '',
        emailed: Boolean(r.emailSentAt),
        createdAt: r.createdAt.toISOString().slice(0, 10),
      })),
    };
  } catch {
    // Academy tables are created by the database sync script.
  }

  const courses = await prisma.cmsCourse
    .findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    })
    .catch(() => []);

  const learners = await prisma.lessonProgress
    .findMany({ distinct: ['userId'], select: { userId: true } })
    .then((rows) => rows.length)
    .catch(() => 0);

  return { ...data, courses, learners };
}

export type AdminProgramme = {
  id: string;
  cat: string;
  theme: string;
  title: string;
  level: string;
  price: number;
  intro: boolean;
  introCourseId: string;
  lessons: number;
  hours: string;
  weeks: string;
  promise: string;
  blurb: string;
  outcomes: string;
  syllabus: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  published: boolean;
  fr: AdminProgrammeTranslation;
  sessions: {
    id: string;
    startsOn: string;
    days: string;
    time: string;
    mode: string;
    seats: number;
    taken: number;
    published: boolean;
  }[];
};

export type AdminEnrolment = {
  paymentStatus: string;
  amountPence: number;
  paymentIsTest: boolean;
  id: string;
  ref: string;
  name: string;
  email: string;
  phone: string;
  programmeId: string;
  sessionId: string;
  goal: string;
  status: string;
  staffNote: string;
  consentAt: string;
  createdAt: string;
  history: {
    status: string;
    at: string;
    by: string;
    note: string;
  }[];
};

export type AdminRegistration = {
  id: string;
  ref: string;
  name: string;
  email: string;
  phone: string;
  programmeId: string;
  sessionId: string;
  experience: string;
  message: string;
  status: string;
  consentAt: string;
  emailed: boolean;
  createdAt: string;
};

export async function adminSitePages() {
  try {
    return await prisma.nvSitePage.findMany();
  } catch {
    return [];
  }
}

export async function adminPlans() {
  return loadPlans();
}

/** Ids of plans that have an admin override row (shown as "Edited"). */
export async function adminCustomisedPlanIds() {
  try {
    const rows = await prisma.nvPricingPlan.findMany({
      select: { id: true },
    });

    return new Set(rows.map((row) => row.id));
  } catch {
    return new Set<string>();
  }
}

export async function adminCoupons() {
  return prisma.coupon.findMany({ orderBy: { code: 'asc' } });
}

export type AdminRole = Role;
export type AdminLeadStatus = LeadStatus;
