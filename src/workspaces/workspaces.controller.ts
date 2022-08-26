import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  ForbiddenException,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../users/decorators/user.decorator';
import { UsersIdsDto } from '../users/dto/usersIds.dto';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';
import { UpdateTaskDto } from 'src/tasks/dto/update-task.dto';

@ApiTags('workspaces')
@ApiBearerAuth()
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(createWorkspaceDto, user);
  }

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.workspacesService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.workspacesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(+id, updateWorkspaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workspacesService.remove(+id);
  }

  //////////////////////////// workspace users ///////////////////////////

  @Get(':id/users')
  getWorkspaceUsers(@Param('id') id: string) {
    return this.workspacesService.getWorkspaceUsers(+id);
  }

  @Put(':id/users')
  async updateWorkspaceUsers(
    @Param('id') id: number,
    @Body() usersIdsDto: UsersIdsDto,
    @CurrentUser() currentUser: User,
  ) {
    const workspace = await this.workspacesService.findOne(+id);
    if (workspace.creator !== currentUser) {
      throw new ForbiddenException(
        'only the workspace creator can add or remove users',
      );
    }
    return this.workspacesService.updateWorkspaceUsers(+id, usersIdsDto);
  }

  // @Post(':id/users')
  // addUsersFromWorkspace(@Param('id') id: string, @Body() userIdsDto: UserIdsDto) {
  //   return this.workspacesService.add_users(+id, userIdsDto);
  // }

  // @Delete(':id/users')
  // removeUsersFromWorkspace(@Param('id') id: string, @Body() userIdsDto: UserIdsDto) {
  //   return this.workspacesService.remove_users(+id, userIdsDto);
  // }

  ////////////////////////////// workspace tasks /////////////////////////////////////

  @Post(':id/tasks')
  async createTask(
    @Param('id') id: number,
    @CurrentUser() user: User,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const workspace = await this.workspacesService.findOne(id);
    const isUserInWorkspace = this.workspacesService.checkIfUserInWorkspace(
      user,
      workspace,
    );
    if (!isUserInWorkspace) {
      if (workspace.creator !== user) {
        throw new ForbiddenException(
          'only users in workspace can post tasks in it',
        );
      }
    }
    return this.workspacesService.createTask(workspace, createTaskDto, user);
  }

  @Get(':id/tasks')
  findAllTasks(
    @Param('id') id: number,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.workspacesService.findAllTasksInWorkspace(id, paginationQuery);
  }

  // @Get(':id/tasks/:task_id')
  // findOneTask(@Param('id') id: string) {
  //   return this.tasksService.findOne(+id);
  // }

  // @Patch(':id/tasks/:task_id')
  // updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
  //   return this.tasksService.update(+id, updateTaskDto);
  // }

  // @Delete(':id/tasks/:task_id')
  // removeTask(@Param('id') id: string) {
  //   return this.tasksService.remove(+id);
  // }
}
