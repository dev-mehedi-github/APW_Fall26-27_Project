import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./jwt.strategy";
import { UserModule } from "../user/user.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_BEARER_SECRET,
        signOptions: {
          expiresIn: "1d",
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule { }
