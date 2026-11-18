
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateAppointmentDto {
    @IsUUID()
    @IsNotEmpty()
    slotId!: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(1000)
    reason?: string;
}
