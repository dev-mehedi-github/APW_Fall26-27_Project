import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength,} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    fullName?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(150)
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    @MaxLength(72)
    password?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
