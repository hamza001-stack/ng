"""NEVIE-GLOBAL UK — GitHub collaborator CI/CD guide. No secrets in this file."""
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "NEVIE-GLOBAL-UK-GitHub-CICD-Guide.pdf"
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


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BLACK)
    canvas.rect(0, H - 14 * mm, W, 14 * mm, fill=1, stroke=0)
    canvas.setFillColor(ELECTRIC)
    canvas.rect(0, H - 14 * mm, W, 1.2, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Body", 9)
    canvas.drawString(18 * mm, H - 8.6 * mm, "NEVIE-GLOBAL  ·  UNITED KINGDOM")
    canvas.setFillColor(GOLD)
    canvas.setFont("Body", 9)
    canvas.drawRightString(W - 18 * mm, H - 8.6 * mm, "GitHub CI/CD collaborator guide")
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, W, 12 * mm, fill=1, stroke=0)
    canvas.setFillColor(ELECTRIC)
    canvas.rect(0, 12 * mm, W, 1, fill=1, stroke=0)
    canvas.setFillColor(MUTED)
    canvas.setFont("Body", 8)
    canvas.drawString(18 * mm, 5 * mm, DATE)
    canvas.drawRightString(W - 18 * mm, 5 * mm, str(doc.page))
    canvas.restoreState()


def cover_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BLACK)
    canvas.rect(0, 0, W, H, fill=1, stroke=0)
    canvas.setFillColor(ELECTRIC)
    canvas.rect(0, 0, 6, H, fill=1, stroke=0)
    canvas.setFillColor(GOLD)
    canvas.setFont("Body", 10)
    canvas.drawString(22 * mm, H - 28 * mm, "NEVIE-GLOBAL  /  UK PLATFORM")
    canvas.setFillColor(WHITE)
    canvas.setFont("Body", 26)
    canvas.drawString(22 * mm, H - 52 * mm, "How a second GitHub user")
    canvas.setFillColor(ELECTRIC)
    canvas.setFont("BodyBold", 28)
    canvas.drawString(22 * mm, H - 68 * mm, "connects through CI/CD")
    canvas.setStrokeColor(ELECTRIC)
    canvas.setLineWidth(1.2)
    canvas.line(22 * mm, H - 78 * mm, 92 * mm, H - 78 * mm)
    canvas.setFillColor(colors.HexColor("#C5D7E0"))
    canvas.setFont("Body", 11)
    text = canvas.beginText(22 * mm, H - 96 * mm)
    text.setLeading(16)
    for line in [
        "This note is for the repository owner and for one invited collaborator.",
        "It explains GitHub access, the staging and production branches, and",
        "how a push becomes a Railway deployment. It does not contain",
        "passwords, tokens, admin paths, or Stripe keys. Never paste secrets",
        "into chat, tickets, or this PDF.",
    ]:
        text.textLine(line)
    canvas.drawText(text)
    y = 78 * mm
    for label, value in [
        ("Repository", "github.com/ibrahimAltaf/nevie-global-uk"),
        ("Staging", "push to main  -  web-staging-9d06.up.railway.app"),
        ("Production", "push to production  -  web-production-4652eb.up.railway.app"),
        ("Date", DATE),
    ]:
        canvas.setFillColor(GOLD)
        canvas.setFont("Body", 8)
        canvas.drawString(22 * mm, y + 12, label.upper())
        canvas.setFillColor(WHITE)
        canvas.setFont("Body", 11)
        canvas.drawString(22 * mm, y, value)
        y -= 18 * mm
    canvas.restoreState()


