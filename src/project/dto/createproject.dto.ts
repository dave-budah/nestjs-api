import { IsNotEmpty } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  readonly title: string;

  readonly description?: string;

  @IsNotEmpty()
  readonly image: string;

  @IsNotEmpty()
  readonly github: string;

  readonly site: string;
}
