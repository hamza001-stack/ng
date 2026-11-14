import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import { log } from './logger';
import { smtpSettings, type SmtpSettings } from './settings';
import { publicSiteUrl } from '@/lib/site';

const DEFAULT_FROM = 'NEVIE-GLOBAL UK <support.uk@nevie-global.com>';
const NAVY = '#0A1628';
const BLUE = '#1B4F8A';
const GOLD = '#C9A227';

let transport: { signature: string; mailer: Transporter } | undefined;

function mailerFor(settings: SmtpSettings) {
  const signature = JSON.stringify([settings.host, settings.port, settings.secure, settings.user, settings.pass]);
  if (transport?.signature !== signature) {
    transport = {
      signature,
      mailer: nodemailer.createTransport({
        host: settings.host,
        port: settings.port,
        secure: settings.secure,
        auth: settings.user ? { user: settings.user, pass: settings.pass } : undefined,
        connectionTimeout: 15_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      }),
    };
  }
  return transport.mailer;
}

export async function mailConfigured() {
  return Boolean((await smtpSettings()).host);
}

export async function verifySmtp(settings?: SmtpSettings) {
  const resolved = settings ?? (await smtpSettings());
  if (!resolved.host) throw new Error('SMTP host is not set');
  await mailerFor(resolved).verify();
}

export function formNotifyEmails() {
  const raw = process.env.FORM_NOTIFY_EMAILS || '';
  const listed = raw
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter((item) => item.includes('@'));
  if (listed.length) return listed;
  return ['contact@nevie-global.com', 'emmanuel.varinot@nevie-global.com'];
}

