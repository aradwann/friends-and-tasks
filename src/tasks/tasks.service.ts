import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    private readonly usersService: UsersService,
  ) {}

  ///////////////////// CREATE TASK ///////////////////////////////

  async create(createTaskDto: CreateTaskDto, user: User, workspace: Workspace) {
    const { assignees, ...restOfCreateDto } = createTaskDto;

    const newTask = this.taskRepo.create(restOfCreateDto);
    newTask.assignor = user;
    newTask.assignees = await this.usersService.findUsersByIdArray(assignees);
    newTask.workspace = workspace;

    return this.taskRepo.save(newTask);
  }

  //////////////////////////////// TASKS QUERIES ////////////////////////////

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.taskRepo.find({ skip: offset, take: limit });
  }

  findAllTasksInWorkspace(
    workspaceId: number,
    paginationQuery: PaginationQueryDto,
  ) {
    const { limit, offset } = paginationQuery;
    return this.taskRepo.find({
      skip: offset,
      take: limit,
      relations: { workspace: true },
      where: { workspace: { id: workspaceId } },
    });
  }

  async findOne(id: number) {
    const user = await this.taskRepo.findOneBy({ id });

    // throw 404 error id user is not found
    if (!user) {
      throw new NotFoundException(`user with id ${id} is not found`);
    }
    return user;
  }

  async findTaskInWorkspace(workspaceId: number, taskId: number) {
    const task = this.taskRepo.findOne({
      relations: { workspace: true },
      where: { id: taskId, workspace: { id: workspaceId } },
    });

    // throw 404 error id user is not found
    if (!task) {
      throw new NotFoundException(`task with id ${taskId} is not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    // extract the assignees (users) ids array from update dto
    const { assignees, ...restOfUpdateDto } = updateTaskDto;

    // grab user objects that match ids array from the database
    const usersAssignees = await this.usersService.findUsersByIdArray(
      assignees,
    );

    const task = await this.taskRepo.preload({
      id,
      ...restOfUpdateDto,
      assignees: usersAssignees,
    });
    // throw 404 error id task is not found
    if (!task) {
      throw new NotFoundException(`task with id ${id} is not found`);
    }

    return this.taskRepo.save(task);
  }

  async remove(id: number) {
    const task = await this.taskRepo.findOneBy({ id });

    // throw 404 error id task is not found
    if (!task) {
      throw new NotFoundException(`task with id ${id} is not found`);
    }
    return this.taskRepo.remove(task);
  }
}
