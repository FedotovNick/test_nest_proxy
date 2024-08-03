import { responseInterceptor } from 'http-proxy-middleware';
import * as cheerio from 'cheerio';
import { IncomingMessage } from 'http';

const { TARGET_URL, SOURCE_URL } = process.env;

const contentHTML = 'text/html';
const contentJS = 'application/javascript';
const contentTypes = [contentHTML, contentJS];
const changeWordLength = 6;
const additionalPart = '™';

const isFirstLetterUpperCase = (word: string): boolean => {
  if (!word || typeof word !== 'string') {
    return false;
  }
  const firstLetter = word.charAt(0);
  return firstLetter === firstLetter.toUpperCase();
};

const changeCode = (code: string): string => {
  let body = code.replace(
    /\w\.\w+\(\d{1,5},"([ .,:;\+\-\/@\(\)&>='\\\?a-zA-Z0-9]{6,}?)"/g,
    (mch, grp) => {
      const matchGrp = grp?.trim();
      const matchLength = matchGrp?.length;

      return mch.replace(/(?<!-)\b\w{6}\b(?!-)/g, (match) => {
        const isSingle = matchLength === changeWordLength;

        return isSingle
          ? isFirstLetterUpperCase(match)
            ? `${match}${additionalPart}`
            : match
          : `${match}${additionalPart}`;
      });
    },
  );

  body = body.replace(/title:"[^"]*?\b(\w{6})\b[^"]*?"/g, (match) =>
    match.replace(/\b\w{6}\b/g, (grp) => `${grp}${additionalPart}`),
  );
  return body;
};

export const proxyEventHandlers = {
  proxyRes: responseInterceptor(
    async (
      responseBuffer: Buffer,
      proxyRes: IncomingMessage,
      req: IncomingMessage,
    ) => {
      const method = req.method;
      let ctype = proxyRes.headers['content-type'];
      ctype = ctype?.split(';')?.[0]?.trim();

      if (!contentTypes.includes(ctype)) {
        return responseBuffer;
      }

      let body: string = responseBuffer.toString('utf8');

      if (ctype === contentHTML) {
        const $ = cheerio.load(body);

        $('a[href]').each((i, elem) => {
          const href = $(elem).attr('href');
          if (href && href.startsWith(SOURCE_URL!)) {
            $(elem).attr('href', href.replace(SOURCE_URL!, TARGET_URL!));
          }
        });

        body = $.html();
      }

      if (ctype === contentJS) {
        body = body.replaceAll(SOURCE_URL!, TARGET_URL!);
        body = changeCode(body);
      }

      return body;
    },
  ),
};
