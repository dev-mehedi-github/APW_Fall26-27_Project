import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, } from "typeorm";

import { Doctor } from "../../doctor/entities/doctor.entity";

@Entity({ name: "doctor_information" })
export class DoctorInformation {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "doctorId", unique: true })
    doctorId!: string;

    @OneToOne(() => Doctor, { onDelete: "CASCADE" })
    @JoinColumn({ name: "doctorId" })
    doctor!: Doctor;

    @Column({ name: "bmdcNumber", unique: true, nullable: true })
    bmdcNumber?: string;

    @Column({ type: "text", nullable: true })
    about?: string;

    @Column({ type: "jsonb", default: [] })
    education!: {
        degree: string;
        institution: string;
        passingYear?: string;
        result?: string;
    }[];

    @Column({ type: "jsonb", default: [] })
    experience!: {
        position: string;
        workplace: string;
        startDate?: string;
        endDate?: string;
        description?: string;
    }[];

    @Column({ type: "jsonb", default: [] })
    certifications!: {
        title: string;
        institution?: string;
        year?: string;
    }[];

    @Column({ type: "text", nullable: true })
    achievements?: string;

    @Column({ type: "jsonb", default: [] })
    languages!: string[];

    @Column({ name: "professionalAddress", type: "text", nullable: true })
    professionalAddress?: string;

    @Column({ name: "profileImage", type: "text", nullable: true })
    profileImage?: string;

    @CreateDateColumn({ name: "createdAt", type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updatedAt", type: "timestamp" })
    updatedAt!: Date;
}