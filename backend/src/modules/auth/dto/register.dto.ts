import { IsEmail, IsOptional, IsString, MaxLength, MinLength, } from "class-validator";

export class RegisterDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    fullName!: string;

    @IsEmail()
    @MaxLength(150)
    email!: string;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    password!: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;
}