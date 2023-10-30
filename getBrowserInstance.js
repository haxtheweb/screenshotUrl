import chromium from '@sparticuz/chromium'

export async function getBrowserInstance() {
	const executablePath = await chromium.executablePath
	if (!executablePath) {
		// running locally
		const puppeteer = await import('puppeteer').then((m) => {
      return m.default;
    });
		return await puppeteer.launch({
			ignoreDefaultArgs: ['--disable-extensions'],
			args: chromium.args,
			headless: "new",
			defaultViewport: {
				width: 1280,
				height: 720
			},
			ignoreHTTPSErrors: true
		});
	}
	return await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: executablePath,
		headless: chromium.headless,
		ignoreHTTPSErrors: true
	});
}