
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

import { LabTestCategory } from "../entities/lab-test.entity";

export class CreateLabTestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  testCode!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @IsEnum(LabTestCategory)
  category!: LabTestCategory;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  sampleType!: string;

  @IsOptional()
  @IsString()
  preparationInstructions?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(720)
  turnaroundTimeHours?: number;
}
