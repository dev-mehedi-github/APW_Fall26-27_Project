import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "../../user/entities/user.entity";
import { LabOrderItem } from "../../laboratory/entities/lab-order-item.entity";

export enum LabReportStatus {
  DRAFT = "DRAFT",
  RELEASED = "RELEASED",
}

@Entity({ name: "lab_reports" })
export class LabReport {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // One report is created for one test item in a laboratory order.
  @OneToOne(() => LabOrderItem, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "labOrderItemId" })
  labOrderItem!: LabOrderItem;

  // Admin user who entered the result.
  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "createdById" })
  createdBy!: User;

  @Column({ type: "text" })
  result!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  unit?: string;

  @Column({ type: "varchar", length: 150, nullable: true })
  referenceRange?: string;

  @Column({ type: "text", nullable: true })
  interpretation?: string;

  @Column({ type: "text", nullable: true })
  remarks?: string;

  @Column({
    type: "varchar",
    length: 20,
    default: LabReportStatus.DRAFT,
  })
  status!: LabReportStatus;

  @Column({ type: "timestamp", nullable: true })
  releasedAt?: Date | null;

  @CreateDateColumn({ type: "timestamp", name: "createdAt" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updatedAt" })
  updatedAt!: Date;
}
