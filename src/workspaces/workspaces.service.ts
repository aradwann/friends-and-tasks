import {
  BadRequestException,
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
import { UpdateTaskDto } from 'src/tasks/dto/update-task.dto';

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

  async findUserWorkspaces(user: User) {
    const createdWorkspaces = await this.usersService.findWorkspacesCreate(
      user,
    );
    const joinedWorkspaces = await this.usersService.findWorkspacesJoined(user);
    return [...createdWorkspaces, ...joinedWorkspaces];
  }
  async findUserCreatedWorkspaces(user: User) {
    const createdWorkspaces = await this.usersService.findWorkspacesCreate(
      user,
    );
    return createdWorkspaces;
  }
  async findUserJoinedWorkspaces(user: User) {
    const joinedWorkspaces = await this.usersService.findWorkspacesJoined(user);
    return joinedWorkspaces;
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

  //////////////////////// users //////////////////////////////
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

  async addUserToWorkspace(id: number, username: string) {
    // find the workspace and get it
    const workspace = await this.findOne(id);

    // get the list of users but their ids
    const user = await this.usersService.findOneByUsernameWithPassword(
      username,
    );

    // push those users to the workspace users array
    workspace.users.push(user);

    // save changes to the database and return the saved workspace
    return await this.workspaceRepo.save(workspace);
  }

  async removeUserFromWorkspace(id: number, username: string) {
    // find the workspace and get it
    const workspace = await this.findOne(id);

    // filter the workspace users and return those who doesn't match the removed user username
    const remainedUsers = workspace.users.filter(
      (user) => user.username !== username,
    );

    workspace.users = remainedUsers;

    return this.workspaceRepo.save(workspace);
  }

  /**
   * check if the user in workspace
   * @param user user
   * @param workspace workspace
   * @returns boolean
   */
  checkIfUserInWorkspace(user: User, workspace: Workspace) {
    const workspaceUsersIdArr = workspace.users.map((user) => user.id);
    return workspaceUsersIdArr.includes(user.id);
  }
  /**
   * check if each user in the users array is in the workspace
   * @param users the users array
   * @param workspace workspace
   * @returns an array of user ids that's not in the workspace
   */
  checkIfUserArrayInWorkspace(users: User[], workspace: Workspace) {
    const notInWorkspaceArr = users.map((user) => {
      if (!this.checkIfUserInWorkspace(user, workspace)) {
        return user.id;
      }
    });
    return notInWorkspaceArr;
  }

  ///////////////////////////////// tasks ////////////////////////

  async checkIfUserIsTaskAssignorORWorkspaceCreator(
    workspaceId: number,
    taskId: number,
    user: User,
  ) {
    const workspace = await this.findOne(workspaceId);
    const task = await this.findTaskInWorkspace(workspaceId, taskId);

    if (user !== task.assignor && user !== workspace.creator) {
      return false;
    }
    return true;
  }

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
    const tasks = await this.tasksService.findAllTasksInWorkspace(
      workspaceId,
      paginationQuery,
    );

    return tasks;
  }

  async findTaskInWorkspace(workspaceId: number, taskId: number) {
    const task = this.tasksService.findTaskInWorkspace(workspaceId, taskId);
    return task;
  }

  async updateTaskInWorkspace(
    workspaceId,
    taskId,
    updateTaskDto: UpdateTaskDto,
  ) {
    const task = await this.findTaskInWorkspace(workspaceId, taskId);
    const workspace = await this.findOne(workspaceId);
    // get the array of assignees ids
    const usersArray = await this.usersService.findUsersByIdArray(
      updateTaskDto.assignees,
    );
    // check if all assignees in the workspace
    const idsNotFoundInWorkspace = this.checkIfUserArrayInWorkspace(
      usersArray,
      workspace,
    );
    if (idsNotFoundInWorkspace.length > 0) {
      throw new NotFoundException(
        `users with the ids ${idsNotFoundInWorkspace.toString()} are not found in the workspace`,
      );
    }
    return this.tasksService.update(taskId, updateTaskDto);
  }
  async deleteTaskFromWorkspace(workspaceId: number, taskId: number) {
    const task = await this.findTaskInWorkspace(workspaceId, taskId);
    return await this.tasksService.remove(task.id);
  }
}
