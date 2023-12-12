import { ProjectEntity } from '@app/project/project.entity';

export interface ProjectsResponseInterface {
  projects: ProjectEntity[];
  projectsCount: number;
}
