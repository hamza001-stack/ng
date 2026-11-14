"""NEVIE-GLOBAL UK complete handover PDF. Official colours only. No secrets."""
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    ListFlowable,
    ListItem,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "NEVIE-GLOBAL-UK-Complete-Handover.pdf"
DESKTOP = Path(r"C:\Users\muham\Desktop") / "NEVIE-GLOBAL-UK-Complete-Handover.pdf"
FONTS = Path(r"C:\Windows\Fonts")

pdfmetrics.registerFont(TTFont("Body", str(FONTS / "times.ttf")))
pdfmetrics.registerFont(TTFont("BodyBold", str(FONTS / "timesbd.ttf")))
pdfmetrics.registerFont(TTFont("BodyItalic", str(FONTS / "timesi.ttf")))

ELECTRIC = colors.HexColor("#00A9FF")
GOLD = colors.HexColor("#FFD47A")
BLACK = colors.HexColor("#000000")
INK = colors.HexColor("#14262F")
MUTED = colors.HexColor("#4D6571")
LINE = colors.HexColor("#D5E1E7")
PAPER = colors.HexColor("#F4F7F9")
WHITE = colors.white
W, H = A4
DATE = "5 October 2026"
STAGING = "https://web-staging-9d06.up.railway.app"
PROD = "https://web-production-4652eb.up.railway.app"
REPO = "https://github.com/ibrahimAltaf/nevie-global-uk"
OFFICIAL = "https://nevie-global.com"


def on_cover(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BLACK)
    canvas.rect(0, 0, W, H, fill=1, stroke=0)
    canvas.setFillColor(ELECTRIC)
    canvas.rect(0, 0, 7, H, fill=1, stroke=0)
    canvas.setFillColor(GOLD)
    canvas.rect(7, 0, 1.2, H, fill=1, stroke=0)
    canvas.setFillColor(GOLD)
    canvas.setFont("Body", 10)
    canvas.drawString(24 * mm, H - 28 * mm, "NEVIE-GLOBAL  /  UNITED KINGDOM")
    canvas.setFillColor(WHITE)
    canvas.setFont("Body", 13)
    canvas.drawString(24 * mm, H - 48 * mm, "Complete platform handover")
    canvas.setFont("BodyBold", 28)
    canvas.drawString(24 * mm, H - 64 * mm, "Environments, GitHub,")
    canvas.setFillColor(ELECTRIC)
    canvas.setFont("BodyBold", 28)
    canvas.drawString(24 * mm, H - 78 * mm, "pages, admin and tests")
    canvas.setStrokeColor(ELECTRIC)
    canvas.setLineWidth(1.4)
    canvas.line(24 * mm, H - 88 * mm, 95 * mm, H - 88 * mm)
    canvas.setFillColor(colors.HexColor("#C5D7E0"))
    canvas.setFont("Body", 11)
    t = canvas.beginText(24 * mm, H - 106 * mm)
    t.setLeading(16)
    for line in [
        "One document for NEVIE-GLOBAL. How the UK platform is hosted,",
        "how GitHub becomes a Railway deploy, what each page does,",
        "what the staff console contains, and what has been tested.",
        "This file contains no passwords, tokens, Stripe keys or the",
        "secret console path. Those stay in Railway and GitHub Secrets.",
    ]:
        t.textLine(line)
    canvas.drawText(t)
    y = 88 * mm
    for label, value in [
        ("Owner", "NEVIE-GLOBAL  (GitHub repo currently ibrahimAltaf/nevie-global-uk)"),
        ("Official site", OFFICIAL),
        ("Staging", STAGING),
        ("Production", PROD),
        ("Date", DATE),
    ]:
        canvas.setFillColor(GOLD)
        canvas.setFont("Body", 8)
        canvas.drawString(24 * mm, y + 11, label.upper())
        canvas.setFillColor(WHITE)
        canvas.setFont("Body", 10)
        canvas.drawString(24 * mm, y, value)
        y -= 16 * mm
    canvas.setFillColor(MUTED)
    canvas.setFont("Body", 8)
    canvas.drawString(24 * mm, 16 * mm, "Confidential  |  NEVIE-GLOBAL UK  |  no secrets in this file")
    canvas.restoreState()


