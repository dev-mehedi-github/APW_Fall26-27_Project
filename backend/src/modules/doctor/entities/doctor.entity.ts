import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity({ name: "doctors" })
export class Doctor {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @OneToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column()
    specialization!: string;

    @Column()
    qualification!: string;

    @Column({ name: "experienceYears", type: "int", default: 0 })
    experienceYears!: number;

    @Column({ name: "consultationFee", type: "decimal", precision: 10, scale: 2, default: 0 })
    consultationFee!: number;

    @Column({ type: "text", nullable: true })
    bio?: string;

    @CreateDateColumn({ name: "createdAt", type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updatedAt", type: "timestamp" })
    updatedAt!: Date;
}
