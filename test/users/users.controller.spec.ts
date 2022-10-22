import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../src/users/entities/user.entity';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  preload: jest.fn(),
  save: jest.fn(),
});

describe('UsersController', () => {
  let controller: UsersController;
  let userRepo: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: createMockRepository() },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userRepo = module.get<MockRepository>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
