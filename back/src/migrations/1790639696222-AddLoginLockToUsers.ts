import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLoginLockToUsers1790639696222 implements MigrationInterface {
    name = 'AddLoginLockToUsers1790639696222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "failedLoginAttempts" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lockedUntil" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lockedUntil"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "failedLoginAttempts"`);
    }

}
