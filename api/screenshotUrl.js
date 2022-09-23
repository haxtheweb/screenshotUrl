import { getBrowserInstance } from '../getBrowserInstance.js';
import { stdResponse, invalidRequest, stdPostBody } from "../requestHelpers.js";

// this requires its own service instance and can't live with the monorepo
// due to the size of the dependencies involved
export default async function handler(req, res) {
  var urlToCapture;
  var quality = 75;
  if (req.query && req.query.urlToCapture) {
    urlToCapture = req.urlToCapture;
    if (req.query.quality) {
      quality = parseInt(req.quality);
    }
  }
  else {
    body = stdPostBody(req);
    urlToCapture = body.urlToCapture;
    if (body.quality) {
      quality = parseInt(body.quality);
    }
  }
  // Perform URL validation
  if (!urlToCapture || !urlToCapture.trim()) {
    res = invalidRequest(res, 'enter a valid url');
  }
  else {
    if (!urlToCapture.includes("https://")) {
      // try to fake it
      urlToCapture = `https://${urlToCapture}`;
    }

    // capture options
    var browserGoToOptions = {
      timeout: 60000,
      waitUntil: 'networkidle2',
    };
    var screenshotOptions = {
      quality: quality,
      type: 'jpeg',
      encoding: "base64"
    };
    var base64 = '';
    let browser = null
    try {
      browser = await getBrowserInstance();
      let page = await browser.newPage();
      await page.goto(urlToCapture, browserGoToOptions);
      // special support for isolating a tweet
      if (urlToCapture.includes('twitter.com')) {
        await page.waitForSelector("article[data-testid='tweet']");
        const element = await page.$("article[data-testid='tweet']");
        base64 = await element.screenshot(screenshotOptions);
      }
      else {
        screenshotOptions.fullPage = true;
        base64 = await page.screenshot(screenshotOptions);
      }
      res = stdResponse(res,
        {
          url: urlToCapture,
          image: base64
        }, {
          methods: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          cache: 3600
        }
      );
    } catch (error) {
        console.log(error)
        res = invalidRequest(res, 'something went wrong', 500);
    } finally {
        if (browser !== null) {
            await browser.close()
        }
    }
  }
}