
import {
  IsBoolean,
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

export class UpdateLabTestDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  testCode?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsEnum(LabTestCategory)
  category?: LabTestCategory;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  sampleType?: string;

  @IsOptional()
  @IsString()
  preparationInstructions?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(720)
  turnaroundTimeHours?: number;

 @IsOptional()
@IsBoolean()
isActive?: boolean;
}
