import { Injectable } from '@nestjs/common';
import { ProjectEntity } from '@app/project/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/user/user.entity';
import { CreateProjectDto } from '@app/project/dto/createproject.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,
  ) {}
  async createProject(
    currentUser: UserEntity,
    createProjectDto: CreateProjectDto,
  ): Promise<ProjectEntity> {
    const project = new ProjectEntity();
    Object.assign(project, createProjectDto);
    project.author = currentUser;

    return await this.projectRepository.save(project);
  }
}