def styles():
    return {
        "h1": ParagraphStyle(
            "h1",
            fontName="BodyBold",
            fontSize=16,
            leading=20,
            textColor=INK,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "h2",
            fontName="BodyBold",
            fontSize=12.5,
            leading=16,
            textColor=INK,
            spaceBefore=10,
            spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "body",
            fontName="Body",
            fontSize=10.5,
            leading=15,
            textColor=INK,
            alignment=TA_JUSTIFY,
            spaceAfter=8,
        ),
        "note": ParagraphStyle(
            "note",
            fontName="BodyItalic",
            fontSize=10,
            leading=14,
            textColor=MUTED,
            spaceAfter=8,
        ),
        "li": ParagraphStyle(
            "li",
            fontName="Body",
            fontSize=10.5,
            leading=15,
            textColor=INK,
            alignment=TA_LEFT,
        ),
        "mono": ParagraphStyle(
            "mono",
            fontName="Body",
            fontSize=9.5,
            leading=13,
            textColor=INK,
            backColor=PAPER,
            leftIndent=4,
            rightIndent=4,
            spaceBefore=2,
            spaceAfter=8,
        ),
    }


def bullets(items, s):
    return ListFlowable(
        [ListItem(Paragraph(item, s["li"]), leftIndent=12, bulletColor=ELECTRIC) for item in items],
        bulletType="bullet",
        start="•",
        leftIndent=14,
        bulletFontName="Body",
        bulletFontSize=10,
        spaceAfter=8,
    )


def kv_table(rows):
    data = [[Paragraph(f"<b>{k}</b>", ParagraphStyle("k", fontName="BodyBold", fontSize=9.5, leading=13, textColor=INK)),
             Paragraph(v, ParagraphStyle("v", fontName="Body", fontSize=9.5, leading=13, textColor=INK))]
            for k, v in rows]
    table = Table(data, colWidths=[48 * mm, 124 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), PAPER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("BOX", (0, 0), (-1, -1), 0.4, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.3, LINE),
            ]
        )
    )
    return table


