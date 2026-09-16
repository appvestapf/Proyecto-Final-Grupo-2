import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePropertyFields1789523603317 implements MigrationInterface {
  name = 'UpdatePropertyFields1789523603317';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "properties" ADD "images" text array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "properties" ADD "name" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "properties" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "properties" ADD "description" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "properties" ALTER COLUMN "price" TYPE numeric(10,2)`,
    );
    await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "country"`);
    await queryRunner.query(
      `ALTER TABLE "properties" ADD "country" character varying(60) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "city"`);
    await queryRunner.query(
      `ALTER TABLE "properties" ADD "city" character varying(60) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "properties" DROP COLUMN "rentalType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "properties" ADD "rentalType" character varying(30) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "properties" DROP COLUMN "rentalType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "properties" ADD "rentalType" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "city"`);
    await queryRunner.query(
      `ALTER TABLE "properties" ADD "city" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "country"`);
    await queryRunner.query(
      `ALTER TABLE "properties" ADD "country" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "properties" ALTER COLUMN "price" TYPE numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "properties" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "properties" ADD "description" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "properties" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "images"`);
  }
}
