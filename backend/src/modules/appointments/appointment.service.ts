
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import {
    DataSource,
    QueryFailedError,
    Repository,
} from "typeorm";

import {
    Appointment,
    AppointmentStatus,
} from "./entities/appointment.entity";

import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";

import { User, UserRole } from "../user/entities/user.entity";
import { Slot, SlotStatus } from "../slot/entities/slot.entity";
import { Role } from "@/src/common/enums/role.enum";

@Injectable()
export class AppointmentService {
    constructor(
        @InjectRepository(Appointment)
        private readonly appointmentRepository: Repository<Appointment>,

        private readonly dataSource: DataSource,
    ) {}

    private safeAppointment(appointment: Appointment) {
        return {
            id: appointment.id,
            status: appointment.status,
            reason: appointment.reason,
            createdAt: appointment.createdAt,
            updatedAt: appointment.updatedAt,

            patient: appointment.patient
                ? {
                    id: appointment.patient.id,
                    fullName: appointment.patient.fullName,
                    email: appointment.patient.email,
                }
                : undefined,

            slot: appointment.slot
                ? {
                    id: appointment.slot.id,
                    startTime: appointment.slot.startTime,
                    endTime: appointment.slot.endTime,
                    status: appointment.slot.status,

                    doctor: appointment.slot.doctor
                        ? {
                            id: appointment.slot.doctor.id,
                            specialization:
                                appointment.slot.doctor.specialization,
                        }
                        : undefined,
                }
                : undefined,
        };
    }

    async createAppointment(
        dto: CreateAppointmentDto,
        patientId: string,
    ) {
        try {
            return await this.dataSource.transaction(async (manager) => {
                const patient = await manager.findOne(User, {
                    where: { id: patientId },
                });

                if (!patient) {
                    throw new NotFoundException("Patient not found");
                }

                if (patient.role !== UserRole.PATIENT) {
                    throw new ForbiddenException(
                        "Only patients can book appointments",
                    );
                }

                const slot = await manager
                    .getRepository(Slot)
                    .createQueryBuilder("slot")
                    .setLock("pessimistic_write")
                    .where("slot.id = :slotId", {
                        slotId: dto.slotId,
                    })
                    .getOne();

                if (!slot) {
                    throw new NotFoundException("Slot not found");
                }

                if (slot.status !== SlotStatus.AVAILABLE) {
                    throw new ConflictException(
                        "This slot is already booked",
                    );
                }

                if (
                    new Date(slot.startTime).getTime() <= Date.now()
                ) {
                    throw new BadRequestException(
                        "Cannot book a past or ongoing slot",
                    );
                }

                slot.status = SlotStatus.BOOKED;
                await manager.save(Slot, slot);

                const appointment = manager.create(Appointment, {
                    patient,
                    slot,
                    reason: dto.reason,
                    status: AppointmentStatus.CONFIRMED,
                });

                const savedAppointment = await manager.save(
                    Appointment,
                    appointment,
                );

                const result = await manager.findOne(Appointment, {
                    where: { id: savedAppointment.id },
                    relations: [
                        "patient",
                        "slot",
                        "slot.doctor",
                        "slot.doctor.user",
                    ],
                });

                return this.safeAppointment(result!);
            });
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ForbiddenException ||
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            if (
                error instanceof QueryFailedError &&
                (error as any).driverError?.code === "23505"
            ) {
                throw new ConflictException(
                    "Appointment already exists",
                );
            }

            console.error("CREATE APPOINTMENT ERROR:", error);

            throw new InternalServerErrorException(
                "Failed to create appointment",
            );
        }
    }

    async findAll() {
        try {
            const appointments = await this.appointmentRepository.find({
                relations: [
                    "patient",
                    "slot",
                    "slot.doctor",
                    "slot.doctor.user",
                ],
                order: { createdAt: "DESC" },
            });

            return appointments.map((item) =>
                this.safeAppointment(item),
            );
        } catch (error) {
            console.error("GET APPOINTMENTS ERROR:", error);

            throw new InternalServerErrorException(
                "Failed to retrieve appointments",
            );
        }
    }

    async findMyAppointments(patientId: string) {
        try {
            const appointments = await this.appointmentRepository.find({
                where: { patient: { id: patientId } },
                relations: [
                    "patient",
                    "slot",
                    "slot.doctor",
                    "slot.doctor.user",
                ],
                order: { createdAt: "DESC" },
            });

            return appointments.map((item) =>
                this.safeAppointment(item),
            );
        } catch (error) {
            console.error("GET MY APPOINTMENTS ERROR:", error);

            throw new InternalServerErrorException(
                "Failed to retrieve your appointments",
            );
        }
    }

