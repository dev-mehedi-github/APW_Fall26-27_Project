import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException, HttpException, } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Doctor } from "./entities/doctor.entity";
import { User, UserRole } from "../user/entities/user.entity";
import { CreateDoctorDto } from "./dto/create-doctor.dto";
import { UpdateDoctorDto } from "./dto/update-doctor.dto";

@Injectable()
export class DoctorService {
    constructor(
        @InjectRepository(Doctor)
        private readonly doctorRepository: Repository<Doctor>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    private safeDoctor(doctor: Doctor) {
        const { passwordHash, ...safeUser } = doctor.user;

        return { ...doctor, user: safeUser, };
    }

    // Create Doctor
    async createDoctor(dto: CreateDoctorDto) {
        try {
            const user = await this.userRepository.findOneBy({ id: dto.userId,});
            if (!user) {
                throw new NotFoundException("User not found");
            }
            
            if (user.role !== UserRole.DOCTOR) {
                throw new BadRequestException("User role must be DOCTOR",);
            }

            const existingDoctor = await this.doctorRepository.findOne({
                where: { user: { id: dto.userId } },
            });

            if (existingDoctor) {
                throw new ConflictException("Doctor profile already exists for this user",);
            }

            const doctor = this.doctorRepository.create({
                specialization: dto.specialization,
                qualification: dto.qualification,
                experienceYears: dto.experienceYears,
                consultationFee: dto.consultationFee,
                bio: dto.bio,
                user,
            });

            const savedDoctor = await this.doctorRepository.save(doctor);

            const result = await this.doctorRepository.findOne({
                where: { id: savedDoctor.id },
                relations: { user: true },
            });

            return {
                message: "Doctor created successfully",
                doctor: this.safeDoctor(result!),
            };
        } catch (error) {
  console.error("CREATE DOCTOR ERROR:", error);

  throw new InternalServerErrorException(
    error instanceof Error ? error.message : String(error),
  );
}
    }

    // Get All Doctors
    async findAll() {
        try {
            const doctors = await this.doctorRepository.find({
                relations: { user: true },
                order: { createdAt: "DESC" },
            });

            return {
                message: "Doctors retrieved successfully",
                doctors: doctors.map((doctor) =>
                    this.safeDoctor(doctor),
                ),
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException(  "Failed to retrieve doctors", );
        }
    }

    // Get Single Doctor
    async findOne(id: string) {
        try {
            const doctor = await this.doctorRepository.findOne({ where: { id }, relations: { user: true },});

            if (!doctor) {
                throw new NotFoundException("Doctor not found");
            }

            return {
                message: "Doctor retrieved successfully",
                doctor: this.safeDoctor(doctor),
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException( "Failed to retrieve doctor",  );
        }
    }

    // Update Doctor
    async updateDoctor(
        id: string,
        dto: UpdateDoctorDto,
        requester: { user_id: string; role: string },
    ) {
        try {
            const doctor = await this.doctorRepository.findOne({
                where: { id },
                relations: { user: true },
            });

            if (!doctor) {
                throw new NotFoundException("Doctor not found");
            }

            const isAdmin = requester.role === "ADMIN";
            const isOwner = doctor.user.id === requester.user_id;

            if (!isAdmin && !isOwner) {
                throw new BadRequestException( "You can only update your own doctor profile", );
            }

            Object.assign(doctor, dto);

            await this.doctorRepository.save(doctor);

            const updatedDoctor = await this.doctorRepository.findOne({
                where: { id },
                relations: { user: true },
            });

            return {
                message: "Doctor updated successfully",
                doctor: this.safeDoctor(updatedDoctor!),
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException( "Failed to update doctor", );
        }
    }

    // Delete Doctor
    async removeDoctor(id: string) {
        try {
            const doctor = await this.doctorRepository.findOneBy({
                id,
            });

            if (!doctor) {
                throw new NotFoundException("Doctor not found");
            }

            await this.doctorRepository.remove(doctor);

            return {
                message: "Doctor deleted successfully",
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException( "Failed to delete doctor",  );
        }
    }
}
