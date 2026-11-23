
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  HttpException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

import { LabTest } from "./entities/lab-test.entity";
import {
  LabOrder,
  LabOrderStatus,
} from "./entities/lab-order.entity";
import { LabOrderItem } from "./entities/lab-order-item.entity";

import { User, UserRole } from "../user/entities/user.entity";
import { Doctor } from "../doctor/entities/doctor.entity";
import { Appointment } from "../appointments/entities/appointment.entity";

import { CreateLabTestDto } from "./dto/create-lab-test.dto";
import { UpdateLabTestDto } from "./dto/update-lab-test.dto";
import { CreateLabOrderDto } from "./dto/create-lab-order.dto";
import { UpdateLabOrderStatusDto } from "./dto/update-lab-order-status.dto";

interface Requester {
  user_id: string;
  role: string;
}

@Injectable()
export class LaboratoryService {
  constructor(
    @InjectRepository(LabTest)
    private readonly labTestRepository: Repository<LabTest>,

    @InjectRepository(LabOrder)
    private readonly labOrderRepository: Repository<LabOrder>,

    private readonly dataSource: DataSource,
  ) {}

  // ==========================================
  // LAB TEST MANAGEMENT
  // ==========================================

  // Create a laboratory test
  async createTest(dto: CreateLabTestDto) {
    try {
      const existingTest = await this.labTestRepository.findOne({
        where: { testCode: dto.testCode },
      });

      if (existingTest) {
        throw new ConflictException(
          "Laboratory test code already exists",
        );
      }

      const test = this.labTestRepository.create({
        ...dto,
        price: dto.price,
        turnaroundTimeHours: dto.turnaroundTimeHours ?? 24,
        isActive: true,
      });

      const savedTest = await this.labTestRepository.save(test);

      return {
        message: "Laboratory test created successfully",
        test: savedTest,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        "Failed to create laboratory test",
      );
    }
  }

  // Get all laboratory tests
  async findAllTests() {
    try {
      const tests = await this.labTestRepository.find({
        where: { isActive: true },
        order: { createdAt: "DESC" },
      });

      return {
        message: "Laboratory tests retrieved successfully",
        count: tests.length,
        tests,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        "Failed to retrieve laboratory tests",
      );
    }
  }

  // Get one laboratory test
  async findTest(id: string) {
    try {
      const test = await this.labTestRepository.findOne({
        where: { id },
      });

      if (!test) {
        throw new NotFoundException(
          "Laboratory test not found",
        );
      }

      return {
        message: "Laboratory test retrieved successfully",
        test,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        "Failed to retrieve laboratory test",
      );
    }
  }

  // Update a laboratory test
  async updateTest(id: string, dto: UpdateLabTestDto) {
    try {
      const test = await this.labTestRepository.findOne({
        where: { id },
      });

      if (!test) {
        throw new NotFoundException(
          "Laboratory test not found",
        );
      }

      if (dto.testCode && dto.testCode !== test.testCode) {
        const duplicate = await this.labTestRepository.findOne({
          where: { testCode: dto.testCode },
        });

        if (duplicate) {
          throw new ConflictException(
            "Laboratory test code already exists",
          );
        }
      }

      Object.assign(test, dto);

      const updatedTest =
        await this.labTestRepository.save(test);

      return {
        message: "Laboratory test updated successfully",
        test: updatedTest,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        "Failed to update laboratory test",
      );
    }
  }

  // Deactivate a laboratory test
  async removeTest(id: string) {
    try {
      const test = await this.labTestRepository.findOne({
        where: { id },
      });

      if (!test) {
        throw new NotFoundException(
          "Laboratory test not found",
        );
      }

      test.isActive = false;

      await this.labTestRepository.save(test);

      return {
        message: "Laboratory test deactivated successfully",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        "Failed to deactivate laboratory test",
      );
    }
  }

  // ==========================================
  // LAB ORDER MANAGEMENT
  // ==========================================

