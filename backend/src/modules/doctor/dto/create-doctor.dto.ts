import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, } from "class-validator";

export class CreateDoctorDto {
    @IsUUID()
    userId!: string;

    @IsString()
    @MinLength(2)
    @MaxLength(100)
    specialization!: string;

    @IsString()
    @MinLength(2)
    @MaxLength(150)
    qualification!: string;

    @IsInt()
    @Min(0)
    @Max(60)
    experienceYears!: number;

    @IsNumber()
    @Min(0)
    consultationFee!: number;

    @IsOptional()
    @IsString()
    bio?: string;
}
