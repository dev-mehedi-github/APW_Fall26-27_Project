import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Role } from "@/common/enums/role.enum";

import { User } from "../user/entities/user.entity";
import { LabOrder, LabOrderStatus } from "../laboratory/entities/lab-order.entity";
import { LabOrderItem } from "../laboratory/entities/lab-order-item.entity";

import { LabReport, LabReportStatus } from "./entities/lab-report.entity";
import { CreateLabReportDto } from "./dto/create-lab-report.dto";
import { UpdateLabReportDto } from "./dto/update-lab-report.dto";

interface AuthenticatedRequester {
  user_id: string;
  role: Role | string;
}

@Injectable()
export class LabReportService {
  constructor(
    @InjectRepository(LabReport)
    private readonly reportRepository: Repository<LabReport>,

    @InjectRepository(LabOrderItem)
    private readonly labOrderItemRepository: Repository<LabOrderItem>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Admin creates a draft report for a completed laboratory order item.
  async create(
    dto: CreateLabReportDto,
    requester: AuthenticatedRequester,
  ) {
    const item = await this.labOrderItemRepository.findOne({
      where: { id: dto.labOrderItemId },
      relations: [
        "labOrder",
        "labOrder.patient",
        "labOrder.doctor",
        "labOrder.doctor.user",
        "labTest",
      ],
    });

    if (!item) {
      throw new NotFoundException("Laboratory order item not found");
    }

    if (item.labOrder.status !== LabOrderStatus.COMPLETED) {
      throw new BadRequestException(
        "A report can only be created after the laboratory order is completed",
      );
    }

    const existingReport = await this.reportRepository.findOne({
      where: { labOrderItem: { id: item.id } },
    });

    if (existingReport) {
      throw new ConflictException(
        "A report already exists for this laboratory order item",
      );
    }

    const creator = await this.userRepository.findOne({
      where: { id: requester.user_id },
    });

    if (!creator) {
      throw new NotFoundException("Current user was not found");
    }

    const report = this.reportRepository.create({
      labOrderItem: item,
      createdBy: creator,
      result: dto.result,
      unit: dto.unit,
      referenceRange: dto.referenceRange,
      interpretation: dto.interpretation,
      remarks: dto.remarks,
      status: LabReportStatus.DRAFT,
    });

    const saved = await this.reportRepository.save(report);
    const complete = await this.findReportEntity(saved.id);

    return {
      message: "Laboratory report created as draft",
      report: this.toResponse(complete!),
    };
  }

  // Admin sees all reports. Doctors and patients see only their released reports.
  async findAll(requester: AuthenticatedRequester) {
    const query = this.reportRepository
      .createQueryBuilder("report")
      .leftJoinAndSelect("report.labOrderItem", "item")
      .leftJoinAndSelect("item.labOrder", "labOrder")
      .leftJoinAndSelect("labOrder.patient", "patient")
      .leftJoinAndSelect("labOrder.doctor", "doctor")
      .leftJoinAndSelect("doctor.user", "doctorUser")
      .leftJoinAndSelect("item.labTest", "labTest")
      .leftJoinAndSelect("report.createdBy", "createdBy")
      .orderBy("report.createdAt", "DESC");

    if (requester.role === Role.PATIENT) {
      query
        .andWhere("patient.id = :userId", { userId: requester.user_id })
        .andWhere("report.status = :status", {
          status: LabReportStatus.RELEASED,
        });
    } else if (requester.role === Role.DOCTOR) {
      query
        .andWhere("doctorUser.id = :userId", { userId: requester.user_id })
        .andWhere("report.status = :status", {
          status: LabReportStatus.RELEASED,
        });
    } else if (requester.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You are not authorized to view laboratory reports",
      );
    }

    const reports = await query.getMany();

    return {
      message: "Laboratory reports retrieved successfully",
      count: reports.length,
      reports: reports.map((report) => this.toResponse(report)),
    };
  }

