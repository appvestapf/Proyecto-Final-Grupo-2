import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveIncorrectReservationUser1789761367201
  implements MigrationInterface
{
  name = 'RemoveIncorrectReservationUser1789761367201';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "reservations"
      DROP COLUMN "user"
    `);

    await queryRunner.query(`
      DROP TYPE "public"."reservations_user_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."reservations_user_enum"
      AS ENUM('pending', 'confirmed', 'cancelled')
    `);

    await queryRunner.query(`
      ALTER TABLE "reservations"
      ADD "user" "public"."reservations_user_enum"
      NOT NULL DEFAULT 'pending'
    `);
  }
}