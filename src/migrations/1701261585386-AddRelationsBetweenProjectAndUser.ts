import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRelationsBetweenProjectAndUser1701261585386 implements MigrationInterface {
    name = 'AddRelationsBetweenProjectAndUser1701261585386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_284d88f48163afb6eea98c8b0fc" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_284d88f48163afb6eea98c8b0fc"`);
    }

}
