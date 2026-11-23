
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { LabOrder } from "./lab-order.entity";
import { LabTest } from "./lab-test.entity";

@Entity({ name: "lab_order_items" })
export class LabOrderItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Parent laboratory order
  @ManyToOne(
    () => LabOrder,
    (labOrder) => labOrder.items,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "labOrderId" })
  labOrder!: LabOrder;

  // Selected laboratory test
  @ManyToOne(
    () => LabTest,
    { onDelete: "RESTRICT" },
  )
  @JoinColumn({ name: "labTestId" })
  labTest!: LabTest;

  // Preserve test details at the time of ordering
  @Column({ type: "varchar", length: 150 })
  testName!: string;

  @Column({ type: "varchar", length: 30 })
  testCode!: string;

  // Price snapshot at the time of ordering
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
  })
  unitPrice!: string;

  @Column({ type: "int", default: 1 })
  quantity!: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
  })
  subtotal!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
