
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "../../user/entities/user.entity";
import { Doctor } from "../../doctor/entities/doctor.entity";
import { Appointment } from "../../appointments/entities/appointment.entity";
import { LabOrderItem } from "./lab-order-item.entity";

export enum LabOrderStatus {
  PENDING = "PENDING",
  SAMPLE_COLLECTED = "SAMPLE_COLLECTED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

@Entity({ name: "lab_orders" })
export class LabOrder {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Patient who requested the laboratory service
  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "patientId" })
  patient!: User;

  // Doctor who ordered the laboratory tests
  @ManyToOne(() => Doctor, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "doctorId" })
  doctor!: Doctor;

  // Optional appointment associated with this order
  @ManyToOne(() => Appointment, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "appointmentId" })
  appointment?: Appointment;

  // Individual tests included in this order
  @OneToMany(
    () => LabOrderItem,
    (item) => item.labOrder,
    { cascade: true },
  )
  items!: LabOrderItem[];

  @Column({
    type: "varchar",
    length: 30,
    default: LabOrderStatus.PENDING,
  })
  status!: LabOrderStatus;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalAmount!: string;

  @Column({ type: "text", nullable: true })
  notes?: string;

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