    async findOne(id: string, userId: string, role: Role) {
        try {
            const appointment = await this.appointmentRepository.findOne({
                where: { id },
                relations: [
                    "patient",
                    "slot",
                    "slot.doctor",
                    "slot.doctor.user",
                ],
            });

            if (!appointment) {
                throw new NotFoundException("Appointment not found");
            }

            const isAdmin = role === Role.ADMIN;
            const isOwner = appointment.patient.id === userId;

            const isDoctor =
                role === Role.DOCTOR &&
                appointment.slot.doctor.user.id === userId;

            if (!isAdmin && !isOwner && !isDoctor) {
                throw new ForbiddenException(
                    "You are not allowed to view this appointment",
                );
            }

            return this.safeAppointment(appointment);
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ForbiddenException
            ) {
                throw error;
            }

            console.error("GET APPOINTMENT ERROR:", error);

            throw new InternalServerErrorException(
                "Failed to retrieve appointment",
            );
        }
    }

    async update(
        id: string,
        dto: UpdateAppointmentDto,
        userId: string,
        role: Role,
    ) {
        try {
            const appointment = await this.appointmentRepository.findOne({
                where: { id },
                relations: [
                    "patient",
                    "slot",
                    "slot.doctor",
                    "slot.doctor.user",
                ],
            });

            if (!appointment) {
                throw new NotFoundException("Appointment not found");
            }

            console.log("JWT USER ID:", userId);
            console.log(
                "APPOINTMENT PATIENT ID:",
                appointment.patient.id,
            );
            console.log("JWT ROLE:", role);

            const isAdmin = role === Role.ADMIN;
            const isOwner = appointment.patient.id === userId;

            if (!isAdmin && !isOwner) {
                throw new ForbiddenException(
                    "You are not allowed to update this appointment",
                );
            }

            if (
                dto.status === AppointmentStatus.CONFIRMED &&
                appointment.status === AppointmentStatus.CANCELLED
            ) {
                throw new BadRequestException(
                    "A cancelled appointment cannot be confirmed again",
                );
            }

            if (
                dto.status === AppointmentStatus.CANCELLED &&
                appointment.status !== AppointmentStatus.CANCELLED
            ) {
                await this.dataSource.transaction(async (manager) => {
                    const lockedSlot = await manager
                        .getRepository(Slot)
                        .createQueryBuilder("slot")
                        .setLock("pessimistic_write")
                        .where("slot.id = :slotId", {
                            slotId: appointment.slot.id,
                        })
                        .getOne();

                    if (!lockedSlot) {
                        throw new NotFoundException("Slot not found");
                    }

                    appointment.status = AppointmentStatus.CANCELLED;
                    lockedSlot.status = SlotStatus.AVAILABLE;

                    await manager.save(Slot, lockedSlot);
                    await manager.save(Appointment, appointment);
                });
            } else {
                if (dto.status) {
                    appointment.status = dto.status;
                }

                if (dto.reason !== undefined) {
                    appointment.reason = dto.reason;
                }

                await this.appointmentRepository.save(appointment);
            }

            const updated = await this.appointmentRepository.findOne({
                where: { id },
                relations: [
                    "patient",
                    "slot",
                    "slot.doctor",
                    "slot.doctor.user",
                ],
            });

            return this.safeAppointment(updated!);
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ForbiddenException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            console.error("UPDATE APPOINTMENT ERROR:", error);

            throw new InternalServerErrorException(
                "Failed to update appointment",
            );
        }
    }

    async remove(id: string) {
        try {
            const appointment = await this.appointmentRepository.findOne({
                where: { id },
                relations: ["slot"],
            });

            if (!appointment) {
                throw new NotFoundException("Appointment not found");
            }

            await this.dataSource.transaction(async (manager) => {
                const slot = await manager
                    .getRepository(Slot)
                    .createQueryBuilder("slot")
                    .setLock("pessimistic_write")
                    .where("slot.id = :slotId", {
                        slotId: appointment.slot.id,
                    })
                    .getOne();

                if (!slot) {
                    throw new NotFoundException("Slot not found");
                }

                if (appointment.status !== AppointmentStatus.CANCELLED) {
                    slot.status = SlotStatus.AVAILABLE;
                    await manager.save(Slot, slot);
                }

                await manager.remove(Appointment, appointment);
            });

            return {
                message: "Appointment deleted successfully",
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            console.error("DELETE APPOINTMENT ERROR:", error);

            throw new InternalServerErrorException(
                "Failed to delete appointment",
            );
        }
    }
}
