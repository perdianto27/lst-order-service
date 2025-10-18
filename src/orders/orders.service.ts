import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitmq: RabbitmqService,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const payload = {
      userId: dto.userId,
      itemId: dto.itemId,
      quantity: dto.quantity,
      createdAt: new Date().toISOString(),
    };

    try {
      // 🗄️ Simpan ke database
      const orderRecord = await this.prisma.order.create({
        data: {
          userId: payload.userId,
          itemId: payload.itemId,
          quantity: payload.quantity,
        },
      });

      this.logger.log(
        `✅ Order created successfully for userId=${payload.userId}`,
      );
      // 📨 Publish ke RabbitMQ
      const event = {
        event: 'order.created',
        data: orderRecord,
      };

      await this.rabbitmq.publish('orders-exchange', 'order.created', event);

      this.logger.log(`📦 Event 'order.created' published to RabbitMQ`);

      return { order: orderRecord, published: true };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? `❌ Failed to create order: ${error.message}`
          : `❌ Failed to create order: ${String(error)}`;
      this.logger.error(message);

      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
