
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAppointmentsTable1794719000005 implements MigrationInterface
{

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "appointments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patientId" uuid NOT NULL,
        "slotId" uuid NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'CONFIRMED',
        "reason" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_appointments_id"
          PRIMARY KEY ("id"),

        CONSTRAINT "FK_appointments_patient"
          FOREIGN KEY ("patientId")
          REFERENCES "users"("id")
          ON DELETE CASCADE,

        CONSTRAINT "FK_appointments_slot"
          FOREIGN KEY ("slotId")
          REFERENCES "slots"("id")
          ON DELETE RESTRICT,

        CONSTRAINT "UQ_appointments_slot"
          UNIQUE ("slotId")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "appointments"`);
  }
}
