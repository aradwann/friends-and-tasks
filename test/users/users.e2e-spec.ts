import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../../src/users/users.module';
import * as request from 'supertest';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

describe('[Feature] Users - /users', () => {
  const user = {
    username: 'testusername',
    email: 'test@email.com',
    password: 'testpassword',
  };
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5433,
          username: 'postgres',
          password: 'password',
          database: 'postgres',
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
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

    await app.init();
  });

  it('Create [POST /]', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(user as CreateUserDto)
      .expect(HttpStatus.CREATED);
  });
  it('Get all [GET /]', () => {
    return request(app.getHttpServer()).get('/users').expect(HttpStatus.OK);
  });
  it.todo('Get one [GET /:id]');
  it.todo('update one [PATCH /:id]');
  it.todo('Delete one [DELETE /:id]');

  afterAll(async () => {
    await app.close();
  });
});
