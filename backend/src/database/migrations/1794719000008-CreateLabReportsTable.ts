
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLabReportsTable1794719000008
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "lab_reports" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),

        "labOrderItemId" UUID NOT NULL,
        "createdById" UUID NOT NULL,

        "result" TEXT NOT NULL,
        "unit" VARCHAR(50),
        "reference_range" VARCHAR(150),
        "interpretation" TEXT,
        "remarks" TEXT,

        "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
        "released_at" TIMESTAMP,

        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_lab_reports"
          PRIMARY KEY ("id"),

        CONSTRAINT "UQ_lab_reports_order_item"
          UNIQUE ("labOrderItemId"),

        CONSTRAINT "FK_lab_reports_order_item"
          FOREIGN KEY ("labOrderItemId")
          REFERENCES "lab_order_items"("id")
          ON DELETE RESTRICT,

        CONSTRAINT "FK_lab_reports_created_by"
          FOREIGN KEY ("createdById")
          REFERENCES "users"("id")
          ON DELETE RESTRICT,

        CONSTRAINT "CHK_lab_reports_status"
          CHECK ("status" IN ('DRAFT', 'RELEASED'))
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_lab_reports_created_by"
      ON "lab_reports" ("createdById")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_lab_reports_status"
      ON "lab_reports" ("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "lab_reports"
    `);
  }
}
