const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const pages = [
    { url: 'http://localhost:5173/login', file: 'ss_login.png' },
    { url: 'http://localhost:5173/dashboard', file: 'ss_dashboard.png' },
    { url: 'http://localhost:5173/analytics', file: 'ss_analytics.png' },
    { url: 'http://localhost:5173/predictions', file: 'ss_predictions.png' },
    { url: 'http://localhost:5173/admin/train-model', file: 'ss_admin.png' },
];

const screenshotDir = path.join(__dirname, '..', 'docs', 'screenshots');

if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

(async () => {
    console.log('🚀 Starting screenshot capture...');
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 }
    });

    for (const page of pages) {
        console.log(`📸 Capturing ${page.url}...`);
        const p = await context.newPage();
        try {
            await p.goto(page.url, { waitUntil: 'networkidle', timeout: 30000 });
            await p.waitForTimeout(3000); // extra wait for animations/charts
            await p.screenshot({
                path: path.join(screenshotDir, page.file),
                fullPage: true
            });
            console.log(`✅ Saved ${page.file}`);
        } catch (e) {
            console.error(`❌ Failed to capture ${page.url}: ${e.message}`);
        }
        await p.close();
    }

    // Dark mode screenshot
    console.log('🌙 Capturing Dark Mode dashboard...');
    const dark = await context.newPage();
    try {
        await dark.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
        await dark.click('[data-testid="dark-mode-toggle"]');
        await dark.waitForTimeout(2000);
        await dark.screenshot({
            path: path.join(screenshotDir, 'ss_dashboard_dark.png'),
            fullPage: true
        });
        console.log('✅ Saved ss_dashboard_dark.png');
    } catch (e) {
        console.error(`❌ Failed to capture Dark Mode: ${e.message}`);
    }

    await browser.close();
    console.log('🏁 Screenshot process complete.');
})();
