import { responseInterceptor } from 'http-proxy-middleware';
import * as cheerio from 'cheerio';

const targetUrl = 'https://docs.nestjs.com/';
const sourceUrl = 'http://localhost:3000';
const auxScriptPath = '/proxy/proxy-handler.js';

export const proxyEventHandlers = {
  proxyRes: responseInterceptor(async (responseBuffer, proxyRes) => {
    if (!proxyRes.headers['content-type']?.includes('text/html')) {
      return responseBuffer;
    }

    const body: string = responseBuffer.toString('utf8');
    const $ = cheerio.load(body);

    // заменить линки
    $('a[href]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && href.startsWith(targetUrl)) {
        $(elem).attr('href', href.replace(targetUrl, sourceUrl));
      }
    });

    // инжект вспомогательного скрипта
    const scriptElement = $('<script></script>').attr('src', auxScriptPath);
    $('head').append(scriptElement);

    return $.html();
  }),
};
