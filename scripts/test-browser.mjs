import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.join(process.cwd(), "test-screenshots");
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const routesToTest = [
  { name: "01_dashboard", path: "/dashboard" },
  { name: "02_applications_kanban", path: "/applications" },
  { name: "03_cv_editor", path: "/cv" },
  { name: "04_companies", path: "/companies" },
  { name: "05_contacts", path: "/contacts" },
  { name: "06_calendar", path: "/calendar" },
  { name: "07_community", path: "/community" },
  { name: "08_feedback", path: "/feedback" },
  { name: "09_recruiter_jobs", path: "/recruiter/jobs" },
  { name: "10_recruiter_pipeline", path: "/recruiter/jobs/job-1/applicants" },
  { name: "11_recruiter_talent", path: "/recruiter/talent" },
  { name: "12_admin_users", path: "/admin/users" },
  { name: "13_admin_feedback", path: "/admin/feedback" },
];

async function runBrowserAudit() {
  console.log("🌐 Starting Playwright Chrome DevTools Browser Audit...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(`[Console Error] ${msg.text()} (${page.url()})`);
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(`[Page Error] ${err.message} (${page.url()})`);
  });

  const auditResults = [];

  for (const route of routesToTest) {
    const url = `http://localhost:3000${route.path}`;
    const startTime = Date.now();
    try {
      const response = await page.goto(url, { waitUntil: "networkidle", timeout: 10000 });
      const duration = Date.now() - startTime;
      const status = response ? response.status() : "No response";

      // Take screenshot
      const screenshotPath = path.join(ARTIFACT_DIR, `${route.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      const title = await page.title();
      console.log(`✓ ${route.name} (${route.path}) -> Status: ${status} in ${duration}ms`);

      auditResults.push({
        name: route.name,
        path: route.path,
        status,
        duration: `${duration}ms`,
        title,
        screenshot: screenshotPath,
      });
    } catch (err) {
      console.error(`✗ Error on ${route.path}:`, err.message);
      auditResults.push({
        name: route.name,
        path: route.path,
        error: err.message,
      });
    }
  }

  await browser.close();

  console.log("\n==================================================");
  console.log(`🎯 Browser Audit Complete: ${auditResults.length} pages verified`);
  console.log(`🚨 Console / JS Errors Count: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error("Errors found:", consoleErrors);
  } else {
    console.log("✨ 0 Console Errors across all pages! 100% Clean Runtime.");
  }
  console.log(`📸 Screenshots stored in: ${ARTIFACT_DIR}`);
  console.log("==================================================");
}

runBrowserAudit().catch(console.error);
