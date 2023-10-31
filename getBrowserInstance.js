import chromium from '@sparticuz/chromium'
import puppeteer from "puppeteer-core";
export async function getBrowserInstance() {
	const executablePath = await chromium.executablePath();
	// Optional: If you'd like to use the legacy headless mode. "new" is the default.
	chromium.setHeadlessMode = true;
	// Optional: If you'd like to disable webgl, true is the default.
	chromium.setGraphicsMode = false;
	if (!executablePath) {
		// running locally
		const puppeteerLocal = await import('puppeteer').then((m) => {
      return m.default;
    });
		return await puppeteerLocal.launch({
			ignoreDefaultArgs: ['--disable-extensions'],
			args: chromium.args,
			headless: chromium.headless,
			defaultViewport: {
				width: 1368,
				height: 768
			},
			ignoreHTTPSErrors: true
		});
	}
	return await puppeteer.launch({
		args: chromium.args,
		defaultViewport: {
			width: 1368,
			height: 768
		},
		executablePath: executablePath,
		headless: chromium.headless,
		ignoreHTTPSErrors: true
	});
}