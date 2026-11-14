#!/usr/bin/env python3
"""Extract published facts from saved nevie-global.com HTML. Write UTF-8 report."""
from __future__ import annotations

import html
import pathlib
import re
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

TEMP = pathlib.Path.home() / "AppData" / "Local" / "Temp"
OUT = pathlib.Path(r"C:\Users\muham\Desktop\navviglobal\docs\official-extract.txt")
FILES = {
    "home": TEMP / "nevie-home.html",
    "contact": TEMP / "nevie-contact.html",
    "legal": TEMP / "nevie-mentions.html",
    "privacy": TEMP / "nevie-privacy.html",
    "founder": TEMP / "nevie-founder.html",
    "vision": TEMP / "nevie-vision.html",
    "sitemap": TEMP / "nevie-page-sitemap.xml",
    "cookies": TEMP / "nevie-cookies.html",
}


def text(s: str) -> str:
    s = re.sub(r"<script[\s\S]*?</script>", " ", s, flags=re.I)
    s = re.sub(r"<style[\s\S]*?</style>", " ", s, flags=re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def meta(doc: str, key: str) -> str | None:
    pats = [
        rf'<meta[^>]+(?:name|property)=["\']{re.escape(key)}["\'][^>]+content=["\']([^"\']+)',
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:name|property)=["\']{re.escape(key)}["\']',
    ]
    if key == "canonical":
        m = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)', doc, re.I)
        return html.unescape(m.group(1)) if m else None
    for pat in pats:
        m = re.search(pat, doc, re.I)
        if m:
            return html.unescape(m.group(1))
    return None


def hrefs(doc: str) -> list[str]:
    return [html.unescape(h) for h in re.findall(r'href=["\']([^"\']+)', doc, re.I)]


def interesting_href(h: str) -> bool:
    l = h.lower()
    keys = [
        "instagram", "linkedin", "x.com", "twitter.com", "facebook.com",
        "tiktok", "youtube", "youtu.be", "pinterest", "t.me", "telegram",
        "discord", "whatsapp", "wa.me", "github.com", "maps.google",
        "goo.gl/maps", "mailto:", "tel:", "contact@", "logo", "favicon",
        "mentions", "politique", "privacy", "cgv", "cookies", "founder",
        "vision", "avatar", "technologie", "about", "contact",
    ]
    return any(k in l for k in keys)


lines: list[str] = []


def w(*a: object) -> None:
    lines.append(" ".join(str(x) for x in a))


def dump(label: str, path: pathlib.Path) -> None:
    w("=" * 72)
    w(label, str(path), "exists" if path.exists() else "MISSING")
    if not path.exists():
        return
    doc = path.read_text(encoding="utf-8", errors="replace")
    w("bytes", len(doc))
    title = re.search(r"<title>(.*?)</title>", doc, re.I | re.S)
    w("TITLE:", text(title.group(1)) if title else None)
    for k in [
        "description", "og:title", "og:description", "og:image", "og:url",
        "og:locale", "twitter:card", "twitter:image", "twitter:site",
        "canonical", "theme-color", "application-name",
    ]:
        v = meta(doc, k)
        if v:
            w(f"META {k}:", v[:500])
    w("\n-- interesting hrefs --")
    seen = set()
    for h in hrefs(doc):
        if interesting_href(h) and h not in seen:
            seen.add(h)
            w(" ", h[:400])
    w("\n-- src/url containing logo/icon/og --")
    seen = set()
    for s in re.findall(r'(?:src|href|content)=["\']([^"\']+)', doc, re.I):
        s = html.unescape(s)
        l = s.lower()
        if any(k in l for k in ["logo", "favicon", "og-", "apple-touch", "site-icon", "branding"]):
            if s not in seen:
                seen.add(s)
                w(" ", s[:400])
    w("\n-- emails --")
    for e in sorted(set(re.findall(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", doc, re.I))):
        if "@1k.webp" in e or "wixpress" in e.lower():
            continue
        w(" ", e)
    w("\n-- tel patterns --")
    for t in re.findall(r'tel:[^"\']+|(\+\d[\d\s().-]{7,})', doc):
        if t:
            w(" ", t[:80])
    # context around +33
    for m in re.finditer(r".{80}\+33.{80}", doc):
        w(" CTX", text(m.group(0))[:200])
    w("\n-- prices --")
    for p in re.findall(r"([0-9]{1,4})\s*€", doc):
        w(" ", p + " EUR")
    w("\n-- body text --")
    w(text(doc)[:6000])
    w("")


def main() -> None:
    for label, path in FILES.items():
        dump(label, path)

    home = FILES["home"].read_text(encoding="utf-8", errors="replace")
    w("=" * 72)
    w("NAV / MENU LINKS from home")
    seen = set()
    for m in re.finditer(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>([\s\S]*?)</a>', home, re.I):
        href, inner = html.unescape(m.group(1)), text(m.group(2))
        if not inner or len(inner) > 90:
            continue
        if href.startswith("#elementor") or "wp-admin" in href or "javascript:" in href:
            continue
        if any(x in href for x in ["facebook.com/sharer", "twitter.com/intent", "pinterest.com/pin"]):
            continue
        key = (inner, href)
        if key in seen:
            continue
        seen.add(key)
        if href.startswith("/") or "nevie-global.com" in href or href.startswith("http") or href.startswith("mailto"):
            w(f"  {inner!r:45} {href[:200]}")

    w("\nSITEMAP LOCS")
    sm = FILES["sitemap"].read_text(encoding="utf-8", errors="replace")
    for loc in re.findall(r"<loc>([^<]+)</loc>", sm):
        w(" ", loc)

    # product-like headings
    w("\nH2/H3 from home")
    for m in re.finditer(r"<h[1-3][^>]*>([\s\S]*?)</h[1-3]>", home, re.I):
        t = text(m.group(1))
        if t:
            w(" ", t[:200])

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print("wrote", OUT, "chars", sum(len(x) for x in lines))


if __name__ == "__main__":
    main()
