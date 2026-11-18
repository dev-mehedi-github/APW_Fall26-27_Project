
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { AppointmentStatus } from "../entities/appointment.entity";

export class UpdateAppointmentDto {
    @IsOptional()
    @IsEnum(AppointmentStatus)
    status?: AppointmentStatus;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    reason?: string;
}
