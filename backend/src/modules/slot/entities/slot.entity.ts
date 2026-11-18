
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

import { Doctor } from "../../doctor/entities/doctor.entity";

export enum SlotStatus {
  AVAILABLE = "AVAILABLE",
  BOOKED = "BOOKED",
}

@Entity({ name: "slots" })
@Unique("UQ_doctor_slot_start", ["doctor", "startTime"])
export class Slot {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Doctor, { onDelete: "CASCADE" })
  @JoinColumn({ name: "doctorId" })
  doctor!: Doctor;

  @Column({ type: "timestamp", name: "startTime" })
  startTime!: Date;

  @Column({ type: "timestamp", name: "endTime" })
  endTime!: Date;

  @Column({
    type: "varchar",
    length: 20,
    default: SlotStatus.AVAILABLE,
  })
  status!: SlotStatus;

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
