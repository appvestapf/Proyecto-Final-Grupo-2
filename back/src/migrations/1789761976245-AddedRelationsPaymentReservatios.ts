import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedRelationsPaymentReservatios1789761976245 implements MigrationInterface {
    name = 'AddedRelationsPaymentReservatios1789761976245'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."reservations_status_enum" AS ENUM('pending', 'confirmed', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD "status" "public"."reservations_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "reservationId"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "reservationId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_6bb61cbede7c869adde5587f345" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_6bb61cbede7c869adde5587f345"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "reservationId"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "reservationId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."reservations_status_enum"`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD "status" character varying NOT NULL DEFAULT 'confirmed'`);
    }

}
