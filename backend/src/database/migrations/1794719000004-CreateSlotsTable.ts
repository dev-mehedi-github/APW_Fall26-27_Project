
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSlotsTable1794719000004
    implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE "slots" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "doctorId" uuid NOT NULL,
        "startTime" TIMESTAMP NOT NULL,
        "endTime" TIMESTAMP NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'AVAILABLE',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_slots_id"
          PRIMARY KEY ("id"),

        CONSTRAINT "FK_slots_doctor"
          FOREIGN KEY ("doctorId")
          REFERENCES "doctors"("id")
          ON DELETE CASCADE,

        CONSTRAINT "UQ_doctor_slot_start"
          UNIQUE ("doctorId", "startTime")
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      DROP TABLE "slots"
    `);
    }
}