def build():
    s = styles()
    story = [Spacer(1, 8 * mm)]

    story.append(Paragraph("1. Who does what", s["h1"]))
    story.append(
        Paragraph(
            "The repository is private. A second person cannot see it until the owner invites them on GitHub. "
            "The invited person does not need a Railway login for day-to-day work. Pushing the right GitHub branch is enough, because Railway is already connected to the GitHub repo.",
            s["body"],
        )
    )
    story.append(kv_table([
        ("Owner (GitHub)", "ibrahimAltaf — invites people, stores GitHub Actions secrets, merges to production."),
        ("Collaborator", "Clones the private repo, opens pull requests into main, never commits secrets."),
        ("Railway project", "NEVIE-GLOBAL. Environments: staging and production."),
        ("GitHub Actions", "ci.yml verifies every push. deploy-staging.yml and deploy-production.yml are CLI backups."),
    ]))
    story.append(Spacer(1, 4 * mm))

    story.append(Paragraph("2. Owner: invite the second GitHub user", s["h1"]))
    story.append(bullets([
        "Open github.com/ibrahimAltaf/nevie-global-uk.",
        "Settings, then Collaborators (or Collaborators and teams), then Add people.",
        "Enter their GitHub username or email. Send the invite.",
        "Give Write access if they will push feature branches and open pull requests. Give Maintain only if they must merge to main. Do not give Admin unless they must manage secrets.",
        "Ask them to accept the email invite while signed into GitHub.",
        "Do not share your GitHub password, Railway password, or any token in WhatsApp, email body, or this PDF.",
    ], s))
    story.append(
        Paragraph(
            "If the repo stays private, a fork from an outside account will not work unless they are invited first. Invitation is the correct path.",
            s["note"],
        )
    )

    story.append(Paragraph("3. Collaborator: clone and work", s["h1"]))
    story.append(Paragraph("After accepting the invite:", s["body"]))
    story.append(Paragraph("git clone https://github.com/ibrahimAltaf/nevie-global-uk.git", s["mono"]))
    story.append(Paragraph("cd nevie-global-uk", s["mono"]))
    story.append(Paragraph("git checkout main", s["mono"]))
    story.append(Paragraph("git checkout -b feature/short-name", s["mono"]))
    story.append(bullets([
        "Copy .env.example to a local .env. Fill local values only. Never commit .env.",
        "Use real Postgres locally. Do not add placeholder testimonials, fake KPIs, or unpublished phone numbers.",
        "Keep the official NEVIE colours (blue, gold, black, white). Do not change the logo unless a new official file is supplied.",
        "Open a pull request into main. Wait for GitHub Actions ci.yml (lint, types, tests, build).",
        "After merge to main, Railway deploys staging automatically.",
        "Do not push straight to production. Production is a protected promotion step for the owner.",
    ], s))

    story.append(Paragraph("4. Branch model (this is the CI/CD)", s["h1"]))
    story.append(kv_table([
        ("main", "Staging. Every merge here deploys the staging URL."),
        ("production", "Live production. Promote by merging main into production (or a PR targeting production)."),
        ("feature/*", "Collaborator branches. Open a PR to main. Do not deploy these to production."),
    ]))
    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph("Owner promotion to production (no passwords):", s["body"]))
    story.append(Paragraph("git checkout production", s["mono"]))
    story.append(Paragraph("git pull origin production", s["mono"]))
    story.append(Paragraph("git merge main", s["mono"]))
    story.append(Paragraph("git push origin production", s["mono"]))
    story.append(
        Paragraph(
            "That push is the production release. Railway watches the production branch for the production environment. "
            "Do not merge untested work into production.",
            s["body"],
        )
    )

    story.append(Paragraph("5. What actually deploys today", s["h1"]))
    story.append(
        Paragraph(
            "Railway is linked to ibrahimAltaf/nevie-global-uk. That GitHub connection is the live pipeline. "
            "A second GitHub user therefore “connects to CI/CD” by being a collaborator and pushing or merging the right branch. They do not paste Railway tokens into their laptop.",
            s["body"],
        )
    )
    story.append(kv_table([
        ("Staging URL", "https://web-staging-9d06.up.railway.app"),
        ("Production URL", "https://web-production-4652eb.up.railway.app"),
        ("Staging watch branch", "main"),
        ("Production watch branch", "production"),
        ("GitHub Actions ci.yml", "Runs on push to main or production, and on pull requests."),
        ("deploy-staging.yml", "Optional CLI deploy on push to main. Needs GitHub secret RAILWAY_TOKEN_STAGING."),
        ("deploy-production.yml", "Optional CLI deploy on push to production. Needs GitHub secret RAILWAY_TOKEN_PRODUCTION."),
    ]))
    story.append(Spacer(1, 3 * mm))
    story.append(
        Paragraph(
            "GitHub Actions CLI deploy jobs used to fail because the repository had an empty RAILWAY_TOKEN. "
            "The Railway GitHub App still shipped the site. Keep the GitHub App as the primary deploy. Treat the two deploy-*.yml workflows as a backup only after the owner stores project tokens.",
            s["note"],
        )
    )

    story.append(PageBreak())
    story.append(Paragraph("6. Owner only: GitHub Actions backup tokens", s["h1"]))
    story.append(
        Paragraph(
            "Do this on your own computer while signed into Railway and GitHub. Do not send the token to the collaborator. "
            "A Railway project token is scoped to one environment, so staging and production need two tokens.",
            s["body"],
        )
    )
    story.append(Paragraph("Create tokens", s["h2"]))
    story.append(bullets([
        "Open the Railway project NEVIE-GLOBAL.",
        "Project Settings, then Tokens.",
        "Create a token named github-actions-staging for the staging environment. Copy it once.",
        "Create a token named github-actions-production for the production environment. Copy it once.",
        "If the UI offers only an account token, store that as GitHub secret RAILWAY_API_TOKEN instead, and keep it off shared chats. Prefer project tokens.",
    ], s))
    story.append(Paragraph("Store them on GitHub (Settings, Secrets and variables, Actions)", s["h2"]))
    story.append(kv_table([
        ("RAILWAY_TOKEN_STAGING", "Project token for the staging environment."),
        ("RAILWAY_TOKEN_PRODUCTION", "Project token for the production environment."),
    ]))
    story.append(Spacer(1, 3 * mm))
    story.append(
        Paragraph(
            "The workflow files already read those two secret names. After the secrets exist, a failed Actions deploy should stop. "
            "If both the GitHub App and railway up run on the same commit, you will see two deploys. That is wasteful, not a second site. Prefer one path: keep the GitHub App automatic, and leave deploy-*.yml as workflow_dispatch if double builds become noisy.",
            s["body"],
        )
    )

    story.append(Paragraph("7. What the collaborator must never commit", s["h1"]))
    story.append(bullets([
        ".env, credentials.json, Stripe secret keys, SMTP passwords, database URLs.",
        "The staff console path or admin password.",
        "Railway tokens or GitHub personal access tokens.",
        "Customer personal data exported from Postgres.",
        "Unpublished company numbers, VAT, phone numbers, or invented social URLs. Mark those To Be Confirmed.",
    ], s))
    story.append(
        Paragraph(
            "If a secret is committed by mistake: rotate it in Railway and Stripe immediately, then remove it from git history. Do not only delete the file on a later commit.",
            s["note"],
        )
    )

    story.append(Paragraph("8. Local and Railway facts (no secrets)", s["h1"]))
    story.append(kv_table([
        ("Desktop folder", r"C:\Users\muham\Desktop\navviglobaluk"),
        ("Package name", "nevie-global-uk"),
        ("Stack", "Next.js 15, Prisma, Postgres, Redis, Stripe (GBP), SMTP"),
        ("Public contact on site", "contact@nevie-global.com (from nevie-global.com)"),
        ("Custom domain", "Not attached on Railway web yet. Use the Railway URLs until DNS is added."),
        ("Stripe on these URLs", "Test-mode keys. Live charges need live keys in the production environment only, stored in Railway, never in git."),
    ]))

    story.append(Paragraph("9. Checklist", s["h1"]))
    story.append(Paragraph("Owner", s["h2"]))
    story.append(bullets([
        "Invite the second GitHub user and confirm they can open the private repo.",
        "Keep main for staging and the production branch for production on Railway.",
        "Store RAILWAY_TOKEN_STAGING and RAILWAY_TOKEN_PRODUCTION if CLI deploys should pass in Actions.",
        "Merge to production only after staging looks correct.",
        "Never put passwords in this PDF or in a chat to the collaborator.",
    ], s))
    story.append(Paragraph("Collaborator", s["h2"]))
    story.append(bullets([
        "Accept the GitHub invite.",
        "Clone, branch from main, open a pull request.",
        "Watch the ci workflow on the pull request.",
        "After merge, check staging. Production is not their merge target unless the owner says so.",
        "Ask the owner to set Railway variables. Do not ask them to paste the values into Slack or WhatsApp.",
    ], s))

    story.append(Paragraph("10. If something fails", s["h1"]))
    story.append(bullets([
        "GitHub 404 on the repo: they are not invited yet, or they are signed into the wrong GitHub account.",
        "Actions ci red on lint: fix the pull request; Railway GitHub App currently deploys even if ci is red, so do not treat a red check as a production stop unless the owner turns on required checks.",
        "Actions deploy Unauthorized: the matching RAILWAY_TOKEN_* secret is missing or is an account token in the wrong variable. The GitHub App deploy can still succeed.",
        "Staging 502 after a push: read the Railway web deployment logs for prisma or build errors. Do not change production while staging is broken.",
        "Legal page still showing an old mailbox: Railway LEGAL_CONTACT_EMAIL overrides the published contact. Change the variable in Railway; do not hardcode a second mailbox in git.",
    ], s))
    story.append(
        Paragraph(
            "This document describes the connection path only. It is not a password list, not a Stripe live-key procedure, and not permission to change the official logo or unpublished legal facts.",
            s["note"],
        )
    )

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=20 * mm,
        bottomMargin=18 * mm,
        title="NEVIE-GLOBAL UK — GitHub CI/CD collaborator guide",
        author="NEVIE-GLOBAL UK",
    )
    doc.build(story, onFirstPage=cover_page, onLaterPages=header_footer)
    print(OUT)


if __name__ == "__main__":
    build()
