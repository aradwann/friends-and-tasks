import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('[Feature] Users - /users', () => {
    const user: CreateUserDto = {
      username: 'testusername',
      email: 'test@email.com',
      password: 'testpassword',
    };
    it('Create [POST /]', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send(user)
        .expect(HttpStatus.CREATED)
        .then((res) => {
          console.log({ res });
        });
    });
    it('Get all [GET /]', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it.todo('Get one [GET /:id]');
    it.todo('update one [PATCH /:id]');
    it.todo('Delete one [DELETE /:id]');
  });

  afterAll(async () => {
    await app.close();
  });
});
