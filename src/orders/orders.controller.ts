import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  HttpException,
  Logger,
  UseGuards,
} from '@nestjs/common';

import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderDocs } from './order.swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation(CreateOrderDocs.operation)
  @ApiResponse(CreateOrderDocs.responses.success)
  @ApiResponse(CreateOrderDocs.responses.error)
  async create(@Body() dto: CreateOrderDto) {
    try {
      const result = await this.ordersService.createOrder(dto);
      return {
        success: true,
        message: 'Order created successfully',
        data: result,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? `❌ Failed to create order: ${error.message}`
          : `❌ Failed to create order: ${String(error)}`;

      this.logger.error(message);

      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
