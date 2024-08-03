import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { Request } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { proxyEventHandlers } from './proxyEventHandlers';

const { SOURCE_URL } = process.env;

@Module({
  imports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        createProxyMiddleware({
          changeOrigin: true,
          router: (req: Request) => {
            const path = req.baseUrl;

            return `${SOURCE_URL}${path}`;
          },

          selfHandleResponse: true,
          on: proxyEventHandlers,
        }),
      )
      .forRoutes('*');
  }
}
