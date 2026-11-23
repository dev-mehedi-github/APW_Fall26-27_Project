//src/modules/user/user.controller.ts
import {Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post,} from "@nestjs/common";
import { Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UseGuards } from "@nestjs/common";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";

@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    async createUser(@Body() dto: CreateUserDto) {
        return this.userService.createUser(dto);
    }

    @Get()
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async getUsers() {
        return this.userService.getUsers();
    }

    @Get(":id")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async getUserById(@Param("id", ParseUUIDPipe) id: string) {
        return this.userService.getUserById(id);
    }

    @Patch(":id")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.PATIENT, Role.ADMIN)
    async updateUser(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() dto: UpdateUserDto,
    ) {
        return this.userService.updateUser(id, dto);
    }

    @Delete(":id")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async deleteUser(@Param("id", ParseUUIDPipe) id: string) {
        return this.userService.deleteUser(id);
    }
}
