import { IsOptional, IsString, MaxLength, MinLength, IsNotEmpty, } from "class-validator";

export class UpdateDepartmentDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;
}
