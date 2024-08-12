import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
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
          target: SOURCE_URL,
          changeOrigin: true,
          pathFilter: (pathname) => {
            return !pathname.startsWith(`/${proxyPathName}`);
          },
          selfHandleResponse: true,
          on: proxyEventHandlers,
        }),
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
