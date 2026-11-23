import { IsUUID, IsString, IsOptional, IsArray, ValidateNested, IsUrl,} from "class-validator";
import { Type } from "class-transformer";

export class EducationDto {
    @IsString()
    degree!: string;

    @IsString()
    institution!: string;

    @IsOptional()
    @IsString()
    passingYear?: string;

    @IsOptional()
    @IsString()
    result?: string;
}

export class ExperienceDto {
    @IsString()
    position!: string;

    @IsString()
    workplace!: string;

    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;

    @IsOptional()
    @IsString()
    description?: string;
}

export class CertificationDto {
    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    institution?: string;

    @IsOptional()
    @IsString()
    year?: string;
}

export class CreateDoctorInformationDto {
    @IsUUID()
    doctorId!: string;

    @IsOptional()
    @IsString()
    bmdcNumber?: string;

    @IsOptional()
    @IsString()
    about?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EducationDto)
    education?: EducationDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExperienceDto)
    experience?: ExperienceDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CertificationDto)
    certifications?: CertificationDto[];

    @IsOptional()
    @IsString()
    achievements?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    languages?: string[];

    @IsOptional()
    @IsString()
    professionalAddress?: string;

    @IsOptional()
    @IsUrl()
    profileImage?: string;
}
