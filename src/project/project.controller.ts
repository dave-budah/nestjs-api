import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put, Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ProjectService } from '@app/project/project.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorators';
import { CreateProjectDto } from '@app/project/dto/createproject.dto';
import { UserEntity } from '@app/user/user.entity';
import { ProjectResponseInterface } from '@app/project/types/projectresponse';
import { ProjectsResponseInterface } from '@app/project/types/projectsResponseInterface';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async findAll(@User('id') currentUserId: number, @Query() query: any): Promise<ProjectsResponseInterface> {
    return await this.projectService.findAll(currentUserId, query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async create(
    @User() currentUser: UserEntity,
    @Body('project') createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponseInterface> {
    const project = await this.projectService.createProject(
      currentUser,
      createProjectDto,
    );
    return this.projectService.buildProjectResponse(project);
  }

  @Get(':slug')
  async getSingleProject(
    @Param('slug') slug: string,
  ): Promise<ProjectResponseInterface> {
    const project = await this.projectService.getProjectBySlug(slug);
    return this.projectService.buildProjectResponse(project);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateProject(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
    @Body('project') updateProjectDto: CreateProjectDto,
  ) {
    const project = await this.projectService.updateProject(
      slug,
      updateProjectDto,
      currentUserId,
    );
    return await this.projectService.buildProjectResponse(project);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteProject(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ) {
    return await this.projectService.deleteProject(slug, currentUserId);
  }
}
