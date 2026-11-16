import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    fullName!: string;

    @IsEmail({}, { message: 'Please provide a valid email address' })
    @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
        message: 'Invalid email format',
    })
    @IsString()
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

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}
