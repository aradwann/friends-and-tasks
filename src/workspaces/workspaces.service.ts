import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { UsersIdsDto } from '../users/dto/usersIds.dto';
import { Workspace } from './entities/workspace.entity';
import { TasksService } from 'src/tasks/tasks.service';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    private readonly usersService: UsersService,
    private readonly tasksService: TasksService,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, user: User) {
    // check if workspace with that title exists
    const workspace = await this.workspaceRepo.findOneBy({
      title: createWorkspaceDto.title,
    });
    if (workspace) {
      throw new BadRequestException(`title is already taken`);
    }

    const newWorkspace = this.workspaceRepo.create(createWorkspaceDto);
    newWorkspace.creator = user;
    return this.workspaceRepo.save(newWorkspace);
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.workspaceRepo.find({ skip: offset, take: limit });
  }

  /**
   * find one workspace with all its details (with the relations [users, tasks] on )
   * @param id
   * @returns workspace
   */
  async findOne(id: number) {
    const workspace = await this.workspaceRepo.findOne({
      where: { id },
      relations: {
        users: true,
        tasks: true,
      },
    });

    // throw 404 error id workspace is not found
    if (!workspace) {
      throw new NotFoundException(`workspace with id ${id} is not found`);
    }
    return workspace;
  }

  async update(id: number, updateWorkspaceDto: UpdateWorkspaceDto) {
    const workspace = await this.findOne(id);

    return this.workspaceRepo.update(id, updateWorkspaceDto);
  }

  async remove(id: number) {
    const workspace = await this.findOne(id);

    return this.workspaceRepo.remove(workspace);
  }

  async getWorkspaceUsers(id: number) {
    const workspace = await this.workspaceRepo.findOne({
      where: { id },
      relations: ['users'],
    });

    return workspace.users;
  }

  async updateWorkspaceUsers(id: number, usersIdsDto: UsersIdsDto) {
    // get the workspace from the database
    const workspace = await this.findOne(id);

    // get the new users list from the client
    const newUsersList = await this.usersService.findUsersByIdArray(
      usersIdsDto.usersIds,
    );
    // update the workspace object users
    workspace.users = newUsersList;

    // save the upated workspace in the database and return it
    return await this.workspaceRepo.save(workspace);
  }

  // async add_users(id: number, userIdsDto: UserIdsDto) {
  //   // find the workspace and get it
  //   const workspace = await this.findOne(id);

  //   // get the list of users but their ids
  //   const users = await this.usersService.findUsersByIdArray(
  //     userIdsDto.userIds,
  //   );

  //   // push those users to the workspace users array
  //   workspace.users.push(...users);

  //   // save changes to the database and return the saved workspace
  //   return await this.workspaceRepo.save(workspace);
  // }

  // async remove_users(id: number, userIdsDto: UserIdsDto) {
  //   // find the workspace and get it
  //   const workspace = await this.findOne(id);

  //   // push those users to the workspace users array
  //   const remainedUsers = workspace.users.filter(
  //     (user) => !userIdsDto.userIds.includes(user.id),
  //   );

  //   workspace.users = remainedUsers;

  //   return this.workspaceRepo.save(workspace);
  // }

  /**
   * check if the user in workspace
   * @param user user
   * @param workspace workspace
   * @returns boolean
   */
  checkIfUserInWorkspace(user: User, workspace: Workspace) {
    return workspace.users.includes(user);
  }

  //////////////// tasks ////////////////

  async createTask(
    workspace: Workspace,
    createTaskDto: CreateTaskDto,
    currentUser: User,
  ) {
    const newTask = await this.tasksService.create(
      createTaskDto,
      currentUser,
      workspace,
    );

    return newTask;
  }

  async findAllTasksInWorkspace(
    workspaceId: number,
    paginationQuery: PaginationQueryDto,
  ) {
    const workspace = this.tasksService.findAllTasksInWorkspace(
      workspaceId,
      paginationQuery,
    );
  }
}
