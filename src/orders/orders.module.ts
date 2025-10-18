import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, RabbitmqService],
})
export class OrdersModule {}
