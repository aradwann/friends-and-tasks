import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //////////////////// SETUP VALIDATION PIPE ///////////////
  app.useGlobalPipes(
    new ValidationPipe({
      // setting whitelist to true trim any additional unwanted props/values in the request body
      // that's not defined by the dto and doesn't have validation decorators
      whitelist: true,
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

  /////////////////////// SETUP GLOBAL FILTERS ///////////////////
  app.useGlobalFilters(new HttpExceptionFilter());

  ////////////////////////////// SETUP SWAGGER (OPEN API) ////////////////////////
  const options = new DocumentBuilder()
    .setTitle('Tasks')
    .setDescription(
      'A User can create workspace/s and add other users to or remove them from the workspace he created\
       only the creator of the workspace can add or remove users\
      ,users in the workspace can post tasks in the workspace and assign it to one or more users in the same workspace ',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  ////////////////////////// CORS ///////////////////////////////////
  app.enableCors();

  await app.listen(8000);
}
bootstrap();
