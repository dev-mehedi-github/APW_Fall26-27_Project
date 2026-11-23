import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateAppointmentInvoiceDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
