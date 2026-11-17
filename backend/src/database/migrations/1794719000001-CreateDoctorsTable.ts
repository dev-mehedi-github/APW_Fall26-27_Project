import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDoctorsTable1794719000001
    implements MigrationInterface {
    name = "CreateDoctorsTable1794719000001";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE "doctors" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "specialization" varchar(100) NOT NULL,
        "qualification" varchar(150) NOT NULL,
        "experienceYears" integer NOT NULL DEFAULT 0,
        "consultationFee" numeric(10,2) NOT NULL DEFAULT 0,
        "bio" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_doctors_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_doctors_userId" UNIQUE ("userId"),
        CONSTRAINT "FK_doctors_userId"
          FOREIGN KEY ("userId")
          REFERENCES "users"("id")
          ON DELETE CASCADE
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "doctors"`);
    }
}
