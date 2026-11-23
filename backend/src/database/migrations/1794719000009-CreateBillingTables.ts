
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBillingTables1794719000009
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "invoices" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "invoiceNumber" VARCHAR(40) NOT NULL,
        "patientId" UUID NOT NULL,
        "createdById" UUID NOT NULL,
        "appointmentId" UUID,
        "labOrderId" UUID,
        "subtotal" NUMERIC(10,2) NOT NULL,
        "discount" NUMERIC(10,2) NOT NULL DEFAULT 0,
        "total" NUMERIC(10,2) NOT NULL,
        "status" VARCHAR(20) NOT NULL DEFAULT 'ISSUED',
        "issuedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "dueAt" TIMESTAMP,
        "notes" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_invoices" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_invoices_number" UNIQUE ("invoiceNumber"),

        CONSTRAINT "FK_invoice_patient"
          FOREIGN KEY ("patientId")
          REFERENCES "users"("id") ON DELETE RESTRICT,

        CONSTRAINT "FK_invoice_creator"
          FOREIGN KEY ("createdById")
          REFERENCES "users"("id") ON DELETE RESTRICT,

        CONSTRAINT "FK_invoice_appointment"
          FOREIGN KEY ("appointmentId")
          REFERENCES "appointments"("id") ON DELETE RESTRICT,

        CONSTRAINT "FK_invoice_lab_order"
          FOREIGN KEY ("labOrderId")
          REFERENCES "lab_orders"("id") ON DELETE RESTRICT,

        CONSTRAINT "CHK_invoice_source"
          CHECK (
            ("appointmentId" IS NOT NULL AND "labOrderId" IS NULL)
            OR
            ("appointmentId" IS NULL AND "labOrderId" IS NOT NULL)
          ),

        CONSTRAINT "CHK_invoice_status"
          CHECK ("status" IN ('ISSUED', 'PAID', 'CANCELLED')),

        CONSTRAINT "CHK_invoice_amounts"
          CHECK ("subtotal" >= 0 AND "discount" >= 0 AND "total" >= 0)
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_invoice_appointment"
      ON "invoices" ("appointmentId")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_invoice_lab_order"
      ON "invoices" ("labOrderId")
    `);

    await queryRunner.query(`
      CREATE TABLE "invoice_items" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "invoiceId" UUID NOT NULL,
        "description" VARCHAR(180) NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "unitPrice" NUMERIC(10,2) NOT NULL,
        "lineTotal" NUMERIC(10,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_invoice_items" PRIMARY KEY ("id"),

        CONSTRAINT "FK_invoice_items_invoice"
          FOREIGN KEY ("invoiceId")
          REFERENCES "invoices"("id") ON DELETE CASCADE,

        CONSTRAINT "CHK_invoice_item_quantity"
          CHECK ("quantity" > 0),

        CONSTRAINT "CHK_invoice_item_prices"
          CHECK ("unitPrice" >= 0 AND "lineTotal" >= 0)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoices"`);
  }
}
