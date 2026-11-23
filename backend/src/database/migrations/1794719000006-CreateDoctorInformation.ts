
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDoctorInformation1794719000006
  implements MigrationInterface
{

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "doctor_information" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "doctorId" UUID NOT NULL,
        "bmdcNumber" VARCHAR UNIQUE,
        "about" TEXT,
        "education" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "experience" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "certifications" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "achievements" TEXT,
        "languages" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "professionalAddress" TEXT,
        "profileImage" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_doctor_information"
          PRIMARY KEY ("id"),

        CONSTRAINT "UQ_doctor_information_doctorId"
          UNIQUE ("doctorId"),

        CONSTRAINT "FK_doctor_information_doctor"
          FOREIGN KEY ("doctorId")
          REFERENCES "doctors"("id")
          ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "doctor_information";
    `);
  }
}
