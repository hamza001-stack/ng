/**
 * Small allow-list HTML sanitiser for admin-authored page content.
 * Self-contained (no dependencies). Anything not explicitly allowed is dropped
 * or escaped: scripts, styles, iframes, event handlers, inline styles,
 * javascript: URLs and malformed tags can never reach the page.
 */

const VOID = new Set(['br', 'hr', 'img']);

const ALLOWED_TAGS = new Set([
  'p', 'div', 'span', 'section', 'article', 'blockquote', 'figure', 'figcaption',
  'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 'small', 'mark',
  'code', 'pre', 'br', 'hr', 'a', 'img', 'details', 'summary',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title']),
  img: new Set(['src', 'alt', 'width', 'height']),
  th: new Set(['colspan', 'rowspan', 'scope']),
  td: new Set(['colspan', 'rowspan']),
};

const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/y;
const ATTR = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

export function escapeText(value: string) {
  return value.replace(/&(?![a-zA-Z]{2,8};|#\d{1,6};|#x[0-9a-fA-F]{1,6};)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function decodeEntities(value: string) {
  return value
    .replace(/&#x([0-9a-fA-F]+);?/g, (_, hex: string) => String.fromCodePoint(Math.min(parseInt(hex, 16), 0x10ffff)))
    .replace(/&#(\d+);?/g, (_, dec: string) => String.fromCodePoint(Math.min(parseInt(dec, 10), 0x10ffff)))
    .replace(/&colon;/gi, ':')
    .replace(/&tab;/gi, '\t')
    .replace(/&newline;/gi, '\n');
}

/** Returns a safe URL or '' . Only http(s), mailto, tel, site-relative and #anchors. */
export function safeUrl(raw: string, allowMailto: boolean) {
  const value = decodeEntities(raw).replace(/[\u0000- \u007f-\u009f]+/g, '');
  if (!value) return '';
  if (value.startsWith('//')) return '';
  if (value.startsWith('/') || value.startsWith('#')) return value;
  if (/^https:\/\//i.test(value) || (allowMailto && /^http:\/\//i.test(value))) return value;
  if (allowMailto && /^(mailto|tel):/i.test(value)) return value;
  return '';
}

export function sanitizeHtml(input: string | null | undefined): string {
  const source = (input ?? '').slice(0, 200_000);
  let out = '';
  let text = '';
  const stack: string[] = [];
  const flush = () => {
    out += escapeText(text);
    text = '';
  };

  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch !== '<') {
      text += ch;
      i += 1;
      continue;
    }
    // HTML comments are dropped entirely.
    if (source.startsWith('<!--', i)) {
      const end = source.indexOf('-->', i + 4);
      i = end === -1 ? source.length : end + 3;
      continue;
    }
    TAG.lastIndex = i;
    const match = TAG.exec(source);
    if (!match) {
      text += '<';
      i += 1;
      continue;
    }
    i = TAG.lastIndex;
    const closing = match[1] === '/';
    const name = match[2].toLowerCase();
    if (!ALLOWED_TAGS.has(name)) continue;
    flush();
    if (closing) {
      const at = stack.lastIndexOf(name);
      if (at === -1) continue;
      while (stack.length > at) out += `</${stack.pop()}>`;
      continue;
    }
    let attrs = '';
    const allowed = ALLOWED_ATTRS[name];
    ATTR.lastIndex = 0;
    let attr: RegExpExecArray | null;
    while ((attr = ATTR.exec(match[3])) !== null) {
      const attrName = attr[1].toLowerCase();
      const value = attr[2] ?? attr[3] ?? attr[4] ?? '';
      if (attrName === 'class') {
        const cleaned = value.replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
        if (cleaned) attrs += ` class="${escapeAttr(cleaned)}"`;
        continue;
      }
      if (!allowed || !allowed.has(attrName)) continue;
      if (attrName === 'href') {
        const url = safeUrl(value, true);
        if (url) attrs += ` href="${escapeAttr(url)}"`;
      } else if (attrName === 'src') {
        const url = safeUrl(value, false);
        if (url) attrs += ` src="${escapeAttr(url)}"`;
      } else if (['width', 'height', 'colspan', 'rowspan'].includes(attrName)) {
        if (/^\d{1,4}$/.test(value)) attrs += ` ${attrName}="${value}"`;
      } else if (attrName === 'scope') {
        if (/^(row|col|rowgroup|colgroup)$/.test(value)) attrs += ` scope="${value}"`;
      } else {
        attrs += ` ${attrName}="${escapeAttr(value)}"`;
      }
    }
    if (name === 'a') {
      attrs += ' rel="noopener noreferrer"';
    }
    if (name === 'img') {
      if (!/ src="/.test(attrs)) continue;
      attrs += ' loading="lazy"';
    }
    if (VOID.has(name)) {
      out += `<${name}${attrs}>`;
    } else {
      out += `<${name}${attrs}>`;
      stack.push(name);
    }
  }
  flush();
  while (stack.length) out += `</${stack.pop()}>`;
  return out;
}
