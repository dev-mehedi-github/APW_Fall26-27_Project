import { IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength,} from "class-validator";

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  specialization?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  qualification?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  experienceYears?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  consultationFee?: number;

  @IsOptional()
  @IsString()
  bio?: string;
}
