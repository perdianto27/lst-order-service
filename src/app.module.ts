import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { LoggerMiddleware } from './common/middleware/logger.middlware';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { PrismaService } from './prisma/prisma.service';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60000', 10),
          limit: parseInt(process.env.RATE_LIMIT_LIMIT ?? '3', 10),
        },
      ],
    }),
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    RabbitmqService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [PrismaService, RabbitmqService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
