import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, } from "typeorm";

@Entity({ name: "departments" })
export class Department {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 100, unique: true })
    name!: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    @CreateDateColumn({
        type: "timestamp",
        name: "createdAt",
    })
    createdAt!: Date;

    @UpdateDateColumn({
        type: "timestamp",
        name: "updatedAt",
    })
    updatedAt!: Date;
}
