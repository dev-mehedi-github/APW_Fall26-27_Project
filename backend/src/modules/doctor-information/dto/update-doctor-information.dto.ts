import { IsUUID, IsString, IsOptional, IsArray, ValidateNested, IsUrl,} from "class-validator";
import { Type } from "class-transformer";
import { EducationDto, ExperienceDto, CertificationDto,} from "./create-doctor-information.dto";

export class UpdateDoctorInformationDto {
    @IsOptional()
    @IsUUID()
    doctorId?: string;

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