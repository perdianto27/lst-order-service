import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

export const CreateOrderDocs = {
  operation: {
    summary: 'Create a new order',
    description: 'Creates a new order and publishes an event to RabbitMQ',
  } as ApiOperationOptions,

  responses: {
    success: {
      status: 201,
      description: 'Order created successfully',
    } as ApiResponseOptions,
    error: {
      status: 500,
      description: 'Internal Server Error',
    } as ApiResponseOptions,
  },
};