  // Create a laboratory order
  // Only an authenticated doctor can create an order.
  async createOrder(
    dto: CreateLabOrderDto,
    requester: Requester,
  ) {
    try {
      return await this.dataSource.transaction(
        async (manager) => {
          // Verify authenticated doctor
          if (requester.role !== UserRole.DOCTOR) {
            throw new ForbiddenException(
              "Only doctors can create laboratory orders",
            );
          }

          const doctor = await manager.findOne(Doctor, {
            where: {
              user: { id: requester.user_id },
            },
            relations: ["user"],
          });

          if (!doctor) {
            throw new NotFoundException(
              "Doctor profile not found",
            );
          }

          // Verify patient
          const patient = await manager.findOne(User, {
            where: { id: dto.patientId },
          });

          if (!patient) {
            throw new NotFoundException(
              "Patient not found",
            );
          }

          if (patient.role !== UserRole.PATIENT) {
            throw new BadRequestException(
              "The selected user is not a patient",
            );
          }

          // Verify optional appointment
          let appointment: Appointment | null = null;

          if (dto.appointmentId) {
            appointment = await manager.findOne(
              Appointment,
              {
                where: {
                  id: dto.appointmentId,
                },
                relations: [
                  "patient",
                  "slot",
                  "slot.doctor",
                ],
              },
            );

            if (!appointment) {
              throw new NotFoundException(
                "Appointment not found",
              );
            }

            if (
              appointment.patient.id !== patient.id
            ) {
              throw new BadRequestException(
                "Appointment does not belong to this patient",
              );
            }

            if (
              appointment.slot.doctor.id !== doctor.id
            ) {
              throw new ForbiddenException(
                "Appointment does not belong to this doctor",
              );
            }
          }

          // Prevent duplicate test IDs in one request
          const testIds = dto.items.map(
            (item) => item.labTestId,
          );

          if (new Set(testIds).size !== testIds.length) {
            throw new BadRequestException(
              "Duplicate laboratory tests are not allowed",
            );
          }

          const orderItems: LabOrderItem[] = [];
          let totalAmount = 0;

          // Validate each test and calculate total
          for (const item of dto.items) {
            const test = await manager.findOne(LabTest, {
              where: {
                id: item.labTestId,
                isActive: true,
              },
            });

            if (!test) {
              throw new NotFoundException(
                `Laboratory test ${item.labTestId} not found or inactive`,
              );
            }

            const unitPrice = Number(test.price);
            const subtotal = unitPrice * item.quantity;

            totalAmount += subtotal;

            const orderItem = manager.create(
              LabOrderItem,
              {
                labTest: test,
                testName: test.name,
                testCode: test.testCode,
                unitPrice: unitPrice.toFixed(2),
                quantity: item.quantity,
                subtotal: subtotal.toFixed(2),
              },
            );

            orderItems.push(orderItem);
          }

          // Create main order
          const order = manager.create(LabOrder, {
            patient,
            doctor,
            appointment: appointment ?? undefined,
            items: orderItems,
            status: LabOrderStatus.PENDING,
            totalAmount: totalAmount.toFixed(2),
            notes: dto.notes,
          });

          const savedOrder = await manager.save(
            LabOrder,
            order,
          );

          // Return order with relationships
          const result = await manager.findOne(
            LabOrder,
            {
              where: { id: savedOrder.id },
              relations: [
                "patient",
                "doctor",
                "doctor.user",
                "appointment",
                "items",
                "items.labTest",
              ],
            },
          );

          if (!result) {
            throw new InternalServerErrorException(
              "Failed to retrieve created order",
            );
          }

          return {
            message: "Laboratory order created successfully",
            order: this.safeOrder(result),
          };
        },
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      console.error("CREATE LAB ORDER ERROR:", error);

      throw new InternalServerErrorException(
        "Failed to create laboratory order",
      );
    }
  }

  // Get all orders based on logged-in user's role
  async findAllOrders(requester: Requester) {
    try {
      const query = this.labOrderRepository
        .createQueryBuilder("order")
        .leftJoinAndSelect("order.patient", "patient")
        .leftJoinAndSelect("order.doctor", "doctor")
        .leftJoinAndSelect("order.items", "items")
        .leftJoinAndSelect("items.labTest", "labTest")
        .leftJoinAndSelect("order.appointment", "appointment")
        .orderBy("order.createdAt", "DESC");

      if (requester.role === UserRole.PATIENT) {
        query.where("patient.id = :userId", {
          userId: requester.user_id,
        });
      } else if (requester.role === UserRole.DOCTOR) {
        query
          .leftJoin("doctor.user", "doctorUser")
          .andWhere("doctorUser.id = :userId", {
            userId: requester.user_id,
          });
      } else if (requester.role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          "You are not authorized to view laboratory orders",
        );
      }

      const orders = await query.getMany();

      return {
        message: "Laboratory orders retrieved successfully",
        count: orders.length,
        orders: orders.map((order) =>
          this.safeOrder(order),
        ),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        "Failed to retrieve laboratory orders",
      );
    }
  }

