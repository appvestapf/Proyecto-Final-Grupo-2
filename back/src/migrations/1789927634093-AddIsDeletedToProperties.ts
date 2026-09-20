import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsDeletedToProperties1789927634093 implements MigrationInterface {
    name = 'AddIsDeletedToProperties1789927634093'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" ADD "isDeleted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "isDeleted"`);
    }

}
