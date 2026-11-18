
import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";

import { Slot, SlotStatus } from "./entities/slot.entity";
import { Doctor } from "../doctor/entities/doctor.entity";
import { CreateSlotDto } from "./dto/create-slot.dto";
import { UpdateSlotDto } from "./dto/update-slot.dto";

@Injectable()
export class SlotService {
    constructor(
        @InjectRepository(Slot)
        private readonly slotRepository: Repository<Slot>,

        @InjectRepository(Doctor)
        private readonly doctorRepository: Repository<Doctor>,
    ) {}

    private async findSlot(id: string) {
        const slot = await this.slotRepository.findOne({
            where: { id },
            relations: {
                doctor: {
                    user: true,
                },
            },
        });

        if (!slot) {
            throw new NotFoundException("Slot not found");
        }

        return slot;
    }

    private safeSlot(slot: Slot) {
        return {
            id: slot.id,
            doctor: slot.doctor
                ? {
                    id: slot.doctor.id,
                    specialization: slot.doctor.specialization,
                    qualification: slot.doctor.qualification,
                    user: slot.doctor.user
                        ? {
                            id: slot.doctor.user.id,
                            fullName: slot.doctor.user.fullName,
                            email: slot.doctor.user.email,
                        }
                        : null,
                }
                : null,
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: slot.status,
            createdAt: slot.createdAt,
            updatedAt: slot.updatedAt,
        };
    }

    async createSlot(dto: CreateSlotDto) {
        try {
            const startTime = new Date(dto.startTime);
            const endTime = new Date(dto.endTime);

            if (endTime <= startTime) {
                throw new BadRequestException(
                    "endTime must be later than startTime",
                );
            }

            const doctor = await this.doctorRepository.findOne({
                where: { id: dto.doctorId },
                relations: { user: true },
            });

            if (!doctor) {
                throw new NotFoundException("Doctor not found");
            }

            const slot = this.slotRepository.create({
                doctor,
                startTime,
                endTime,
                status: SlotStatus.AVAILABLE,
            });

            const saved = await this.slotRepository.save(slot);
            const result = await this.findSlot(saved.id);

            return {
                message: "Slot created successfully",
                slot: this.safeSlot(result),
            };
        } catch (error) {
            if (error instanceof QueryFailedError) {
                const driverError = (error as any).driverError;

                if (driverError?.code === "23505") {
                    throw new ConflictException(
                        "A slot already exists for this doctor at this start time",
                    );
                }

                if (driverError?.code === "23503") {
                    throw new BadRequestException("Invalid doctor");
                }
            }

            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException ||
                error instanceof ConflictException
            ) {
                throw error;
            }

            console.error("CREATE SLOT ERROR:", error);
            throw new InternalServerErrorException(
                "Failed to create slot",
            );
        }
    }

    async findAllSlots() {
        try {
            const slots = await this.slotRepository.find({
                relations: {
                    doctor: {
                        user: true,
                    },
                },
                order: {
                    startTime: "ASC",
                },
            });

            return slots.map((slot) => this.safeSlot(slot));
        } catch (error) {
            console.error("GET SLOTS ERROR:", error);
            throw new InternalServerErrorException(
                "Failed to retrieve slots",
            );
        }
    }

    async findOneSlot(id: string) {
        try {
            const slot = await this.findSlot(id);
            return this.safeSlot(slot);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            console.error("GET SLOT ERROR:", error);
            throw new InternalServerErrorException(
                "Failed to retrieve slot",
            );
        }
    }

    async updateSlot(id: string, dto: UpdateSlotDto) {
        try {
            const slot = await this.findSlot(id);

            if (slot.status === SlotStatus.BOOKED) {
                throw new ConflictException(
                    "Booked slot cannot be updated",
                );
            }

            if (dto.doctorId) {
                const doctor = await this.doctorRepository.findOne({
                    where: { id: dto.doctorId },
                    relations: { user: true },
                });

                if (!doctor) {
                    throw new NotFoundException("Doctor not found");
                }

                slot.doctor = doctor;
            }

            const startTime = dto.startTime
                ? new Date(dto.startTime)
                : new Date(slot.startTime);

            const endTime = dto.endTime
                ? new Date(dto.endTime)
                : new Date(slot.endTime);

            if (endTime <= startTime) {
                throw new BadRequestException(
                    "endTime must be later than startTime",
                );
            }

            slot.startTime = startTime;
            slot.endTime = endTime;

            await this.slotRepository.save(slot);

            const updated = await this.findSlot(id);

            return {
                message: "Slot updated successfully",
                slot: this.safeSlot(updated),
            };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException ||
                error instanceof ConflictException
            ) {
                throw error;
            }

            if (error instanceof QueryFailedError) {
                const driverError = (error as any).driverError;

                if (driverError?.code === "23505") {
                    throw new ConflictException(
                        "A slot already exists for this doctor at this start time",
                    );
                }

                if (driverError?.code === "23503") {
                    throw new BadRequestException("Invalid doctor");
                }
            }

            console.error("UPDATE SLOT ERROR:", error);
            throw new InternalServerErrorException(
                "Failed to update slot",
            );
        }
    }

    async removeSlot(id: string) {
        try {
            const slot = await this.findSlot(id);

            if (slot.status === SlotStatus.BOOKED) {
                throw new ConflictException(
                    "Booked slot cannot be deleted",
                );
            }

            await this.slotRepository.remove(slot);

            return {
                message: "Slot deleted successfully",
            };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException
            ) {
                throw error;
            }

            console.error("DELETE SLOT ERROR:", error);
            throw new InternalServerErrorException(
                "Failed to delete slot",
            );
        }
    }
}
