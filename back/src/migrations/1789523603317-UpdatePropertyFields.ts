import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePropertyFields1789523603317 implements MigrationInterface {
    name = 'UpdatePropertyFields1789523603317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(80) NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "address" character varying NOT NULL, "isAdmin" boolean NOT NULL DEFAULT false, "pfp" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "images" text array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "name" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "description" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "price" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "country" character varying(60) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "city" character varying(60) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "rentalType"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "rentalType" character varying(30) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "rentalType"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "rentalType" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "city" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "country" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "description" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "images"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
