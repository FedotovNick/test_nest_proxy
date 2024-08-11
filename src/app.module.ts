import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Request } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { join } from 'path';
import { proxyEventHandlers } from './proxyEventHandlers';

const { SOURCE_URL } = process.env;
const publicDirName = 'public';
const proxyPathName = 'proxy';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', publicDirName),
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        createProxyMiddleware({
          changeOrigin: true,
          pathFilter: (_, req) => {
            //@ts-ignore
            const path = req.baseUrl;
            return !path.startsWith(`/${proxyPathName}`);
          },
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
