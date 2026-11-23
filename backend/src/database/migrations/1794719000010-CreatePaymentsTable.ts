
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePaymentsTable1794719000010
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),

        "invoiceId" UUID NOT NULL,
        "patientId" UUID NOT NULL,
        "recordedById" UUID NOT NULL,

        "amount" NUMERIC(10,2) NOT NULL,
        "paymentMethod" VARCHAR(30) NOT NULL,
        "status" VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',

        "transactionReference" VARCHAR(120),
        "notes" TEXT,

        "paidAt" TIMESTAMP NOT NULL DEFAULT now(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_payments"
          PRIMARY KEY ("id"),

        CONSTRAINT "UQ_payments_invoice"
          UNIQUE ("invoiceId"),

        CONSTRAINT "UQ_payments_transaction_reference"
          UNIQUE ("transactionReference"),

        CONSTRAINT "FK_payment_invoice"
          FOREIGN KEY ("invoiceId")
          REFERENCES "invoices"("id")
          ON DELETE RESTRICT,

        CONSTRAINT "FK_payment_patient"
          FOREIGN KEY ("patientId")
          REFERENCES "users"("id")
          ON DELETE RESTRICT,

        CONSTRAINT "FK_payment_recorded_by"
          FOREIGN KEY ("recordedById")
          REFERENCES "users"("id")
          ON DELETE RESTRICT,

        CONSTRAINT "CHK_payment_amount"
          CHECK ("amount" > 0),

        CONSTRAINT "CHK_payment_method"
          CHECK (
            "paymentMethod" IN (
              'CASH',
              'CARD',
              'BANK_TRANSFER',
              'MOBILE_BANKING'
            )
          ),

        CONSTRAINT "CHK_payment_status"
          CHECK ("status" = 'COMPLETED')
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payments_patient"
      ON "payments" ("patientId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payments_paid_at"
      ON "payments" ("paidAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "payments"
    `);
  }
}
