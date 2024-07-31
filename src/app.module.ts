// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

// @Module({
//   imports: [],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import {
  createProxyMiddleware,
  responseInterceptor,
} from 'http-proxy-middleware';

import * as http from 'http';
import * as cheerio from 'cheerio';

// const targetUrl = 'https://www.youtube.com/';
const targetUrl = 'https://purple-lens.com';
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

              // Заміна домену в посиланнях
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
