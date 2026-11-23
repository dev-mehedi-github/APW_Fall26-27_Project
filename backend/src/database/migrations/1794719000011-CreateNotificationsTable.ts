
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationsTable1794719000011
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),

        "recipientId" UUID NOT NULL,
        "createdById" UUID,

        "type" VARCHAR(30) NOT NULL,
        "title" VARCHAR(180) NOT NULL,
        "message" TEXT NOT NULL,
        "actionUrl" VARCHAR(255),

        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "readAt" TIMESTAMP,

        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_notifications"
          PRIMARY KEY ("id"),

        CONSTRAINT "FK_notification_recipient"
          FOREIGN KEY ("recipientId")
          REFERENCES "users"("id")
          ON DELETE CASCADE,

        CONSTRAINT "FK_notification_creator"
          FOREIGN KEY ("createdById")
          REFERENCES "users"("id")
          ON DELETE SET NULL,

        CONSTRAINT "CHK_notification_type"
          CHECK (
            "type" IN (
              'APPOINTMENT',
              'LAB_REPORT',
              'INVOICE',
              'PAYMENT',
              'GENERAL'
            )
          )
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_recipient"
      ON "notifications" ("recipientId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_is_read"
      ON "notifications" ("isRead")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_created_at"
      ON "notifications" ("createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "notifications"
    `);
  }
}
