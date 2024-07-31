import { join } from 'path';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { proxyEventHandlers } from './proxyEventHandlers';

const targetUrl = 'https://docs.nestjs.com/';
// const sourceUrl = 'http://localhost:3000';
const publicDirName = 'public';
const proxyPathName = 'proxy';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', publicDirName),
      serveRoot: '/', // Базовый URL для статических файлов
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        createProxyMiddleware({
          target: targetUrl,
          changeOrigin: true,
          pathFilter: (_, req) => {
            //@ts-ignore
            const path = req.baseUrl;
            return !path.startsWith(`/${proxyPathName}`);
          },
          router: (req) => {
            //@ts-ignore
            const path = req.baseUrl;

            return `${targetUrl}${path}`;
          },

          selfHandleResponse: true,
          on: proxyEventHandlers,
        }),
      )
      .forRoutes('*');
  }
}
