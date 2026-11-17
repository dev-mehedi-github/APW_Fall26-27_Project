
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { DoctorDepartment } from "./entities/doctor-department.entity";
import { Doctor } from "../doctor/entities/doctor.entity";
import { Department } from "../department/entities/department.entity";
import { CreateDoctorDepartmentDto } from "./dto/create-doctor-department.dto";
import { UpdateDoctorDepartmentDto } from "./dto/update-doctor-department.dto";

@Injectable()
export class DoctorDepartmentService {
    constructor(
        @InjectRepository(DoctorDepartment)
        private readonly doctorDepartmentRepository: Repository<DoctorDepartment>,

        @InjectRepository(Doctor)
        private readonly doctorRepository: Repository<Doctor>,

        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
    ) { }

    private async findRelation(id: string) {
        const relation = await this.doctorDepartmentRepository.findOne({
            where: { id },
            relations: {
                doctor: { user: true },
                department: true,
            },
        });

        if (!relation) {
            throw new NotFoundException("Doctor-Department relation not found");
        }

        return relation;
    }

    private safeRelation(relation: DoctorDepartment) {
        return {
            id: relation.id,
            doctor: relation.doctor
                ? {
                    id: relation.doctor.id,
                    specialization: relation.doctor.specialization,
                    qualification: relation.doctor.qualification,
                    experienceYears: relation.doctor.experienceYears,
                    consultationFee: relation.doctor.consultationFee,
                    user: relation.doctor.user
                        ? {
                            id: relation.doctor.user.id,
                            fullName: relation.doctor.user.fullName,
                            email: relation.doctor.user.email,
                            role: relation.doctor.user.role,
                        }
                        : null,
                }
                : null,
            department: relation.department
                ? {
                    id: relation.department.id,
                    name: relation.department.name,
                    description: relation.department.description,
                }
                : null,
            createdAt: relation.createdAt,
            updatedAt: relation.updatedAt,
        };
    }

    async createRelation(dto: CreateDoctorDepartmentDto) {
        try {
            const doctor = await this.doctorRepository.findOne({
                where: { id: dto.doctorId },
                relations: { user: true },
            });

            if (!doctor) {
                throw new NotFoundException("Doctor not found");
            }

            const department = await this.departmentRepository.findOne({
                where: { id: dto.departmentId },
            });

            if (!department) {
                throw new NotFoundException("Department not found");
            }

            const existing = await this.doctorDepartmentRepository.findOne({
                where: {
                    doctor: { id: dto.doctorId },
                    department: { id: dto.departmentId },
                },
            });

            if (existing) {
                throw new ConflictException(
                    "Doctor is already assigned to this department",
                );
            }

            const relation = this.doctorDepartmentRepository.create({
                doctor,
                department,
            });

            const saved = await this.doctorDepartmentRepository.save(relation);

            const result = await this.findRelation(saved.id);

            return {
                message: "Doctor assigned to department successfully",
                relation: this.safeRelation(result),
            };
        } catch (error) {
            if (error instanceof QueryFailedError) {
                const driverError = (error as any).driverError;

                if (driverError?.code === "23505") {
                    throw new ConflictException(
                        "Doctor is already assigned to this department",
                    );
                }

                if (driverError?.code === "23503") {
                    throw new BadRequestException("Invalid doctor or department");
                }
            }

            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            console.error("CREATE DOCTOR DEPARTMENT ERROR:", error);
            throw new InternalServerErrorException(
                "Failed to assign doctor to department",
            );
        }
    }

    async findAllRelations() {
        try {
            const relations = await this.doctorDepartmentRepository.find({
                relations: {
                    doctor: { user: true },
                    department: true,
                },
                order: { createdAt: "DESC" },
            });

            return relations.map((relation) => this.safeRelation(relation));
        } catch (error) {
            console.error("GET DOCTOR DEPARTMENTS ERROR:", error);
            throw new InternalServerErrorException(
                "Failed to retrieve doctor departments",
            );
        }
    }

    async findOneRelation(id: string) {
        try {
            const relation = await this.findRelation(id);

            return this.safeRelation(relation);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            console.error("GET DOCTOR DEPARTMENT ERROR:", error);
            throw new InternalServerErrorException(
                "Failed to retrieve doctor department",
            );
        }
    }

    async updateRelation(
        id: string,
        dto: UpdateDoctorDepartmentDto,
    ) {
        try {
            const relation = await this.findRelation(id);

            if (dto.doctorId) {
                const doctor = await this.doctorRepository.findOne({
                    where: { id: dto.doctorId },
                });

                if (!doctor) {
                    throw new NotFoundException("Doctor not found");
                }

                relation.doctor = doctor;
            }

            if (dto.departmentId) {
                const department = await this.departmentRepository.findOne({
                    where: { id: dto.departmentId },
                });

                if (!department) {
                    throw new NotFoundException("Department not found");
                }

                relation.department = department;
            }

            const duplicate = await this.doctorDepartmentRepository.findOne({
                where: {
                    doctor: { id: relation.doctor.id },
                    department: { id: relation.department.id },
                },
            });

            if (duplicate && duplicate.id !== id) {
                throw new ConflictException(
                    "Doctor is already assigned to this department",
                );
            }

            await this.doctorDepartmentRepository.save(relation);

            const updated = await this.findRelation(id);

            return {
                message: "Doctor department updated successfully",
                relation: this.safeRelation(updated),
            };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException
            ) {
                throw error;
            }

            if (error instanceof QueryFailedError) {
                const driverError = (error as any).driverError;

                if (driverError?.code === "23505") {
                    throw new ConflictException(
                        "Doctor is already assigned to this department",
                    );
                }
            }

            console.error("UPDATE DOCTOR DEPARTMENT ERROR:", error);
            throw new InternalServerErrorException(
                "Failed to update doctor department",
            );
        }
    }

    async removeRelation(id: string) {
        try {
            const relation = await this.findRelation(id);

            await this.doctorDepartmentRepository.remove(relation);

            return {
                message: "Doctor removed from department successfully",
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            console.error("DELETE DOCTOR DEPARTMENT ERROR:", error);
            throw new InternalServerErrorException(
                "Failed to remove doctor from department",
            );
        }
    }
}
