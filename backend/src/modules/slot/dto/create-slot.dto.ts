

import { IsDateString, IsUUID, } from "class-validator";

export class CreateSlotDto {
    @IsUUID()
    doctorId!: string;

    @IsDateString()
    startTime!: string;

    @IsDateString()
    endTime!: string;
}
