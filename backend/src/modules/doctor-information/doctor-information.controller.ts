import { Controller, Post, Get, Patch, Delete, Body, Param, ParseUUIDPipe, UseGuards,} from "@nestjs/common";

import { DoctorInformationService } from "./doctor-information.service";
import { CreateDoctorInformationDto } from "./dto/create-doctor-information.dto";
import { UpdateDoctorInformationDto } from "./dto/update-doctor-information.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";
@Controller("doctor-information")
export class DoctorInformationController {
    constructor(
        private readonly doctorInformationService: DoctorInformationService,
    ) { }

    // PUBLIC - no token needed
    @Get()
    findAll() {
        return this.doctorInformationService.findAll();
    }

    // PUBLIC - no token needed
    @Get("doctor/:doctorId")
    findByDoctorId(
        @Param("doctorId", ParseUUIDPipe) doctorId: string,
    ) {
        return this.doctorInformationService.findByDoctorId(doctorId);
    }

    // PUBLIC - no token needed
    @Get(":id")
    findOne(
        @Param("id", ParseUUIDPipe) id: string,
    ) {
        return this.doctorInformationService.findOne(id);
    }

    // ADMIN ONLY
    @Post()
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.ADMIN)
    create(@Body() dto: CreateDoctorInformationDto) {
        return this.doctorInformationService.create(dto);
    }

    // ADMIN ONLY
    @Patch(":id")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.ADMIN)
    update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() dto: UpdateDoctorInformationDto,
    ) {
        return this.doctorInformationService.update(id, dto);
    }

    // ADMIN ONLY
    @Delete(":id")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.ADMIN)
    remove(
        @Param("id", ParseUUIDPipe) id: string,
    ) {
        return this.doctorInformationService.remove(id);
    }
}