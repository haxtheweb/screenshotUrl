import { getBrowserInstance } from '../getBrowserInstance.js';
import { stdResponse, invalidRequest, stdPostBody } from "../requestHelpers.js";

// this requires its own service instance and can't live with the monorepo
// due to the size of the dependencies involved
export default async function handler(req, res) {
  var urlToCapture;
  var quality = 75;
  var render = 'json';
  if (req.query && req.query.urlToCapture) {
    urlToCapture = req.query.urlToCapture;
    if (req.query.quality) {
      quality = parseInt(req.query.quality);
    }
    if (req.query.render) {
      render = req.query.render;
    }
  }
  else {
    body = stdPostBody(req);
    urlToCapture = body.urlToCapture;
    if (body.quality) {
      quality = parseInt(body.quality);
    }
    if (body.render) {
      render = body.render;
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
      encoding: render == 'img' ? 'binary' : 'base64'
    };
    await puppeteer.launch({ignoreDefaultArgs: ['--disable-extensions']})
    var screenShot = '';
    let browser = null
    try {
      browser = await getBrowserInstance();
      let page = await browser.newPage();
      await page.goto(urlToCapture, browserGoToOptions);
      // special support for isolating a tweet
      if (urlToCapture.includes('twitter.com')) {
        await page.waitForSelector("article[data-testid='tweet']");
        const element = await page.$("article[data-testid='tweet']");
        screenShot = await element.screenshot(screenshotOptions);
      }
      else {
        screenshotOptions.fullPage = true;
        screenShot = await page.screenshot(screenshotOptions);
      }
      // json or direct response w/ the media in question
      if (render == 'img') {
        stdResponse(res,screenShot,{cache: 3600, type:'image/jpeg'});
      }
      else {
        res = stdResponse(res,
          {
            url: urlToCapture,
            image: screenShot
          }, {
            methods: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
            cache: 3600
          }
        );
      }
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