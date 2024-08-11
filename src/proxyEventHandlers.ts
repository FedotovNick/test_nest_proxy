import * as cheerio from 'cheerio';
import { IncomingMessage } from 'http';
import { responseInterceptor } from 'http-proxy-middleware';

const { TARGET_URL, SOURCE_URL } = process.env;

const contentHTML = 'text/html';
const contentJS = 'application/javascript';
const contentTypes = [contentHTML, contentJS];
const additionalPart = '™';

export const proxyEventHandlers = {
  proxyRes: responseInterceptor(
    async (responseBuffer: Buffer, proxyRes: IncomingMessage) => {
      let ctype = proxyRes.headers['content-type'];
      ctype = ctype?.split(';')?.[0]?.trim();
      let body: string = responseBuffer.toString('utf8');

      if (ctype === contentJS || ctype === 'application/json') {
        body = body.replaceAll(SOURCE_URL!, TARGET_URL!);
        const oldHost = new URL(SOURCE_URL).host;
        const newHost = new URL(TARGET_URL).host;

        console.log({ oldHost, newHost });

        body = body.replaceAll(`"${oldHost}`, `"${newHost}`);

        return body;
      }

      if (ctype !== contentHTML) {
        return responseBuffer;
      }

      const $ = cheerio.load(body);

      $('a[href]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href && href.startsWith(SOURCE_URL!)) {
          $(elem).attr('href', href.replace(SOURCE_URL!, TARGET_URL!));
        }
      });

      $('body *').each(function () {
        $(this)
          .contents()
          .filter(function () {
            return this.nodeType === 3;
          })
          .each(function () {
            //@ts-ignore
            const newText = this.nodeValue.replace(
              /\b(\w{6})\b/g,
              `$1${additionalPart}`,
            );
            //@ts-ignore
            this.nodeValue = newText;
          });
      });
      $('head').append('<script src="/proxy/proxy.handler.js" defer></script>');

      body = $.html();

      return body;
    },
  ),
};
