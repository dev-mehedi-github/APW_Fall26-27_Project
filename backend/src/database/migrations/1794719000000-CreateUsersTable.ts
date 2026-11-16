import { MigrationInterface, QueryRunner,Table,} from "typeorm";

export class CreateUsersTable1794719000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',);

        await queryRunner.createTable(
            new Table({
                name: "users",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "full_name",
                        type: "varchar",
                        length: "100",
                    },
                    {
                        name: "email",
                        type: "varchar",
                        length: "150",
                    },
                    {
                        name: "password_hash",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "phone",
                        type: "varchar",
                        length: "20",
                        isNullable: true,
                    },
                    {
                        name: "role",
                        type: "varchar",
                        length: "20",
                        default: "'PATIENT'",
                    },
                    {
                        name: "is_active",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
                indices: [
                    {
                        name: "UQ_users_email",
                        columnNames: ["email"],
                        isUnique: true,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("users");
    }
}
