import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { UsersService } from '../../src/users/users.service';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/users/entities/user.entity';

describe('E2E JWT Sample', () => {
  let app: INestApplication;
  let usersRepo: Repository<User>;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    usersRepo = modRef.get<Repository<User>>(getRepositoryToken(User));
    app = modRef.createNestApplication();
    await app.init();
  });

  it('should get a JWT then successfully make a call', async () => {
    const user: CreateUserDto = {
      username: 'testusername',
      email: 'test@email.com',
      password: 'testpassword',
    };
    const createdUser = await usersRepo.create(user);

    console.log({ createdUser });

    const loginReq = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testusername', password: 'testpassword' })
      .expect(200);

    const token = loginReq.body.access_token;
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', 'Bearer ' + token)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
