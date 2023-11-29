import { MigrationInterface, QueryRunner } from 'typeorm';

export class Projects1699799231879 implements MigrationInterface {
  name = 'Projects1699799231879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "projects" ("id" SERIAL NOT NULL, "slug" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "link" character varying NOT NULL, "image" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer, CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_284d88f48163afb6eea98c8b0fc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b3bc5ca3e98f5f3858dbf626ad"`,
    );
    await queryRunner.query(`DROP TABLE "projects"`);
  }
}
