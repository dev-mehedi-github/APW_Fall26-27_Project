import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn, } from "typeorm";
import { Doctor } from "../../doctor/entities/doctor.entity";
import { Department } from "../../department/entities/department.entity";

@Entity({ name: "doctor_departments" })
@Unique("UQ_doctor_department", ["doctor", "department"])
export class DoctorDepartment {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Doctor, { onDelete: "CASCADE" })
    @JoinColumn({ name: "doctorId" })
    doctor!: Doctor;

    @ManyToOne(() => Department, { onDelete: "CASCADE" })
    @JoinColumn({ name: "departmentId" })
    department!: Department;

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
