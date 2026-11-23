
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum LabTestCategory {
  BLOOD = "BLOOD",
  URINE = "URINE",
  BIOCHEMISTRY = "BIOCHEMISTRY",
  HORMONE = "HORMONE",
  OTHER = "OTHER",
}

@Entity({ name: "lab_tests" })
export class LabTest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 30, unique: true })
  testCode!: string;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({
    type: "varchar",
    length: 30,
  })
  category!: LabTestCategory;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
  })
  price!: number;

  @Column({ type: "varchar", length: 100 })
  sampleType!: string;

  @Column({ type: "text", nullable: true })
  preparationInstructions?: string;

  @Column({ type: "int", default: 24 })
  turnaroundTimeHours!: number;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
