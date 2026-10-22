import 'dotenv/config';
import puppeteer from "puppeteer";


function getTargetUrl(nickname) {
    const template = process.env.SCRAPER_URL_TEMPLATE;
    if (!template || !template.includes('{nickname}')) {
        throw new Error('Configure SCRAPER_URL_TEMPLATE with {nickname}');
    }
    const url = new URL(template.replace('{nickname}', encodeURIComponent(nickname)));
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid scraper URL protocol');
    return url.href;
}

let browserGlobal = null;

async function getBrowser() {
    if (!browserGlobal) {
        browserGlobal = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-blink-features=AutomationControlled'
            ]
        });
    }
    return browserGlobal;
}

export async function openWebPage_strip(nickname, reintentos = 2) {
    for (let intento = 1; intento <= reintentos; intento++) {
        const browser = await getBrowser();
        const page = await browser.newPage();

        try {
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            );

            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'media', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.goto(getTargetUrl(nickname), {
                waitUntil: 'domcontentloaded',
                timeout: 20000
            });

            await page.waitForSelector('div[data-tab="activity"]', { timeout: 8000 });
            await page.click('div[data-tab="activity"]');
            await page.waitForSelector('.activity_logs_content p', { timeout: 8000 });

            const horas = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.activity_logs_content p'))
                    .map(p => p.textContent.trim());
            });

            try { await page.close(); } catch { }

            return horas.map(texto => {
                const match = texto.match(
                    /(\d{4}-\d{2}-\d{2}).*?(\d{2})\s+Hours?\s+(\d{2})\s+Minutes?/
                );
                if (!match) return null;
                return { fecha: match[1], tiempo: `${match[2]}:${match[3]}` };
            }).filter(Boolean);

        } catch (error) {
            try { await page.close(); } catch { }
            if (intento === reintentos) throw error;
            await new Promise(r => setTimeout(r, 1000 * intento));
        }
    }
}

export async function cerrarBrowser_strip() {
    if (browserGlobal) {
        try { await browserGlobal.close(); } catch { }
        browserGlobal = null;
    }
}
