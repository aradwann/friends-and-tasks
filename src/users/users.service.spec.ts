import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  preload: jest.fn(),
  save: jest.fn(),
});
describe('UsersService', () => {
  let service: UsersService;
  let userRepo: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: createMockRepository() },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get<MockRepository>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create User', () => {
    it('successfully', async () => {
      const user: CreateUserDto = {
        username: 'test',
        email: 'test@email.com',
        password: 'testpassword',
      };

      userRepo.findOneBy.mockReturnValue(null);
      userRepo.save.mockReturnValue({
        username: 'test',
        email: 'test@email.com',
        password: 'testpassword',
      });

      const createdUser = await service.create({
        username: 'test',
        email: 'test@email.com',
        password: 'testpassword',
      });
      expect(createdUser).toEqual(user);
    });

    it('username alread exists', async () => {
      const user: CreateUserDto = {
        username: 'test',
        email: 'test@email.com',
        password: 'testpassword',
      };

      userRepo.findOneBy.mockReturnValue({ username: 'test' });
      try {
        const createdUser = await service.create({
          username: 'test',
          email: 'test@email.com',
          password: 'testpassword',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('username is already taken');
      }
    });
    it.todo('email is already taken');
    // it('email already exists', async () => {
    //   const user: CreateUserDto = {
    //     username: 'test',
    //     email: 'test@email.com',
    //     password: 'testpassword',
    //   };
    //   userRepo.findOneBy.mockReturnValue({ email: 'test@email.com' });
    //   try {
    //     const createdUser = await service.create({
    //       username: 'test',
    //       email: 'test@email.com',
    //       password: 'testpassword',
    //     });
    //   } catch (error) {
    //     expect(error).toBeInstanceOf(BadRequestException);
    //     expect(error.message).toEqual('email is already taken');
    //   }
    // });
  });
  it.todo('update');
  it.todo('findall');
  it.todo('findone');
  it.todo('delete');
});
