
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLaboratoryTables1794719000007
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {

    // 1. Laboratory test catalogue
    await queryRunner.query(`
      CREATE TABLE "lab_tests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "test_code" varchar(30) NOT NULL,
        "name" varchar(150) NOT NULL,
        "category" varchar(30) NOT NULL,
        "description" text,
        "price" numeric(10,2) NOT NULL,
        "sample_type" varchar(100) NOT NULL,
        "preparation_instructions" text,
        "turnaround_time_hours" integer NOT NULL DEFAULT 24,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_lab_tests_id"
          PRIMARY KEY ("id"),

        CONSTRAINT "UQ_lab_tests_test_code"
          UNIQUE ("test_code"),

        CONSTRAINT "CHK_lab_tests_price"
          CHECK ("price" >= 0)
      )
    `);

    // 2. Laboratory orders
    await queryRunner.query(`
      CREATE TABLE "lab_orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patientId" uuid NOT NULL,
        "doctorId" uuid NOT NULL,
        "appointmentId" uuid,
        "status" varchar(30) NOT NULL DEFAULT 'PENDING',
        "total_amount" numeric(10,2) NOT NULL DEFAULT 0,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_lab_orders_id"
          PRIMARY KEY ("id"),

        CONSTRAINT "CHK_lab_orders_total_amount"
          CHECK ("total_amount" >= 0),

        CONSTRAINT "FK_lab_orders_patient"
          FOREIGN KEY ("patientId")
          REFERENCES "users"("id")
          ON DELETE RESTRICT,

        CONSTRAINT "FK_lab_orders_doctor"
          FOREIGN KEY ("doctorId")
          REFERENCES "doctors"("id")
          ON DELETE RESTRICT,

        CONSTRAINT "FK_lab_orders_appointment"
          FOREIGN KEY ("appointmentId")
          REFERENCES "appointments"("id")
          ON DELETE SET NULL
      )
    `);

    // 3. Individual tests inside laboratory orders
    await queryRunner.query(`
      CREATE TABLE "lab_order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "labOrderId" uuid NOT NULL,
        "labTestId" uuid NOT NULL,
        "test_name" varchar(150) NOT NULL,
        "test_code" varchar(30) NOT NULL,
        "unit_price" numeric(10,2) NOT NULL,
        "quantity" integer NOT NULL DEFAULT 1,
        "subtotal" numeric(10,2) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_lab_order_items_id"
          PRIMARY KEY ("id"),

        CONSTRAINT "CHK_lab_order_items_quantity"
          CHECK ("quantity" > 0),

        CONSTRAINT "CHK_lab_order_items_price"
          CHECK ("unit_price" >= 0 AND "subtotal" >= 0),

        CONSTRAINT "FK_lab_order_items_order"
          FOREIGN KEY ("labOrderId")
          REFERENCES "lab_orders"("id")
          ON DELETE CASCADE,

        CONSTRAINT "FK_lab_order_items_test"
          FOREIGN KEY ("labTestId")
          REFERENCES "lab_tests"("id")
          ON DELETE RESTRICT
      )
    `);

    // Indexes for frequently queried relationships
    await queryRunner.query(`
      CREATE INDEX "IDX_lab_orders_patient"
      ON "lab_orders" ("patientId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_lab_orders_doctor"
      ON "lab_orders" ("doctorId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_lab_order_items_order"
      ON "lab_order_items" ("labOrderId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      DROP TABLE IF EXISTS "lab_order_items"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "lab_orders"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "lab_tests"
    `);
  }
}