  async findMy(requester: AuthenticatedRequester) {
    if (
      requester.role !== Role.PATIENT &&
      requester.role !== Role.DOCTOR
    ) {
      throw new ForbiddenException(
        "This endpoint is available to patients and doctors",
      );
    }

    return this.findAll(requester);
  }

  async findOne(id: string, requester: AuthenticatedRequester) {
    const report = await this.findReportEntity(id);

    if (!report) {
      throw new NotFoundException("Laboratory report not found");
    }

    const isAdmin = requester.role === Role.ADMIN;
    const isPatient =
      requester.role === Role.PATIENT &&
      report.labOrderItem.labOrder.patient.id === requester.user_id;
    const isDoctor =
      requester.role === Role.DOCTOR &&
      report.labOrderItem.labOrder.doctor.user.id === requester.user_id;

    if (!isAdmin && !isPatient && !isDoctor) {
      throw new ForbiddenException(
        "You cannot access this laboratory report",
      );
    }

    if (!isAdmin && report.status !== LabReportStatus.RELEASED) {
      throw new NotFoundException("Laboratory report not found");
    }

    return {
      message: "Laboratory report retrieved successfully",
      report: this.toResponse(report),
    };
  }

  // Admin can edit a report only while it is still a draft.
  async update(id: string, dto: UpdateLabReportDto) {
    const report = await this.findReportEntity(id);

    if (!report) {
      throw new NotFoundException("Laboratory report not found");
    }

    if (report.status !== LabReportStatus.DRAFT) {
      throw new BadRequestException(
        "Only draft reports can be edited",
      );
    }

    Object.assign(report, dto);
    const saved = await this.reportRepository.save(report);
    const complete = await this.findReportEntity(saved.id);

    return {
      message: "Laboratory report updated successfully",
      report: this.toResponse(complete!),
    };
  }

  // Admin publishes the report. Released reports become visible to the patient and doctor.
  async release(id: string) {
    const report = await this.findReportEntity(id);

    if (!report) {
      throw new NotFoundException("Laboratory report not found");
    }

    if (report.status !== LabReportStatus.DRAFT) {
      throw new BadRequestException(
        "Only draft reports can be released",
      );
    }

    report.status = LabReportStatus.RELEASED;
    report.releasedAt = new Date();

    const saved = await this.reportRepository.save(report);
    const complete = await this.findReportEntity(saved.id);

    return {
      message: "Laboratory report released successfully",
      report: this.toResponse(complete!),
    };
  }

  private findReportEntity(id: string) {
    return this.reportRepository.findOne({
      where: { id },
      relations: [
        "labOrderItem",
        "labOrderItem.labOrder",
        "labOrderItem.labOrder.patient",
        "labOrderItem.labOrder.doctor",
        "labOrderItem.labOrder.doctor.user",
        "labOrderItem.labTest",
        "createdBy",
      ],
    });
  }

  private toResponse(report: LabReport) {
    const item = report.labOrderItem;
    const order = item.labOrder;

    return {
      id: report.id,
      result: report.result,
      unit: report.unit,
      referenceRange: report.referenceRange,
      interpretation: report.interpretation,
      remarks: report.remarks,
      status: report.status,
      releasedAt: report.releasedAt,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      test: item.labTest
        ? {
            id: item.labTest.id,
            testCode: item.labTest.testCode,
            name: item.labTest.name,
          }
        : undefined,
      orderItem: {
        id: item.id,
        testName: item.testName,
        testCode: item.testCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      },
      patient: {
        id: order.patient.id,
        fullName: order.patient.fullName,
      },
      doctor: {
        id: order.doctor.id,
        fullName: order.doctor.user?.fullName,
        specialization: order.doctor.specialization,
      },
      createdBy: report.createdBy
        ? {
            id: report.createdBy.id,
            fullName: report.createdBy.fullName,
          }
        : undefined,
    };
  }
}
