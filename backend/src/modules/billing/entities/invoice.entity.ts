import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "../../user/entities/user.entity";
import { Appointment } from "../../appointments/entities/appointment.entity";
import { LabOrder } from "../../laboratory/entities/lab-order.entity";
import { InvoiceItem } from "./invoice-item.entity";

export enum InvoiceStatus {
  ISSUED = "ISSUED",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

@Entity({ name: "invoices" })
@Index("UQ_invoices_appointment", ["appointment"], { unique: true })
@Index("UQ_invoices_lab_order", ["labOrder"], { unique: true })
@Check(
  "CHK_invoices_one_source",
  `(("appointmentId" IS NOT NULL AND "labOrderId" IS NULL) OR ("appointmentId" IS NULL AND "labOrderId" IS NOT NULL))`,
)
@Check("CHK_invoices_amounts", `"subtotal" >= 0 AND "discount" >= 0 AND "total" >= 0`)
export class Invoice {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 40, unique: true })
  invoiceNumber!: string;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "patientId" })
  patient!: User;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "createdById" })
  createdBy!: User;

  @ManyToOne(() => Appointment, {
    nullable: true,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "appointmentId" })
  appointment?: Appointment | null;

  @ManyToOne(() => LabOrder, {
    nullable: true,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "labOrderId" })
  labOrder?: LabOrder | null;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, {
    cascade: ["insert", "update"],
  })
  items!: InvoiceItem[];

  @Column({ type: "decimal", precision: 10, scale: 2 })
  subtotal!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: "0.00" })
  discount!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total!: string;

  @Column({
    type: "varchar",
    length: 20,
    default: InvoiceStatus.ISSUED,
  })
  status!: InvoiceStatus;

  @Column({ type: "timestamp", name: "issuedAt", default: () => "CURRENT_TIMESTAMP" })
  issuedAt!: Date;

  @Column({ type: "timestamp", name: "dueAt", nullable: true })
  dueAt?: Date | null;

  @Column({ type: "text", nullable: true })
  notes?: string;

  @CreateDateColumn({ type: "timestamp", name: "createdAt" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updatedAt" })
  updatedAt!: Date;
}
