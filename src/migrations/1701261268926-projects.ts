import { MigrationInterface, QueryRunner } from "typeorm";

export class Projects1701261268926 implements MigrationInterface {
    name = 'Projects1701261268926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "projects" ("id" SERIAL NOT NULL, "slug" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "github" character varying NOT NULL, "site" character varying NOT NULL, "image" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer, CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "projects"`);
    }

}
