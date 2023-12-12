import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProjectEntity } from '@app/project/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '@app/user/user.entity';
import { CreateProjectDto } from '@app/project/dto/createproject.dto';
import { ProjectResponseInterface } from '@app/project/types/projectresponse';
import slugify from 'slugify';
import { ProjectsResponseInterface } from '@app/project/types/projectsResponseInterface';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,
    private dataSource: DataSource,
  ) {}
  async createProject(
    currentUser: UserEntity,
    createProjectDto: CreateProjectDto,
  ): Promise<ProjectEntity> {
    const project = new ProjectEntity();
    Object.assign(project, createProjectDto);
    project.author = currentUser;
    project.slug = this.getSlug(createProjectDto.title);
    return await this.projectRepository.save(project);
  }

  // Find single project by slug
  async getProjectBySlug(slug: string): Promise<ProjectEntity> {
    return await this.projectRepository.findOne({ where: { slug } });
  }

  // Find all projects
  async findAll(
    currentUserId: number,
    query: any,
  ): Promise<ProjectsResponseInterface> {
    const queryBuilder = this.dataSource
      .getRepository(ProjectEntity)
      .createQueryBuilder('projects')
      .leftJoinAndSelect('projects.author', 'author');

    queryBuilder.orderBy('projects.createdAt', 'DESC');

    const projectsCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }
    const projects = await queryBuilder.getMany();

    return { projects, projectsCount };
  }

  // Update single project by slug
  async updateProject(
    slug: string,
    updateProjectDto: CreateProjectDto,
    currentUserId: number,
  ): Promise<ProjectEntity> {
    const project = await this.getProjectBySlug(slug);

    if (!project) {
      throw new HttpException('Project does not exist', HttpStatus.NOT_FOUND);
    }

    if (project.author.id !== currentUserId) {
      throw new HttpException('Action not authorized', HttpStatus.FORBIDDEN);
    }
    Object.assign(project, updateProjectDto);

    return await this.projectRepository.save(project);
  }

  // Delete project
  async deleteProject(
    slug: string,
    currentUserId: number,
  ): Promise<DeleteResult> {
    const project = await this.getProjectBySlug(slug);

    if (!project) {
      throw new HttpException('Project does not exist', HttpStatus.NOT_FOUND);
    }

    if (project.author.id !== currentUserId) {
      throw new HttpException('Action not authorized', HttpStatus.FORBIDDEN);
    }

    return await this.projectRepository.delete({ slug });
  }

  buildProjectResponse(project: ProjectEntity): ProjectResponseInterface {
    return {
      project,
    };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
