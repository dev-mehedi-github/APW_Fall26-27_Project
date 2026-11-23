import {
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class UpdateLabReportDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  result?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  referenceRange?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  interpretation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  remarks?: string;
}
