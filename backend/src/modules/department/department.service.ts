import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, HttpException, } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Department } from "./entities/department.entity";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";

@Injectable()
export class DepartmentService {
    constructor(
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
    ) { }

    // Create Department
    async createDepartment(dto: CreateDepartmentDto) {
        try {
            const existingDepartment = await this.departmentRepository.findOne({  where: { name: dto.name },  });

            if (existingDepartment) {
                throw new ConflictException( "Department name already exists", );
            }

            const department = this.departmentRepository.create(dto);

            const result = await this.departmentRepository.save(department);

            return {
                message: "Department created successfully",
                department: result,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            // PostgreSQL duplicate unique key
            if (  typeof error === "object" &&  error !== null && "code" in error && error.code === "23505") {
                throw new ConflictException( "Department name already exists",  );
            }

            console.error("CREATE DEPARTMENT ERROR:", error);

            throw new InternalServerErrorException( "Failed to create department", );
        }
    }

    // Get All Departments
    async findAll() {
        try {
            const departments = await this.departmentRepository.find({
                    order: { createdAt: "DESC" },
                });

            return {
                message: "Departments retrieved successfully",
                departments,
            };
        } catch (error) {
            console.error("GET DEPARTMENTS ERROR:", error);

            throw new InternalServerErrorException(  "Failed to retrieve departments", );
        }
    }

    // Get Department By ID
    async findOne(id: string) {
        try {
            const department = await this.departmentRepository.findOne({   where: { id }, });

            if (!department) {
                throw new NotFoundException(  "Department not found", );
            }

            return {
                message: "Department retrieved successfully",
                department,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            console.error("GET DEPARTMENT ERROR:", error);

            throw new InternalServerErrorException(
                "Failed to retrieve department",
            );
        }
    }

    // Update Department
    async updateDepartment(
        id: string,
        dto: UpdateDepartmentDto,
    ) {
        try {
            const department =  await this.departmentRepository.findOne({  where: { id },});

            if (!department) {
                throw new NotFoundException( "Department not found", );
            }

            if (dto.name && dto.name !== department.name) {
                const existingDepartment = await this.departmentRepository.findOne({  where: { name: dto.name }, });

                if (existingDepartment) {
                    throw new ConflictException( "Department name already exists", );
                }
            }

            Object.assign(department, dto);

            const result =  await this.departmentRepository.save(department);

            return {
                message: "Department updated successfully",
                department: result,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            if (  typeof error === "object" && error !== null &&  "code" in error && error.code === "23505") {
                throw new ConflictException( "Department name already exists", );
            }

            console.error("UPDATE DEPARTMENT ERROR:", error);
            throw new InternalServerErrorException( "Failed to update department", );
        }
    }

    // Delete Department
    async removeDepartment(id: string) {
        try {
            const department =  await this.departmentRepository.findOne({ where: { id },  });

            if (!department) {
                throw new NotFoundException( "Department not found", );
            }

            await this.departmentRepository.remove(department);

            return {
                message: "Department deleted successfully",
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            console.error("DELETE DEPARTMENT ERROR:", error);

            throw new InternalServerErrorException( "Failed to delete department", );
        }
    }
}
