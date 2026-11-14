import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUT = path.join(__dirname, "screens");
const BASE = "http://127.0.0.1:3100";
fs.mkdirSync(OUT, { recursive: true });

const pages = [
  { id: "home-dark", url: "/", theme: "dark" },
  { id: "home-light", url: "/", theme: "light" },
  { id: "marketplace", url: "/marketplace", theme: "light" },
  { id: "category-jewellery", url: "/marketplace/category/connected-jewellery", theme: "light" },
  { id: "category-founder", url: "/marketplace/category/founder-access", theme: "light" },
  { id: "product", url: "/marketplace/bague-aura", theme: "light" },
  { id: "cart", url: "/cart", theme: "light" },
  { id: "academy", url: "/academy", theme: "light" },
  { id: "academy-course", url: "/academy/practical-ai", theme: "light" },
  { id: "services", url: "/services", theme: "light" },
  { id: "ai", url: "/ai", theme: "light" },
  { id: "solutions", url: "/solutions", theme: "light" },
  { id: "industries", url: "/industries", theme: "light" },
  { id: "pricing", url: "/pricing", theme: "light" },
  { id: "about", url: "/about", theme: "light" },
  { id: "contact", url: "/contact", theme: "light" },
  { id: "faq", url: "/faq", theme: "light" },
  { id: "blog", url: "/blog", theme: "light" },
  { id: "support", url: "/support", theme: "light" },
  { id: "documentation", url: "/documentation", theme: "light" },
  { id: "partners", url: "/partners", theme: "light" },
  { id: "privacy", url: "/privacy", theme: "light" },
  { id: "sign-in", url: "/sign-in", theme: "dark" },
  { id: "sign-up", url: "/sign-up", theme: "dark" },
  { id: "dashboard", url: "/dashboard", theme: "light" },
  { id: "dashboard-projects", url: "/dashboard/projects", theme: "light" },
  { id: "admin", url: "/admin", theme: "dark" },
  { id: "admin-cms", url: "/admin/cms", theme: "dark" },
];

(async () => {
  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: "en-GB",
  });
  await context.addInitScript(() => {
    try {
      localStorage.setItem("nevie-cookie-choice", "accepted");
    } catch {}
  });
  const page = await context.newPage();

  for (const item of pages) {
    try {
      await page.goto(BASE + item.url, { waitUntil: "load", timeout: 60000 });
    } catch (err) {
      console.warn("retry", item.id, err.message);
      await page.goto(BASE + item.url, { waitUntil: "commit", timeout: 60000 });
    }
    await page.waitForTimeout(900);
    await page.evaluate((theme) => {
      document.documentElement.setAttribute("data-theme", theme);
      document.querySelectorAll(".nevie-loader, .cookie-banner, nextjs-portal").forEach((el) => el.remove());
      const overlay = document.querySelector("[data-nextjs-dialog-overlay]");
      overlay?.parentElement?.remove();
    }, item.theme);
    await page.waitForTimeout(450);
    const file = path.join(OUT, item.id + ".jpg");
    await page.screenshot({ path: file, type: "jpeg", quality: 72, fullPage: false });
    console.log("ok", item.id);
  }

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
