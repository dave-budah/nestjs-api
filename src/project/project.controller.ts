import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ProjectService } from '@app/project/project.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorators';
import { CreateProjectDto } from '@app/project/dto/createproject.dto';
import { UserEntity } from '@app/user/user.entity';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @User() currentUser: UserEntity,
    @Body('project') createProjectDto: CreateProjectDto,
  ): Promise<any> {
    return await this.projectService.createProject(
      currentUser,
      createProjectDto,
    );
  }
}