export async function sendTransactionalEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}) {
  const settings = await smtpSettings();
  if (!settings.host) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email delivery is not configured');
    }
    log('warn', 'email_skipped_dev', { to: input.to, subject: input.subject });
    return { skipped: true as const };
  }
  const info = await mailerFor(settings).sendMail({
    from: settings.from || DEFAULT_FROM,
    to: Array.isArray(input.to) ? input.to.join(', ') : input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  return { skipped: false as const, id: info.messageId };
}

function brandedEmail(input: { eyebrow: string; title: string; body: string; actionLabel?: string; actionUrl?: string }) {
  const site = publicSiteUrl();
  const button = input.actionUrl
    ? `<p style="margin:28px 0 8px;"><a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;background:${BLUE};color:#ffffff;text-decoration:none;font-family:Georgia,Times,serif;font-size:14px;letter-spacing:0.04em;padding:12px 22px;border:1px solid ${GOLD};">${escapeHtml(input.actionLabel || 'Open')}</a></p>`
    : '';
  return `<!DOCTYPE html>
<html lang="en-GB">
<body style="margin:0;padding:0;background:#f4f6f8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #d5dce3;max-width:560px;width:100%;">
          <tr>
            <td style="background:${NAVY};padding:22px 28px;border-bottom:3px solid ${GOLD};">
              <p style="margin:0;font-family:Georgia,Times,serif;font-size:11px;letter-spacing:0.16em;color:${GOLD};text-transform:uppercase;">NEVIE-GLOBAL UK</p>
              <p style="margin:8px 0 0;font-family:Georgia,Times,serif;font-size:20px;color:#ffffff;">${escapeHtml(input.eyebrow)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;font-family:Georgia,Times,serif;color:#14262f;font-size:15px;line-height:1.55;">
              <h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:${NAVY};">${escapeHtml(input.title)}</h1>
              ${input.body}
              ${button}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 22px;border-top:1px solid #e4eaef;font-family:Georgia,Times,serif;font-size:12px;line-height:1.5;color:#4a5568;">
              NEVIE-GLOBAL UK · <a href="${escapeHtml(site)}" style="color:${BLUE};">${escapeHtml(site.replace(/^https?:\/\//, ''))}</a><br>
              Support: support.uk@nevie-global.com · Enquiries: contact@nevie-global.com
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function verifyEmailHtml(name: string, url: string) {
  const hello = name?.trim() ? `Hello ${escapeHtml(name)},` : 'Hello,';
  return brandedEmail({
    eyebrow: 'Account',
    title: 'Confirm your email',
    body: `<p style="margin:0 0 12px;">${hello}</p><p style="margin:0 0 12px;">Use the button below to confirm your NEVIE-GLOBAL UK account. If you did not create this account, ignore this email.</p>`,
    actionLabel: 'Confirm account',
    actionUrl: url,
  });
}

export function resetPasswordHtml(name: string, url: string) {
  const hello = name?.trim() ? `Hello ${escapeHtml(name)},` : 'Hello,';
  return brandedEmail({
    eyebrow: 'Security',
    title: 'Reset your password',
    body: `<p style="margin:0 0 12px;">${hello}</p><p style="margin:0 0 12px;">A password reset was requested for your NEVIE-GLOBAL UK account. This link expires. If you did not ask for it, ignore this email.</p>`,
    actionLabel: 'Reset password',
    actionUrl: url,
  });
}

export function orderEmailHtml(orderId: string, total: string) {
  const url = `${publicSiteUrl()}/dashboard/orders`;
  const short = orderId.slice(0, 8).toUpperCase();
  return brandedEmail({
    eyebrow: 'Order confirmation',
    title: `Order ${short} is confirmed`,
    body: `<p style="margin:0 0 12px;">Thank you. Payment for order <strong>${escapeHtml(orderId)}</strong> has been received.</p><p style="margin:0 0 12px;">Total: <strong>${escapeHtml(total)}</strong></p><p style="margin:0;">A member of the UK support team can help at support.uk@nevie-global.com.</p>`,
    actionLabel: 'View order',
    actionUrl: url,
  });
}

export function enquiryReceivedHtml(name: string) {
  const hello = name?.trim() ? `Hello ${escapeHtml(name)},` : 'Hello,';
  return brandedEmail({
    eyebrow: 'Enquiry',
    title: 'We have received your message',
    body: `<p style="margin:0 0 12px;">${hello}</p><p style="margin:0;">Thank you for contacting NEVIE-GLOBAL UK. We have your enquiry and will reply to this email address.</p>`,
  });
}

export function formNotifyHtml(input: {
  name: string;
  email: string;
  kind: string;
  rowsHtml: string;
  message: string;
}) {
  return brandedEmail({
    eyebrow: 'New form',
    title: `${input.kind} from ${input.name}`,
    body: `<p style="margin:0 0 12px;"><strong>${escapeHtml(input.name)}</strong> · <a href="mailto:${escapeHtml(input.email)}" style="color:${BLUE};">${escapeHtml(input.email)}</a></p>${input.rowsHtml}<p style="margin:16px 0 0;white-space:pre-wrap;">${escapeHtml(input.message)}</p>`,
  });
}

export function smtpTestHtml() {
  return brandedEmail({
    eyebrow: 'SMTP test',
    title: 'Email delivery is working',
    body: '<p style="margin:0;">This is a NEVIE-GLOBAL UK SMTP test from the configured support mailbox.</p>',
  });
}

export function academyConfirmationEmail(input: {
  name: string;
  ref: string;
  programme: string;
  startDate?: string;
  position: number;
}) {
  const first = input.name.trim().split(/\s+/)[0] || 'there';
  const start = input.startDate ? `<p style="margin:0 0 10px;">Preferred start: <strong>${escapeHtml(input.startDate)}</strong></p>` : '';
  const html = brandedEmail({
    eyebrow: 'NEVIE Academy',
    title: `You're on the waiting list, ${first}`,
    body: `<p style="margin:0 0 10px;">Thank you for pre-registering for <strong>${escapeHtml(input.programme)}</strong>.</p>${start}<p style="margin:0 0 10px;">Your reference: <strong>${escapeHtml(input.ref)}</strong><br>Your place on this programme's list: <strong>#${input.position}</strong></p><p style="margin:0 0 10px;">There is nothing to pay today. We will email you when places open.</p>`,
    actionLabel: 'See start dates',
    actionUrl: `${publicSiteUrl()}/academy/schedule`,
  });
  const text = `Hello ${first},\n\nYou are on the waiting list for ${input.programme}.${input.startDate ? `\nPreferred start: ${input.startDate}` : ''}\nReference: ${input.ref}\nPlace on list: #${input.position}\n\nNothing to pay today. We will email you when places open.\n\nNEVIE-GLOBAL UK`;
  return { subject: `NEVIE Academy: you're on the waiting list (${input.ref})`, html, text };
}

