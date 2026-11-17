import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, } from "class-validator";

export class CreateDepartmentDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;
}
