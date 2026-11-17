import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe, Req, } from "@nestjs/common";
import { Request } from "express";
import { DoctorService } from "./doctor.service";
import { CreateDoctorDto } from "./dto/create-doctor.dto";
import { UpdateDoctorDto } from "./dto/update-doctor.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";

@Controller("doctors")
@UseGuards(JwtGuard)
export class DoctorController {
    constructor(
        private readonly doctorService: DoctorService,
    ) { }

    // Create Doctor  Admin only
    @Post()
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    createDoctor(@Body() dto: CreateDoctorDto) {
        return this.doctorService.createDoctor(dto);
    }

    // Get All Doctors
    @Get()
    findAll() {
        return this.doctorService.findAll();
    }

    // Get Single Doctor
    @Get(":id")
    findOne(
        @Param("id", ParseUUIDPipe) id: string,
    ) {
        return this.doctorService.findOne(id);
    }

    // Update Doctor Admin or profile owner
    @Patch(":id")
    updateDoctor(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() dto: UpdateDoctorDto,
        @Req() req: Request,
    ) {
        return this.doctorService.updateDoctor(
            id,
            dto,
            req.user as { user_id: string; role: string },
        );
    }

    // Delete Doctor Admin only
    @Delete(":id")
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    removeDoctor(
        @Param("id", ParseUUIDPipe) id: string,
    ) {
        return this.doctorService.removeDoctor(id);
    }
}
