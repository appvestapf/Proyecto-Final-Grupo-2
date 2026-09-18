import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReservations1789672731363 implements MigrationInterface {
    name = 'CreateReservations1789672731363'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reservations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "propertyId" uuid NOT NULL, "status" character varying NOT NULL DEFAULT 'confirmed', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_da95cef71b617ac35dc5bcda243" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "priceUnit" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "area" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_aa0e1cc2c4f54da32bf8282154c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_e08fa0f116df5965c3dffc4b8e0" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_e08fa0f116df5965c3dffc4b8e0"`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_aa0e1cc2c4f54da32bf8282154c"`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "area" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "priceUnit" SET DEFAULT 'noche'`);
        await queryRunner.query(`DROP TABLE "reservations"`);
    }

}
