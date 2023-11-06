import { Controller, Get } from '@nestjs/common';
import { TagService } from '@app/tag/tag.service';

@Controller('tags')
export class TagController {
  constructor(private readonly tagsService: TagService) {}
  @Get()
  async findAll(): Promise<{ tags: string[] }> {
    const tags = await this.tagsService.findAll();
    return {
      tags: tags.map((tag) => tag.name),
    };
  }
}
