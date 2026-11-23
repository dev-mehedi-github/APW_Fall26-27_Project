import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Invoice } from "./invoice.entity";

@Entity({ name: "invoice_items" })
export class InvoiceItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "invoiceId" })
  invoice!: Invoice;

  @Column({ type: "varchar", length: 180 })
  description!: string;

  @Column({ type: "int", default: 1 })
  quantity!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  unitPrice!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  lineTotal!: string;

  @CreateDateColumn({ type: "timestamp", name: "createdAt" })
  createdAt!: Date;
}
