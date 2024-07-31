import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import {
  createProxyMiddleware,
  responseInterceptor,
} from 'http-proxy-middleware';
import * as cheerio from 'cheerio';

const targetUrl = 'https://docs.nestjs.com/';
const sourceUrl = 'http://localhost:3000';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        createProxyMiddleware({
          changeOrigin: true,
          // target: targetUrl,
          router: (req) => {
            //@ts-ignore
            return `${targetUrl}${req.baseUrl}`;
          },

          selfHandleResponse: true,
          on: {
            proxyRes: responseInterceptor(async (responseBuffer, proxyRes) => {
              if (!proxyRes.headers['content-type']?.includes('text/html')) {
                return responseBuffer;
              }

              const body: string = responseBuffer.toString('utf8'); // convert buffer to string
              const $ = cheerio.load(body);

              $('a[href]').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href && href.startsWith(targetUrl)) {
                  $(elem).attr('href', href.replace(targetUrl, sourceUrl));
                }
              });

              return $.html();
            }),
          },
        }),
      )
      .forRoutes('*');
  }
}
