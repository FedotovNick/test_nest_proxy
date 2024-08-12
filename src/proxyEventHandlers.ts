import * as cheerio from 'cheerio';
import { IncomingMessage } from 'http';
import { responseInterceptor } from 'http-proxy-middleware';

const { TARGET_URL, SOURCE_URL } = process.env;

const contentHTML = 'text/html';
const contentJS = 'application/javascript';
const contentJSON = 'application/json';

export const proxyEventHandlers = {
  proxyRes: responseInterceptor(
    async (responseBuffer: Buffer, proxyRes: IncomingMessage) => {
      let ctype = proxyRes.headers['content-type'];
      ctype = ctype?.split(';')?.[0]?.trim();

      if (![contentJS, contentJSON, contentHTML].includes(ctype)) {
        return responseBuffer;
      }

      let body: string = responseBuffer.toString('utf8');

      if ([contentJS, contentJSON].includes(ctype)) {
        body = body.replaceAll(SOURCE_URL!, TARGET_URL!);

        const oldHost = new URL(SOURCE_URL).host;
        const newHost = new URL(TARGET_URL).host;

        body = body.replaceAll(`"${oldHost}`, `"${newHost}`);

        return body;
      }

      const $ = cheerio.load(body);

      $('a[href]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href && href.startsWith(SOURCE_URL!)) {
          $(elem).attr('href', href.replace(SOURCE_URL!, TARGET_URL!));
        }
      });

      $('head').append(
        `<script id="proxy_handler_script" data-proxy-source-url="${SOURCE_URL}" data-proxy-target-url="${TARGET_URL}" src="/proxy/proxy.handler.js" defer></script>`,
      );

      body = $.html();

      return body;
    },
  ),
};
