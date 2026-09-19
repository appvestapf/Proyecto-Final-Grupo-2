import { MigrationInterface, QueryRunner } from "typeorm";

export class FixedReservationStatus1789760190482 implements MigrationInterface {
    name = 'FixedReservationStatus1789760190482'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" DROP COLUMN "user"`);
        await queryRunner.query(`DROP TYPE "public"."reservations_user_enum"`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."reservations_status_enum" AS ENUM('pending', 'confirmed', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD "status" "public"."reservations_status_enum" NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."reservations_status_enum"`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD "status" character varying NOT NULL DEFAULT 'confirmed'`);
        await queryRunner.query(`CREATE TYPE "public"."reservations_user_enum" AS ENUM('pending', 'confirmed', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD "user" "public"."reservations_user_enum" NOT NULL DEFAULT 'pending'`);
    }

}
