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
import { Invoice } from "../../billing/entities/invoice.entity";

export enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  MOBILE_BANKING = "MOBILE_BANKING",
}

export enum PaymentStatus {
  COMPLETED = "COMPLETED",
}

@Entity({ name: "payments" })
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // One invoice can have only one completed payment in this version.
  @OneToOne(() => Invoice, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "invoiceId" })
  invoice!: Invoice;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "patientId" })
  patient!: User;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "recordedById" })
  recordedBy!: User;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
  })
  amount!: string;

  @Column({
    type: "varchar",
    length: 30,
  })
  paymentMethod!: PaymentMethod;

  @Column({
    type: "varchar",
    length: 30,
    default: PaymentStatus.COMPLETED,
  })
  status!: PaymentStatus;

  @Column({
    type: "varchar",
    length: 120,
    nullable: true,
    unique: true,
  })
  transactionReference?: string | null;

  @Column({ type: "text", nullable: true })
  notes?: string | null;

  @Column({ type: "timestamp", name: "paidAt", default: () => "CURRENT_TIMESTAMP" })
  paidAt!: Date;

  @CreateDateColumn({ type: "timestamp", name: "createdAt" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updatedAt" })
  updatedAt!: Date;
}
