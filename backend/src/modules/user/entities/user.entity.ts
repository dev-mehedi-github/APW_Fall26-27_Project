
import { Column,CreateDateColumn,Entity,PrimaryGeneratedColumn,UpdateDateColumn, } from "typeorm";

export enum UserRole {
    ADMIN = "ADMIN",
    DOCTOR = "DOCTOR",
    PATIENT = "PATIENT",
}

@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    fullName!: string;

    @Column({ type: "varchar", unique: true })
    email!: string;

    @Column()
    passwordHash!: string;

    @Column({ type: "varchar", length: 20, nullable: true })
    phone?: string;

    @Column({type: "varchar", length: 20,default: UserRole.PATIENT,})
    role!: UserRole;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}
