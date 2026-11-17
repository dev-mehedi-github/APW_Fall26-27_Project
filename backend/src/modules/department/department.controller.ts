import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe, } from "@nestjs/common";
import { DepartmentService } from "./department.service";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";

@Controller("departments")
@UseGuards(JwtGuard)
export class DepartmentController {
    constructor(
        private readonly departmentService: DepartmentService,
    ) { }

    // Create Department Admin only
    @Post()
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    createDepartment(@Body() dto: CreateDepartmentDto) {
        return this.departmentService.createDepartment(dto);
    }

    // Get All Departments
    @Get()
    findAll() {
        return this.departmentService.findAll();
    }

    // Get Department By ID
    @Get(":id")
    findOne(
        @Param("id", ParseUUIDPipe) id: string,
    ) {
        return this.departmentService.findOne(id);
    }

    // Update Department  Admin only
    @Patch(":id")
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    updateDepartment(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() dto: UpdateDepartmentDto,
    ) {
        return this.departmentService.updateDepartment(
            id,
            dto,
        );
    }

    // Delete Department Admin only
    @Delete(":id")
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    removeDepartment(
        @Param("id", ParseUUIDPipe) id: string,
    ) {
        return this.departmentService.removeDepartment(id);
    }
}
