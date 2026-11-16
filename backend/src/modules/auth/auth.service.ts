import { Injectable, NotFoundException, UnauthorizedException, InternalServerErrorException, HttpException,} from "@nestjs/common";
import { UserService } from "@/modules/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { User, UserRole } from "../user/entities/user.entity";
import { appConfig } from "@/src/config";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const user = await this.userService.createUser({...dto, role: UserRole.PATIENT, });

      return { message: "Registration successful", user, };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException( "Failed to register user", );
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.checkUserByEmail(dto.email);
      
      if (!user.isActive) {
        throw new UnauthorizedException("Your account is inactive");
      }

      await this.validatePassword(dto.password, user.passwordHash);

      const { access_token, refresh_token, expires_in } = await this.signTokens(user);
      const safeUser = await this.userService.getUserById(user.id);

      return {
        message: "Login successful",
        access_token,
        refresh_token,
        expires_in,
        user: safeUser,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException( "Failed to login", );
    }
  }

  async signTokens(user: User): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const expires_in = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days  
    const accessPayload = {
      user_id: user.id,
      name: user?.fullName,
      email: user.email,
      role: user.role,
    };
    
    const refreshPayload = {
      user_id: user.id,
    };

    const bearerSecret = appConfig.env.JWT_BEARER_SECRET;
    const refreshSecret = appConfig.env.JWT_REFRESH_SECRET;

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      expiresIn: "30d",
      secret: bearerSecret,
    });
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      expiresIn: "30d",
      secret: refreshSecret,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expires_in,
    };
  }

  async checkUserByEmail(email: string) {
    try {
      const user = await this.userService.findOneByEmail(email);
      if (!user) {
        throw new UnauthorizedException("Invalid email or password");
      }
      return user;
    } catch (e: any) {
      if (e instanceof HttpException) throw e;
      throw new UnauthorizedException("Invalid email or password");
    }
  }

  async validatePassword(password: string, passwordHash: string) {
    const passwordMatch = await bcrypt.compare(password, passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException("Invalid email or password");
    }
    return true;
  }
}