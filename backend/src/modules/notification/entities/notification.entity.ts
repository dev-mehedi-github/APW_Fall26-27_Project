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

export enum NotificationType {
  APPOINTMENT = "APPOINTMENT",
  LAB_REPORT = "LAB_REPORT",
  INVOICE = "INVOICE",
  PAYMENT = "PAYMENT",
  GENERAL = "GENERAL",
}

@Entity({ name: "notifications" })
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "recipientId" })
  recipient!: User;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "createdById" })
  createdBy?: User | null;

  @Column({ type: "varchar", length: 30 })
  type!: NotificationType;

  @Column({ type: "varchar", length: 180 })
  title!: string;

  @Column({ type: "text" })
  message!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  actionUrl?: string | null;

  @Column({ type: "boolean", default: false })
  isRead!: boolean;

  @Column({ type: "timestamp", nullable: true })
  readAt?: Date | null;

  @CreateDateColumn({ type: "timestamp", name: "createdAt" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updatedAt" })
  updatedAt!: Date;
}