  // Get a patient's own orders
  async findMyOrders(requester: Requester) {
    if (
      requester.role !== UserRole.PATIENT &&
      requester.role !== UserRole.DOCTOR
    ) {
      throw new ForbiddenException(
        "This endpoint is for patients and doctors",
      );
    }

    return this.findAllOrders(requester);
  }

  // Get one order with ownership verification
  async findOrder(id: string, requester: Requester) {
    try {
      const order = await this.labOrderRepository.findOne({
        where: { id },
        relations: [
          "patient",
          "doctor",
          "doctor.user",
          "appointment",
          "items",
          "items.labTest",
        ],
      });

      if (!order) {
        throw new NotFoundException(
          "Laboratory order not found",
        );
      }

      const isAdmin =
        requester.role === UserRole.ADMIN;

      const isPatient =
        requester.role === UserRole.PATIENT &&
        order.patient.id === requester.user_id;

      const isDoctor =
        requester.role === UserRole.DOCTOR &&
        order.doctor.user.id === requester.user_id;

      if (!isAdmin && !isPatient && !isDoctor) {
        throw new ForbiddenException(
          "You cannot access this laboratory order",
        );
      }

      return {
        message: "Laboratory order retrieved successfully",
        order: this.safeOrder(order),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        "Failed to retrieve laboratory order",
      );
    }
  }

  // Update laboratory order status
  // Admin only for now.
  async updateOrderStatus(
    id: string,
    dto: UpdateLabOrderStatusDto,
  ) {
    try {
      const order = await this.labOrderRepository.findOne({
        where: { id },
      });

      if (!order) {
        throw new NotFoundException(
          "Laboratory order not found",
        );
      }

      const allowedTransitions: Record<
        LabOrderStatus,
        LabOrderStatus[]
      > = {
        [LabOrderStatus.PENDING]: [
          LabOrderStatus.SAMPLE_COLLECTED,
          LabOrderStatus.CANCELLED,
        ],
        [LabOrderStatus.SAMPLE_COLLECTED]: [
          LabOrderStatus.PROCESSING,
          LabOrderStatus.CANCELLED,
        ],
        [LabOrderStatus.PROCESSING]: [
          LabOrderStatus.COMPLETED,
          LabOrderStatus.CANCELLED,
        ],
        [LabOrderStatus.COMPLETED]: [],
        [LabOrderStatus.CANCELLED]: [],
      };

      if (
        !allowedTransitions[order.status].includes(
          dto.status,
        )
      ) {
        throw new BadRequestException(
          `Cannot change status from ${order.status} to ${dto.status}`,
        );
      }

      order.status = dto.status;

      if (dto.notes) {
        order.notes = order.notes
          ? `${order.notes}\n${dto.notes}`
          : dto.notes;
      }

      const updatedOrder =
        await this.labOrderRepository.save(order);

      return {
        message: "Laboratory order status updated successfully",
        order: updatedOrder,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        "Failed to update laboratory order status",
      );
    }
  }

  // ==========================================
  // SAFE RESPONSE
  // ==========================================

  private safeOrder(order: LabOrder) {
    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

      patient: order.patient
        ? {
            id: order.patient.id,
            fullName: order.patient.fullName,
            email: order.patient.email,
          }
        : undefined,

      doctor: order.doctor
        ? {
            id: order.doctor.id,
            specialization: order.doctor.specialization,
          }
        : undefined,

      appointment: order.appointment
        ? {
            id: order.appointment.id,
            status: order.appointment.status,
          }
        : undefined,

      items: (order.items ?? []).map((item) => ({
        id: item.id,
        testName: item.testName,
        testCode: item.testCode,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        labTestId: item.labTest?.id,
      })),
    };
  }
}