export function academyEnrolmentEmail(input: {
  status: string;
  name: string;
  ref: string;
  programme: string;
  startDate?: string;
  message?: string;
  payUrl?: string;
  amount?: string;
}) {
  const first = input.name.trim().split(/\s+/)[0] || 'there';
  const copy: Record<string, { subject: string; title: string; line: string }> = {
    REQUESTED: { subject: 'we have your enrolment request', title: 'Enrolment request received', line: 'We have received your request and will review it shortly.' },
    UNDER_REVIEW: { subject: 'your request is being reviewed', title: 'Your request is under review', line: 'Our team is reviewing your request. We will be in touch soon.' },
    APPROVED: { subject: 'your place is approved', title: 'Your place is approved', line: 'Good news: your place is approved. We will send payment and joining details before the start date.' },
    WAITLISTED: { subject: 'you are on the waiting list', title: 'You are on the waiting list', line: 'This start date is full. We have kept your request and will contact you if a place opens.' },
    DECLINED: { subject: 'update on your request', title: 'We could not offer a place this time', line: 'Unfortunately we cannot offer you a place on this start date. You are welcome to apply for another date.' },
    ENROLLED: { subject: 'you are enrolled', title: 'You are enrolled', line: 'Payment received and you are now enrolled. See you on the first session.' },
    CANCELLED: { subject: 'your request was cancelled', title: 'Your request was cancelled', line: 'Your enrolment request has been cancelled. Reply to this email if that is a mistake.' },
  };
  const c = copy[input.status] ?? copy.UNDER_REVIEW;
  const start = input.startDate ? `<br>Start: <strong>${escapeHtml(input.startDate)}</strong>` : '';
  const note = input.message ? `<p style="margin:0 0 10px;padding:10px 14px;border-left:3px solid ${GOLD};background:#f7f4e8;">${escapeHtml(input.message)}</p>` : '';
  const pay = input.payUrl
    ? `<p style="margin:0 0 10px;">Amount due: <strong>${escapeHtml(input.amount ?? '')}</strong>. Pay securely with Stripe to confirm your place (link valid for 23 hours).</p>`
    : '';
  const html = brandedEmail({
    eyebrow: 'NEVIE Academy',
    title: `${c.title}, ${first}`,
    body: `<p style="margin:0 0 10px;">${escapeHtml(c.line)}</p>${note}<p style="margin:0 0 10px;">Programme: <strong>${escapeHtml(input.programme)}</strong>${start}<br>Reference: <strong>${escapeHtml(input.ref)}</strong></p>${pay}`,
    actionLabel: input.payUrl ? 'Pay now' : 'Track your application',
    actionUrl: input.payUrl ?? `${publicSiteUrl()}/academy/status`,
  });
  const text = `Hello ${first},\n\n${c.line}\n${input.message ? '\n' + input.message + '\n' : ''}\nProgramme: ${input.programme}${input.startDate ? '\nStart: ' + input.startDate : ''}\nReference: ${input.ref}\n${input.payUrl ? `\nAmount due: ${input.amount ?? ''}\nPay now: ${input.payUrl}\n` : ''}\nTrack it: ${publicSiteUrl()}/academy/status\n\nNEVIE-GLOBAL UK`;
  return { subject: `NEVIE Academy: ${c.subject} (${input.ref})`, html, text };
}

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