def on_body(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BLACK)
    canvas.rect(0, H - 13 * mm, W, 13 * mm, fill=1, stroke=0)
    canvas.setFillColor(ELECTRIC)
    canvas.rect(0, H - 13 * mm, W, 1.1, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Body", 8)
    canvas.drawString(18 * mm, H - 8 * mm, "NEVIE-GLOBAL  |  UNITED KINGDOM")
    canvas.setFillColor(GOLD)
    canvas.drawRightString(W - 18 * mm, H - 8 * mm, "Complete handover")
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, W, 12 * mm, fill=1, stroke=0)
    canvas.setFillColor(ELECTRIC)
    canvas.rect(0, 12 * mm, W, 0.8, fill=1, stroke=0)
    canvas.setFillColor(MUTED)
    canvas.setFont("Body", 8)
    canvas.drawString(18 * mm, 5 * mm, DATE)
    canvas.drawRightString(W - 18 * mm, 5 * mm, str(doc.page))
    canvas.restoreState()


def styles():
    k = ParagraphStyle("k", fontName="BodyBold", fontSize=8.5, leading=12, textColor=INK)
    v = ParagraphStyle("v", fontName="Body", fontSize=8.5, leading=12, textColor=INK)
    return {
        "h1": ParagraphStyle("h1", fontName="BodyBold", fontSize=15, leading=19, textColor=INK, spaceBefore=2, spaceAfter=8),
        "h2": ParagraphStyle("h2", fontName="BodyBold", fontSize=11.5, leading=15, textColor=INK, spaceBefore=8, spaceAfter=5),
        "body": ParagraphStyle("body", fontName="Body", fontSize=10, leading=14, textColor=INK, alignment=TA_JUSTIFY, spaceAfter=7),
        "note": ParagraphStyle("note", fontName="BodyItalic", fontSize=9.5, leading=13, textColor=MUTED, spaceAfter=8),
        "li": ParagraphStyle("li", fontName="Body", fontSize=10, leading=14, textColor=INK, alignment=TA_LEFT),
        "mono": ParagraphStyle(
            "mono", fontName="Body", fontSize=9, leading=12.5, textColor=INK,
            backColor=PAPER, leftIndent=3, rightIndent=3, spaceBefore=1, spaceAfter=6,
        ),
        "k": k,
        "v": v,
    }


def bullets(items, s):
    return ListFlowable(
        [ListItem(Paragraph(item, s["li"]), leftIndent=10, bulletColor=ELECTRIC) for item in items],
        bulletType="bullet",
        start="disc",
        leftIndent=12,
        bulletFontName="Body",
        bulletFontSize=9,
        spaceAfter=7,
    )


def kv(rows, s, w0=46, w1=128):
    data = [[Paragraph(a, s["k"]), Paragraph(b, s["v"])] for a, b in rows]
    table = Table(data, colWidths=[w0 * mm, w1 * mm], repeatRows=0)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), PAPER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("BOX", (0, 0), (-1, -1), 0.35, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, LINE),
            ]
        )
    )
    return table


def grid(headers, rows, s, widths):
    head = [Paragraph(h, s["k"]) for h in headers]
    body = [[Paragraph(c, s["v"]) for c in row] for row in rows]
    table = Table([head] + body, colWidths=[w * mm for w in widths], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BLACK),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("BACKGROUND", (0, 1), (-1, -1), WHITE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 3.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
                ("BOX", (0, 0), (-1, -1), 0.35, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, LINE),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PAPER]),
            ]
        )
    )
    for i, cell in enumerate(head):
        cell.textColor = WHITE
    # Header paragraphs need white text
    head_style = ParagraphStyle("hh", fontName="BodyBold", fontSize=8.5, leading=12, textColor=WHITE)
    table._cellvalues[0] = [Paragraph(h, head_style) for h in headers]
    return table


