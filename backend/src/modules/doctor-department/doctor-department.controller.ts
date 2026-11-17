import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, } from "@nestjs/common";
import { DoctorDepartmentService } from "./doctor-department.service";
import { CreateDoctorDepartmentDto } from "./dto/create-doctor-department.dto";
import { UpdateDoctorDepartmentDto } from "./dto/update-doctor-department.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/src/common/enums/role.enum";


@Controller("doctor-departments")
@UseGuards(JwtGuard)
export class DoctorDepartmentController {
    constructor(
        private readonly doctorDepartmentService: DoctorDepartmentService,
    ) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    create(@Body() dto: CreateDoctorDepartmentDto) {
        return this.doctorDepartmentService.createRelation(dto);
    }

    @Get()
    findAll() {
        return this.doctorDepartmentService.findAllRelations();
    }

    @Get(":id")
    findOne(@Param("id", ParseUUIDPipe) id: string) {
        return this.doctorDepartmentService.findOneRelation(id);
    }

    @Patch(":id")
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() dto: UpdateDoctorDepartmentDto,
    ) {
        return this.doctorDepartmentService.updateRelation(id, dto);
    }

    @Delete(":id")
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    remove(@Param("id", ParseUUIDPipe) id: string) {
        return this.doctorDepartmentService.removeRelation(id);
    }
}
