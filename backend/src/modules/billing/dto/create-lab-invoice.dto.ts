import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateLabInvoiceDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
