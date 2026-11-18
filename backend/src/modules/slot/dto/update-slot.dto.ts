

import { IsDateString, IsOptional, IsUUID, } from "class-validator";

export class UpdateSlotDto {
    @IsOptional()
    @IsUUID()
    doctorId?: string;

    @IsOptional()
    @IsDateString()
    startTime?: string;

    @IsOptional()
    @IsDateString()
    endTime?: string;
}
