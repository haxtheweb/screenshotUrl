import chromium from '@sparticuz/chromium'
import puppeteer from "puppeteer-core";
export async function getBrowserInstance() {
	const executablePath = await chromium.executablePath();
	if (!executablePath) {
		// running locally
		const puppeteerLocal = await import('puppeteer').then((m) => {
      return m.default;
    });
		return await puppeteerLocal.launch({
			ignoreDefaultArgs: ['--disable-extensions'],
			args: chromium.args,
			headless: true,
			defaultViewport: {
				width: 1368,
				height: 768
			},
			ignoreHTTPSErrors: true
		});
	}
	// Optional: If you'd like to disable webgl, true is the default.
	chromium.setGraphicsMode = false;
	return await puppeteer.launch({
		args: chromium.args,
		defaultViewport: {
			width: 1368,
			height: 768
		},
		executablePath: executablePath,
		headless: true,
		ignoreHTTPSErrors: true
	});
}