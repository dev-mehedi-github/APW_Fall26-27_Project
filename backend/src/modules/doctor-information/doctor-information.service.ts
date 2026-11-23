import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException,} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DoctorInformation } from "./entities/doctor-information.entity";
import { Doctor } from "../doctor/entities/doctor.entity";
import { CreateDoctorInformationDto } from "./dto/create-doctor-information.dto";
import { UpdateDoctorInformationDto } from "./dto/update-doctor-information.dto";

@Injectable()
export class DoctorInformationService {
    constructor(
        @InjectRepository(DoctorInformation)
        private readonly doctorInformationRepository: Repository<DoctorInformation>,

        @InjectRepository(Doctor)
        private readonly doctorRepository: Repository<Doctor>,
    ) { }

    // CREATE DOCTOR INFORMATION
    async create(dto: CreateDoctorInformationDto) {
        try {
            const doctor = await this.doctorRepository.findOne({
                where: { id: dto.doctorId },
            });

            if (!doctor) {
                throw new NotFoundException("Doctor not found");
            }

            const existingInformation =
                await this.doctorInformationRepository.findOne({
                    where: { doctorId: dto.doctorId },
                });

            if (existingInformation) {
                throw new ConflictException("Doctor information already exists for this doctor",);
            }

            if (dto.bmdcNumber) {
                const existingBmdc =
                    await this.doctorInformationRepository.findOne({
                        where: { bmdcNumber: dto.bmdcNumber },
                    });

                if (existingBmdc) {
                    throw new ConflictException( "BMDC number already exists",);
                }
            }

            const information = this.doctorInformationRepository.create(dto);

            return await this.doctorInformationRepository.save(information,);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            if (error instanceof ConflictException) {
                throw error;
            }

            // PostgreSQL unique constraint error
            if ((error as any)?.code === "23505") {
                throw new ConflictException("Doctor information or BMDC number already exists",);
            }

            console.error("CREATE DOCTOR INFORMATION ERROR:", error);

            throw new InternalServerErrorException("Failed to create doctor information",);
        }
    }

    // GET ALL DOCTOR INFORMATION
    async findAll() {
        try {
            return await this.doctorInformationRepository.find({
                order: { createdAt: "DESC" },
            });
        } catch (error) {
            console.error("GET ALL DOCTOR INFORMATION ERROR:", error);

            throw new InternalServerErrorException("Failed to retrieve doctor information", );
        }
    }

    // GET SINGLE INFORMATION BY ID
    async findOne(id: string) {
        try {
            const information =
                await this.doctorInformationRepository.findOne({
                    where: { id },
                });

            if (!information) {
                throw new NotFoundException("Doctor information not found",);
            }

            return information;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            console.error("GET DOCTOR INFORMATION ERROR:", error);

            throw new InternalServerErrorException("Failed to retrieve doctor information",);
        }
    }

    // GET INFORMATION BY DOCTOR ID
    async findByDoctorId(doctorId: string) {
        try {
            const information =
                await this.doctorInformationRepository.findOne({
                    where: { doctorId },
                });

            if (!information) {
                throw new NotFoundException("Doctor information not found for this doctor",);
            }

            return information;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            console.error("GET INFORMATION BY DOCTOR ID ERROR:", error);

            throw new InternalServerErrorException("Failed to retrieve doctor information",);
        }
    }

    // UPDATE DOCTOR INFORMATION
    async update(
        id: string,
        dto: UpdateDoctorInformationDto,
    ) {
        try {
            const information = await this.findOne(id);

            if (Object.keys(dto).length === 0) {
                throw new BadRequestException("At least one field is required to update",);
            }

            // Check duplicate BMDC number 
            if (dto.bmdcNumber) {
                const existingBmdc =
                    await this.doctorInformationRepository.findOne({
                        where: { bmdcNumber: dto.bmdcNumber },
                    });

                if (
                    existingBmdc &&
                    existingBmdc.id !== information.id
                ) {
                    throw new ConflictException("BMDC number already exists",);
                }
            }

            // Update information
            Object.assign(information, dto);

            return await this.doctorInformationRepository.save(
                information,
            );
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            if (error instanceof BadRequestException) {
                throw error;
            }

            if (error instanceof ConflictException) {
                throw error;
            }

            if ((error as any)?.code === "23505") {
                throw new ConflictException("BMDC number already exists",);
            }

            console.error("UPDATE DOCTOR INFORMATION ERROR:", error);

            throw new InternalServerErrorException("Failed to update doctor information",);
        }
    }

    // DELETE DOCTOR INFORMATION
    async remove(id: string) {
        try {
            // Check information exists
            const information = await this.findOne(id);

            await this.doctorInformationRepository.remove(information,);

            return {
                message: "Doctor information deleted successfully",
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            console.error("DELETE DOCTOR INFORMATION ERROR:", error);

            throw new InternalServerErrorException("Failed to delete doctor information",);
        }
    }
}