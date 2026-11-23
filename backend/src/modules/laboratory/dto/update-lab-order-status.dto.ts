
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

import { LabOrderStatus } from "../entities/lab-order.entity";

export class UpdateLabOrderStatusDto {
  @IsEnum(LabOrderStatus)
  status!: LabOrderStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
