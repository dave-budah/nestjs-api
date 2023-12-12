import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from '@app/article/dto/createarticle.dto';
import { ArticleEntity } from '@app/article/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '@app/user/user.entity';
import { ArticleResponseInterface } from '@app/article/types/articleresponse.interface';
import slugify from 'slugify';
import { ArticlesResponseInterface } from '@app/article/types/articlesresponse.interface';
import { FollowEntity } from '@app/profile/types/follow.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
    private dataSource: DataSource,
  ) {}

  // Create the feed
  async getFeed(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const follows = await this.followRepository.find({
      where: {
        followerId: currentUserId,
      },
    });
    if (follows.length === 0) {
      return {
        articles: [],
        articlesCount: 0,
      };
    }
    const followingUserIds = follows.map((follow) => follow.followingId);
    const queryBuilder = this.dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', { ids: followingUserIds });

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();
    return { articles, articlesCount };
  }
  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);
    if (!article.tagList) {
      article.tagList = [];
    }

    article.slug = this.getSlug(createArticleDto.title);
    article.author = currentUser;
    return await this.articleRepository.save(article);
  }
  //Update article
  async updateArticle(
    slug: string,
    updateArticleDto: CreateArticleDto,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException('You are not the author', HttpStatus.FORBIDDEN);
    }

    Object.assign(article, updateArticleDto);
    return await this.articleRepository.save(article);
  }

  // delete article
  async deleteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException('You are not the author', HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }
  // Find article by slug
  async findBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({ where: { slug } });
  }
  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  // Add article to favorites
  async addArticleToFavorites(
    slug: string,
    userId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });
    // Check if user already favorited an article
    const isNotFavorited =
      user.favorites.findIndex(
        (articleFavorites) => articleFavorites.id === article.id,
      ) === -1;

    // Check if user hasn't favorited an article -> like
    if (isNotFavorited) {
      user.favorites.push(article);
      article.favouriteCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }
    return article;
  }

  // Remove article from favorites
  async deleteArticleFromFavorites(
    slug: string,
    userId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });
    // Check if user already favorited an article
    const articleIndex = user.favorites.findIndex(
      (articleFavorites) => articleFavorites.id === article.id,
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favouriteCount--;
      await this.userRepository.save(user);
      await this.userRepository.save(article);
    }

    return article;
  }

  // Find all articles
  async findAll(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = this.dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    // Filter articles by tags
    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    // Filter by author
    if (query.author) {
      const author = await this.userRepository.findOne({
        where: { username: query.author },
      });
      queryBuilder.andWhere('articles.authorId = :id', {
        id: author.id,
      });
    }

    // Filter articles by favorites
    if (query.favorites) {
      const author = await this.userRepository.findOne({
        where: { username: query.favorites },
        relations: ['favorites'],
      });
      const ids = author.favorites.map((el) => el.id);
      if (ids.length > 0) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    // Order by latest post
    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    let favoriteIds: number[] = [];

    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['favorites'],
      });
      favoriteIds = currentUser.favorites.map((favorite) => favorite.id);
    }
    const articles = await queryBuilder.getMany();
    const articlesWithFavorited = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });
    return { articles: articlesWithFavorited, articlesCount };
  }

  // function to generate a unique slug
  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
