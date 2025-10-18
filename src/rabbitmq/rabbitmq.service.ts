import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private conn: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  async onModuleInit() {
    const url = process.env.RABBITMQ_URL;

    try {
      this.conn = await amqp.connect(url);
      this.channel = await this.conn.createChannel();
      this.logger.log('✅ Connected to RabbitMQ and channel created.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(
          `❌ Failed to connect to RabbitMQ: ${err.message}`,
          err.stack,
        );
      } else {
        this.logger.error(`❌ Failed to connect to RabbitMQ: ${String(err)}`);
      }
    }
  }

  async publish(exchange: string, routingKey: string, message: unknown) {
    try {
      if (!this.channel) throw new Error('RabbitMQ channel not initialized');

      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      const payload = Buffer.from(JSON.stringify(message));
      this.channel.publish(exchange, routingKey, payload, { persistent: true });

      this.logger.log(
        `📦 Published message to ${exchange} with routing key "${routingKey}"`,
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(
          `❌ Failed to publish message: ${err.message}`,
          err.stack,
        );
      } else {
        this.logger.error(`❌ Failed to publish message: ${String(err)}`);
      }
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.logger.log('RabbitMQ channel closed.');
      }
      if (this.conn) {
        await this.conn.close();
        this.logger.log('RabbitMQ connection closed.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(
          `❌ Error closing RabbitMQ: ${err.message}`,
          err.stack,
        );
      } else {
        this.logger.error(`❌ Error closing RabbitMQ: ${String(err)}`);
      }
    }
  }
}