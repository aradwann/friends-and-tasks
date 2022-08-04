import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: {
        // enable implicit conversion of the received params over the network
        // as the network transfer all values as strings we need to convert them
        // to their correct types to be appropriatly used
        // such as query params used in pagination
        // enabling this option makes the params converted to integers automatically
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(3000);
}
bootstrap();
