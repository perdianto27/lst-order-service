import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

import { setupSwagger } from './swagger/swagger.config';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  const port = process.env.PORT || 3000;
  await app.listen(port);
  new Logger('Bootstrap').log(`Order service running on port ${port}`);
}

bootstrap();
