import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFavoritesToUsers1790211903249 implements MigrationInterface {
    name = 'AddFavoritesToUsers1790211903249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_favorites" ("userId" uuid NOT NULL, "propertyId" uuid NOT NULL, CONSTRAINT "PK_54243be70e2519d7ff030d8ebbf" PRIMARY KEY ("userId", "propertyId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1dd5c393ad0517be3c31a7af83" ON "user_favorites"  ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_894f5677220eae9991714baedb" ON "user_favorites"  ("propertyId") `);
        await queryRunner.query(`ALTER TABLE "user_favorites" ADD CONSTRAINT "FK_1dd5c393ad0517be3c31a7af836" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_favorites" ADD CONSTRAINT "FK_894f5677220eae9991714baedb8" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_favorites" DROP CONSTRAINT "FK_894f5677220eae9991714baedb8"`);
        await queryRunner.query(`ALTER TABLE "user_favorites" DROP CONSTRAINT "FK_1dd5c393ad0517be3c31a7af836"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_894f5677220eae9991714baedb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1dd5c393ad0517be3c31a7af83"`);
        await queryRunner.query(`DROP TABLE "user_favorites"`);
    }

}
