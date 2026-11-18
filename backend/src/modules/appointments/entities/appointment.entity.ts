
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "../../user/entities/user.entity";
import { Slot } from "../../slot/entities/slot.entity";

export enum AppointmentStatus {
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

@Entity({ name: "appointments" })
export class Appointment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "patientId" })
  patient!: User;

  @ManyToOne(() => Slot, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "slotId" })
  slot!: Slot;

  @Column({
    type: "varchar",
    length: 20,
    default: AppointmentStatus.CONFIRMED,
  })
  status!: AppointmentStatus;

  @Column({ type: "text", nullable: true })
  reason?: string;

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
