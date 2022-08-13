import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  preload: jest.fn(),
  save: jest.fn(),
});

describe('TasksService', () => {
  let service: TasksService;
  let taskRepo: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: createMockRepository() },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepo = module.get<MockRepository>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
