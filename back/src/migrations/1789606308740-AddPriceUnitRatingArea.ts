import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriceUnitRatingArea1789606308740 implements MigrationInterface {
  name = 'AddPriceUnitRatingArea1789606308740';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "properties" ADD "priceUnit" character varying(10) NOT NULL DEFAULT 'noche'`,
    );
    await queryRunner.query(
      `ALTER TABLE "properties" ADD "area" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "properties" ADD "rating" numeric(3,2) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "rating"`);
    await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "area"`);
    await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "priceUnit"`);
  }
}
