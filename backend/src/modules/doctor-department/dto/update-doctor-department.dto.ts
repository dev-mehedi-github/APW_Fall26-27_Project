import { IsOptional, IsUUID } from "class-validator";

export class UpdateDoctorDepartmentDto {
    @IsOptional()
    @IsUUID()
    doctorId?: string;

    @IsOptional()
    @IsUUID()
    departmentId?: string;
}
