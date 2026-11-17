import { IsUUID } from "class-validator";

export class CreateDoctorDepartmentDto {
    @IsUUID()
    doctorId!: string;

    @IsUUID()
    departmentId!: string;
}