def build():
    s = styles()
    story = [NextPageTemplate("Body"), PageBreak()]

    story.append(Paragraph("1. Document control", s["h1"]))
    story.append(
        Paragraph(
            "This handover belongs to NEVIE-GLOBAL. It describes the UK commercial platform "
            "(English, prices in GBP) that sits alongside the official French site "
            f"{OFFICIAL}. Unpublished facts are marked To Be Confirmed. Nothing in this PDF is a password.",
            s["body"],
        )
    )
    story.append(
        kv(
            [
                ("Document", "NEVIE-GLOBAL UK complete platform handover"),
                ("Date", DATE),
                ("Audience", "NEVIE-GLOBAL owners, operators and one invited GitHub collaborator"),
                ("Intended owner", "NEVIE-GLOBAL"),
                ("GitHub today", "Private repo ibrahimAltaf/nevie-global-uk. Transfer to a NEVIE-GLOBAL GitHub organisation was requested; the GitHub API on this date still lists ibrahimAltaf as owner. Confirm the organisation transfer in GitHub Settings if it is not yet complete."),
                ("Railway project", "NEVIE-GLOBAL (renamed from nevie-global-uk)"),
                ("Railway staging", "Environment name: staging. URL: https://web-staging-9d06.up.railway.app"),
                ("Railway production", "Environment name: production. URL: https://web-production-4652eb.up.railway.app"),
                ("Hosting", "Railway only. Do not publish or share any other host."),
                ("Local folder", r"C:\Users\muham\Desktop\navviglobaluk"),
                ("Package name", "nevie-global-uk"),
            ],
            s,
        )
    )
    story.append(Spacer(1, 3 * mm))
    story.append(
        Paragraph(
            "GitHub issue comments and review comments on this repository were empty on this date. "
            "Source files do not mention third-party assistant names. Commit message trailers that named a coding assistant must stay out of future commits.",
            s["note"],
        )
    )

    story.append(Paragraph("2. What this platform is", s["h1"]))
    story.append(
        Paragraph(
            "A Next.js 15 App Router site with React 19, Prisma, Postgres, Redis, Better Auth, Stripe Checkout in GBP, and SMTP. "
            "Public visitors never see the staff console. Customers use /dashboard only. Staff and above use a secret console path stored as ADMIN_PATH in Railway. "
            "The guessable URL /admin returns 404. Roles are CUSTOMER, STAFF, MANAGER, ADMIN and SUPER_ADMIN, enforced on the server.",
            s["body"],
        )
    )
    story.append(
        kv(
            [
                ("Stack", "Next.js 15, React 19, Prisma, Postgres 16, Redis, Better Auth, Stripe, nodemailer"),
                ("Node", "22 on Railway (NIXPACKS_NODE_VERSION)"),
                ("Region", "Railway EU West"),
                ("Currency", "GBP on this platform. Official site is EUR. No invented conversion."),
                ("Locale", "en-GB. Official site is French."),
                ("Colours", "Blue #00A9FF, gold #FFD47A, black, white only"),
                ("Contact", "contact@nevie-global.com (published on the official site)"),
                ("Socials published", "Instagram, X, LinkedIn only. Other channels To Be Confirmed."),
            ],
            s,
        )
    )

    story.append(Paragraph("3. Where the code lives and how it runs", s["h1"]))
    story.append(Paragraph("3.1 Local machine", s["h2"]))
    story.append(bullets([
        "Install Node.js 22 or 24 and npm.",
        "Copy .env.example to .env.local. Fill DATABASE_URL and REDIS_URL for local Postgres and Redis. Never commit .env files.",
        "npm install",
        "npx prisma db push && npm run db:seed",
        "npm run dev  (http://127.0.0.1:3100)",
        "npm run lint / typecheck / test / build before opening a pull request.",
    ], s))
    story.append(Paragraph("3.2 GitHub", s["h2"]))
    story.append(
        Paragraph(
            f"Canonical repository: {REPO} (private). Collaborators must be invited. A fork from an outside account will not see this repo until they are invited.",
            s["body"],
        )
    )
    story.append(
        kv(
            [
                ("Branch main", "Staging. Every merge here deploys the staging URL via the Railway GitHub App."),
                ("Branch production", "Live production. Owner merges main into production, then pushes. Railway production watches this branch only."),
                ("feature/*", "Collaborator work. Open a pull request into main. Do not push production."),
                ("ci.yml", "GitHub Actions: Prisma test database, lint, typecheck, tests, build, npm audit. Runs on main, production and pull requests."),
                ("deploy-staging.yml", "Optional CLI backup on push to main. Needs GitHub secret RAILWAY_TOKEN_STAGING."),
                ("deploy-production.yml", "Optional CLI backup on push to production. Needs GitHub secret RAILWAY_TOKEN_PRODUCTION."),
            ],
            s,
        )
    )
    story.append(Spacer(1, 2 * mm))
    story.append(
        Paragraph(
            "Primary deploy path: Railway is connected to the GitHub repo. A second GitHub user does not need a Railway login. "
            "Push or merge the correct branch. The GitHub Actions railway up jobs are a backup. They stay red until the owner stores project tokens from Railway Project Settings, Tokens, into GitHub Actions secrets. Do not paste those tokens into chat or this PDF.",
            s["body"],
        )
    )
    story.append(Paragraph("Owner promotion to production", s["h2"]))
    story.append(Paragraph("git checkout production", s["mono"]))
    story.append(Paragraph("git pull origin production", s["mono"]))
    story.append(Paragraph("git merge main", s["mono"]))
    story.append(Paragraph("git push origin production", s["mono"]))

    story.append(Paragraph("4. Environments and where each setting lives", s["h1"]))
    story.append(
        Paragraph(
            "There are two Railway environments in one project. Each has its own Postgres and Redis. Web, Redis and Postgres run in EU West. "
            "Variable names are listed. Values for secrets are not.",
            s["body"],
        )
    )
    story.append(
        grid(
            ["Place", "What it is", "Who edits it"],
            [
                ["Local .env.local", "Developer machine only", "Each developer, never committed"],
                [".env.example", "Names and safe defaults in git", "Engineers via pull request"],
                ["GitHub Actions secrets", "RAILWAY_TOKEN_STAGING and RAILWAY_TOKEN_PRODUCTION", "Repo admin only"],
                ["Railway staging", "Environment name: staging. Web + Postgres + Redis. https://web-staging-9d06.up.railway.app", "Owner in Railway dashboard"],
                ["Railway production", "Environment name: production. Live UK site, separate database. https://web-production-4652eb.up.railway.app", "Owner in Railway dashboard"],
                ["Admin Settings", "SMTP and Stripe can be saved encrypted in the database", "STAFF+ on the secret console"],
            ],
            s,
            [38, 78, 58],
        )
    )
    story.append(Paragraph("Environment variable names (no values)", s["h2"]))
    story.append(
        grid(
            ["Name", "Purpose", "Notes"],
            [
                ["DATABASE_URL", "Postgres connection", "Railway reference to the Postgres service"],
                ["REDIS_URL", "Rate limits and cache", "Railway reference to Redis"],
                ["BETTER_AUTH_SECRET", "Session signing", "32+ characters, Railway only"],
                ["BETTER_AUTH_URL", "Auth base URL", "Must match the public site URL of that environment"],
                ["NEXT_PUBLIC_SITE_URL", "Canonical site URL", "Baked into the client at build time"],
                ["ADMIN_PATH", "Secret staff console segment", "Not /admin. Never publish this path."],
                ["ADMIN_EMAIL / ADMIN_PASSWORD", "Bootstrap staff account on start", "Rotate after first login if needed"],
                ["LEGAL_CONTACT_EMAIL", "Legal pages and ops mailbox", "Set to contact@nevie-global.com"],
                ["EMAIL_FROM", "SMTP From header", "NEVIE-GLOBAL UK &lt;contact@nevie-global.com&gt;"],
                ["SMTP_*", "Mail server", "Or set from Admin Settings"],
                ["STRIPE_SECRET_KEY", "Checkout", "Test keys on both URLs as of this date"],
                ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "Stripe.js", "Must match the secret key mode"],
                ["STRIPE_WEBHOOK_SECRET", "Webhook verify", "Set when Stripe webhooks are connected"],
                ["SETTINGS_ENCRYPTION_KEY", "Encrypts Stripe/SMTP saved in admin", "Railway only"],
                ["VAT_RATE_BPS / SHIPPING_PENCE", "Tax and shipping", "VAT 2000 = 20 percent"],
                ["LEGAL_COMPANY_*", "UK company, VAT, office, ICO", "Empty = To Be Confirmed on the site"],
                ["TURNSTILE_* / SENTRY_DSN", "Optional abuse and error tracking", "Optional"],
            ],
            s,
            [52, 58, 64],
        )
    )
    story.append(Spacer(1, 2 * mm))
    story.append(
        Paragraph(
            "As of this date LEGAL_CONTACT_EMAIL and EMAIL_FROM on staging and production use contact@nevie-global.com. "
            "Stripe on both public Railway URLs is still test mode. Live card charges need live keys in the production environment only, stored in Railway, never in git. Custom domains are not attached yet.",
            s["note"],
        )
    )

    story.append(Paragraph("5. How a GitHub push becomes a live site", s["h1"]))
    story.append(bullets([
        "Developer opens a pull request into main.",
        "ci.yml starts a temporary Postgres, installs packages, pushes the schema, seeds, lints, typechecks, tests and builds.",
        "Owner merges to main.",
        "Railway GitHub App sees branch main and builds the staging web service. Start command: prisma db push, seed, content, create-admin, then next start.",
        "Health check path /api/health. Restart on failure, three retries.",
        "When staging is accepted, owner merges main into production and pushes. Railway production watches the production branch only, so a main push no longer ships live by itself.",
        "Customers hit the production Railway URL until a custom domain is added.",
    ], s))

    story.append(Paragraph("6. Public pages (what each one does)", s["h1"]))
    story.append(
        Paragraph(
            "Paths below are the same on staging and production. Prefix with the environment URL from section 14. "
            "Service pages explain NEVIE capabilities. They are not fake case-study claims.",
            s["body"],
        )
    )
    story.append(
        grid(
            ["Path", "What the visitor gets"],
            [
                ["/", "Home. Founder access and connected jewellery from the live catalogue. No invented testimonials."],
                ["/about", "Founder story published on nevie-global.com (Emmanuel and Elisa)."],
                ["/contact", "Contact form: name, email, optional phone, interest, message, consent. Rate limited."],
                ["/marketplace and /products", "Catalogue of eight SKUs in GBP. Wishlist on device plus account wishlist when signed in."],
                ["/marketplace/[id]", "Product detail. Add to bag. Stripe checkout from cart."],
                ["/marketplace/category/[category]", "Founder access or connected jewellery."],
                ["/cart and /checkout", "Bag, address, Stripe Checkout. Success and cancel return pages."],
                ["/academy and /academy/[id]", "Courses and lessons. Device progress until a verified LMS is confirmed."],
                ["/blog, /resources, /blog/[id]", "Editorial articles from the CMS when published."],
                ["/case-studies and /case-studies/[slug]", "Approved case studies from the CMS. Empty until content exists."],
                ["/portfolio and /projects", "Delivery / project showcase."],
                ["/pricing", "Conversation starters. Service starting prices remain To Be Confirmed."],
                ["/services, /solutions, /industries", "Overview of how NEVIE works with organisations."],
                ["/partners and /investors", "Relationship pages. No unpublished metrics."],
                ["/support and /faq", "Help and published questions."],
                ["/documentation", "Technical documentation landing page."],
                ["/privacy /cookies /terms /legal /gdpr /shipping /returns /refunds", "UK legal suite. Company number, VAT and office stay To Be Confirmed until published. Contact email from LEGAL_CONTACT_EMAIL."],
            ],
            s,
            [58, 116],
        )
    )
    story.append(Paragraph("Service capability pages", s["h2"]))
    story.append(
        Paragraph(
            "/ai, /ai-agents, /voice-ai, /private-llm, /automation, /crm, /erp, /saas, /api-development, "
            "/software-development, /mobile-app-development, /web-development, /cloud, /cyber-security, /consulting, /blockchain. "
            "Each explains the offer. Quoted fees stay To Be Confirmed.",
            s["body"],
        )
    )
    story.append(Paragraph("Machine and auth URLs", s["h2"]))
    story.append(
        Paragraph(
            "/robots.txt, /sitemap.xml, /sign-in, /sign-up, /forgot-password, /reset-password. "
            "POST /api/contact and /api/quote. /api/health for Railway. Unknown paths return the custom 404. /admin is 404 on purpose.",
            s["body"],
        )
    )

    story.append(Paragraph("7. Catalogue (GBP)", s["h1"]))
    story.append(
        grid(
            ["SKU", "Name", "Category", "Price"],
            [
                ["founder-card", "Carte Fondateur", "Founder access", "1.00 (homepage published offer; contact form on FR site also lists 129. Confirm with operations.)"],
                ["founder-box", "Coffret Fondateur", "Founder access", "189.00 (compare-at 279.00 as on the official homepage)"],
                ["bague-aura", "Bague Aura", "Connected jewellery", "149.00"],
                ["bague-signet", "Bague Signet", "Connected jewellery", "179.00"],
                ["bague-origin", "Bague Origin", "Connected jewellery", "229.00"],
                ["bracelet-link", "Bracelet Link", "Connected jewellery", "129.00"],
                ["bracelet-core", "Bracelet Core", "Connected jewellery", "169.00"],
                ["bracelet-weave", "Bracelet Weave", "Connected jewellery", "229.00"],
            ],
            s,
            [32, 38, 40, 64],
        )
    )
    story.append(Spacer(1, 2 * mm))
    story.append(
        Paragraph(
            "NEVIE Smart Glasses and SERIES robots are Coming Soon / R&amp;D on the official site. They are not buyable SKUs here. "
            "Jewellery photos come from the official Hostinger CDN. Dedicated Carte and Coffret photography is To Be Confirmed.",
            s["note"],
        )
    )

    story.append(Paragraph("8. Customer account (not admin)", s["h1"]))
    story.append(
        Paragraph(
            "Signed-in customers stay on /dashboard. They cannot open the staff console. Sections:",
            s["body"],
        )
    )
    story.append(
        grid(
            ["Path", "Feature"],
            [
                ["/dashboard", "Home: orders, saved items, shortcuts"],
                ["/dashboard/orders", "Order history, tracking; invoice at /dashboard/orders/[id]/invoice"],
                ["/dashboard/wishlist", "Saved products"],
                ["/dashboard/quotes", "Submitted quotations"],
                ["/dashboard/notifications", "Order and quote updates"],
                ["/dashboard/support", "Help requests"],
                ["/dashboard/downloads", "Invoices and documents"],
                ["/dashboard/profile", "Details, addresses, security"],
                ["/dashboard/settings", "Theme, language, privacy"],
                ["/dashboard/projects/[id]", "Customer view of a delivery project when assigned"],
            ],
            s,
            [58, 116],
        )
    )

    story.append(Paragraph("9. Staff console (admin) A to Z", s["h1"]))
    story.append(
        Paragraph(
            "STAFF, MANAGER, ADMIN and SUPER_ADMIN only. The URL is / plus ADMIN_PATH from Railway, not /admin. "
            "Do not write that path in tickets, WhatsApp or this PDF. Public users must never see this chrome. Backend checks the role on every console request.",
            s["body"],
        )
    )
    story.append(
        grid(
            ["Section", "What staff can do"],
            [
                ["Home / overview", "Live activity and operational snapshot from Postgres, not invented KPIs"],
                ["Orders (finance)", "Fulfilment, refunds, invoices"],
                ["Products (marketplace)", "Catalogue, inventory, coupons"],
                ["Customers (users)", "Accounts, roles, suspend, audit"],
                ["CRM", "Leads, pipeline, quotes from contact and quote forms"],
                ["Analytics", "Revenue, orders, conversion from real records"],
                ["CMS", "Pages, articles, case studies, media"],
                ["Academy", "Courses and completions"],
                ["Projects", "Delivery board and files"],
                ["Settings", "Roles, Stripe test/live keys, SMTP, published contact facts, security. Secrets stored encrypted."],
            ],
            s,
            [48, 126],
        )
    )
    story.append(Spacer(1, 2 * mm))
    story.append(
        Paragraph(
            "Two-factor setup exists for staff. Optional Cloudflare Turnstile keys may be set. "
            "The console must remain hidden: no public nav link, no sitemap entry, /admin always 404.",
            s["note"],
        )
    )

    story.append(Paragraph("10. Features tested (honest status)", s["h1"]))
    story.append(
        Paragraph(
            "This table is evidence, not a marketing score. Failed or untested items stay failed or untested.",
            s["body"],
        )
    )
    story.append(
        grid(
            ["Area", "Status on 5 October 2026"],
            [
                ["Staging home, catalogue, legal, contact chrome", "Live HTTP 200. Legal shows contact@nevie-global.com."],
                ["Production home, legal, health", "Live. /api/health returns ok. Legal shows contact@nevie-global.com."],
                ["/admin on public URLs", "404 as designed."],
                ["npm test (contact schema, newsletter consent, catalogue IDs, GBP money, site URL)", "Unit tests in tests/*.test.ts"],
                ["Playwright e2e", "Only tests/e2e/home.spec.ts (home body visible). Not a full journey suite."],
                ["GitHub Actions ci.yml", "Last recorded run on 28 September 2026 failed at eslint (require() imports). Fix before treating CI as a release gate."],
                ["GitHub Actions deploy-*.yml", "Unauthorized until RAILWAY_TOKEN_STAGING / PRODUCTION exist. Railway GitHub App is the live pipeline."],
                ["Railway Git deploy staging from main", "SUCCESS on this date after branch split."],
                ["Railway Git deploy production from production", "SUCCESS on this date."],
                ["Postgres + seed on boot", "Used in startCommand. Real database, not placeholders."],
                ["Stripe Checkout", "Wired. Both Railway environments still use test keys. No live-card proof in this document."],
                ["SMTP delivery", "Configurable. Inbox delivery not independently certified here."],
                ["Staff console CRUD", "Built against live Postgres. Not re-run click-by-click in this document pass."],
                ["Customer dashboard", "Built and role-gated. Full signed-in journey not re-certified in this pass."],
                ["Lighthouse / WCAG audit", "Not claimed."],
                ["Custom domain + UK Companies House fields", "Not attached / To Be Confirmed."],
            ],
            s,
            [58, 116],
        )
    )

    story.append(Paragraph("11. Collaborator rules", s["h1"]))
    story.append(bullets([
        "Owner invites the person: GitHub repo Settings, Collaborators, Add people. Write access for pull requests. Maintain only if they must merge to main. Admin only if they must manage secrets.",
        "They accept the email while signed into GitHub, then: git clone " + REPO + ".git",
        "Branch from main, never from secrets. Open a pull request. Wait for ci.yml.",
        "Do not commit .env, Stripe keys, SMTP passwords, ADMIN_PATH, or customer exports.",
        "Do not invent phone numbers, UK company numbers, VAT, or unpublished social URLs. Mark To Be Confirmed.",
        "Do not change the official logo unless a new official file is supplied. Keep blue, gold, black, white.",
        "Do not share GitHub or Railway passwords. Tokens stay in GitHub Secrets and Railway.",
        "Production merges are an owner step after staging looks correct.",
    ], s))

    story.append(Paragraph("12. To Be Confirmed", s["h1"]))
    story.append(bullets([
        "GitHub organisation transfer to NEVIE-GLOBAL (API still showed ibrahimAltaf as owner on this date).",
        "UK company number, VAT, ICO, registered office.",
        "Phone, WhatsApp, UK postal address, opening hours.",
        "Facebook, TikTok, YouTube, Pinterest, Telegram, Discord profile URLs.",
        "Carte Fondateur 1 versus 129 on the French contact form.",
        "Live Stripe keys and webhook endpoint on production.",
        "Custom domain on Railway web.",
        "Dedicated founder-product photography.",
        "CI lint require() errors.",
        "GitHub Actions Railway tokens (dashboard-created project tokens).",
    ], s))

    story.append(Paragraph("13. What this document never includes", s["h1"]))
    story.append(
        Paragraph(
            "Passwords, ADMIN_PATH, Stripe secret keys, database URLs, Redis passwords, Better Auth secrets, SMTP passwords, Railway tokens, GitHub personal access tokens. "
            "If any of those appear in chat or git, rotate them in Railway and Stripe at once.",
            s["body"],
        )
    )

    story.append(PageBreak())
    story.append(Paragraph("14. Link directory (staging then production)", s["h1"]))
    story.append(
        Paragraph(
            "Use these lists at the end of the handover. Same paths on both hosts. Staff console path is omitted.",
            s["body"],
        )
    )
    story.append(Paragraph("Staging (main branch)", s["h2"]))
    story.append(Paragraph(STAGING, s["mono"]))
    staging_paths = [
        "/", "/about", "/contact", "/marketplace", "/products", "/cart", "/checkout",
        "/academy", "/blog", "/resources", "/case-studies", "/portfolio", "/projects",
        "/pricing", "/services", "/solutions", "/industries", "/partners", "/investors",
        "/support", "/faq", "/documentation", "/privacy", "/cookies", "/terms", "/legal",
        "/gdpr", "/shipping", "/returns", "/refunds",
        "/ai", "/ai-agents", "/voice-ai", "/private-llm", "/automation", "/crm", "/erp", "/saas",
        "/api-development", "/software-development", "/mobile-app-development", "/web-development",
        "/cloud", "/cyber-security", "/consulting", "/blockchain",
        "/sign-in", "/sign-up", "/forgot-password", "/dashboard",
        "/marketplace/founder-card", "/marketplace/founder-box",
        "/marketplace/bague-aura", "/marketplace/bague-signet", "/marketplace/bague-origin",
        "/marketplace/bracelet-link", "/marketplace/bracelet-core", "/marketplace/bracelet-weave",
        "/api/health", "/robots.txt", "/sitemap.xml",
    ]
    story.append(grid(["Staging URL"], [[STAGING + p] for p in staging_paths], s, [174]))
    story.append(Paragraph("Production (production branch)", s["h2"]))
    story.append(Paragraph(PROD, s["mono"]))
    story.append(grid(["Production URL"], [[PROD + p] for p in staging_paths], s, [174]))
    story.append(Paragraph("Other links", s["h2"]))
    story.append(
        kv(
            [
                ("Official FR site", OFFICIAL),
                ("Official contact", OFFICIAL + "/contact/"),
                ("Official about", OFFICIAL + "/founder-about/"),
                ("Official legal", OFFICIAL + "/mentions-legales/"),
                ("Official privacy", OFFICIAL + "/politique-de-confidentialite/"),
                ("GitHub repo", REPO),
                ("Instagram", "https://www.instagram.com/nevie.global"),
                ("X", "https://x.com/GlobalNevi52586"),
                ("LinkedIn", "https://www.linkedin.com/in/nevie-global-09361638b/"),
            ],
            s,
        )
    )
    story.append(Spacer(1, 4 * mm))
    story.append(
        Paragraph(
            "End of handover. NEVIE-GLOBAL UK. " + DATE + ". No secrets. Confirm GitHub organisation ownership and live Stripe before public launch.",
            s["note"],
        )
    )

    doc = BaseDocTemplate(
        str(OUT),
        pagesize=A4,
        title="NEVIE-GLOBAL UK complete platform handover",
        author="NEVIE-GLOBAL",
        creator="NEVIE-GLOBAL UK",
    )
    cover_frame = Frame(0, 0, W, H, id="cover", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    body_frame = Frame(18 * mm, 16 * mm, W - 36 * mm, H - 32 * mm, id="body")
    doc.addPageTemplates(
        [
            PageTemplate(id="Cover", frames=[cover_frame], onPage=on_cover),
            PageTemplate(id="Body", frames=[body_frame], onPage=on_body),
        ]
    )
    doc.build(story)
    DESKTOP.write_bytes(OUT.read_bytes())
    print(OUT)
    print(DESKTOP)
    print("pages-written")


if __name__ == "__main__":
    build()
