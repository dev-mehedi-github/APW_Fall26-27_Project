import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDoctorDepartmentsTable1794719000003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE "doctor_departments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "doctorId" uuid NOT NULL,
        "departmentId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_doctor_departments_id"
          PRIMARY KEY ("id"),

        CONSTRAINT "FK_doctor_departments_doctor"
          FOREIGN KEY ("doctorId")
          REFERENCES "doctors"("id")
          ON DELETE CASCADE,

        CONSTRAINT "FK_doctor_departments_department"
          FOREIGN KEY ("departmentId")
          REFERENCES "departments"("id")
          ON DELETE CASCADE,

        CONSTRAINT "UQ_doctor_department"
          UNIQUE ("doctorId", "departmentId")
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`  DROP TABLE "doctor_departments" `);
    }
}
