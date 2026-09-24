import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReservationDatesAndPrice1790183082437 implements MigrationInterface {
    name = 'AddReservationDatesAndPrice1790183082437'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" ADD "startDate" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD "endDate" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD "nights" integer`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD "totalPrice" numeric(10,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" DROP COLUMN "totalPrice"`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP COLUMN "nights"`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP COLUMN "endDate"`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP COLUMN "startDate"`);
    }

}
