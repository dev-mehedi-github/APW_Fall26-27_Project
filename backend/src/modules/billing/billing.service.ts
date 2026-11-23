import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

import { Role } from "@/common/enums/role.enum";

import { User } from "../user/entities/user.entity";
import {
  Appointment,
  AppointmentStatus,
} from "../appointments/entities/appointment.entity";
import { LabOrder } from "../laboratory/entities/lab-order.entity";

import { Invoice, InvoiceStatus } from "./entities/invoice.entity";
import { InvoiceItem } from "./entities/invoice-item.entity";
import { CreateAppointmentInvoiceDto } from "./dto/create-appointment-invoice.dto";
import { CreateLabInvoiceDto } from "./dto/create-lab-invoice.dto";
import { CancelInvoiceDto } from "./dto/cancel-invoice.dto";

interface AuthenticatedRequester {
  user_id: string;
  role: Role | string;
}

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(LabOrder)
    private readonly labOrderRepository: Repository<LabOrder>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

  async createAppointmentInvoice(
    appointmentId: string,
    dto: CreateAppointmentInvoiceDto,
    requester: AuthenticatedRequester,
  ) {
    this.ensureAdmin(requester);

    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ["patient", "slot", "slot.doctor", "slot.doctor.user"],
    });

    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }

    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new BadRequestException(
        "An invoice can only be generated for a confirmed appointment",
      );
    }

    const existing = await this.invoiceRepository.findOne({
      where: { appointment: { id: appointmentId } },
    });

    if (existing) {
      throw new ConflictException(
        "An invoice already exists for this appointment",
      );
    }

    const amount = Number(appointment.slot.doctor.consultationFee);

    if (!Number.isFinite(amount) || amount < 0) {
      throw new BadRequestException("Invalid doctor consultation fee");
    }

    const description = `Doctor consultation - ${appointment.slot.doctor.specialization}`;

    return this.saveInvoice({
      patient: appointment.patient,
      appointment,
      createdById: requester.user_id,
      notes: dto.notes,
      items: [{
        description,
        quantity: 1,
        unitPrice: amount,
        lineTotal: amount,
      }],
    });
  }

  async createLabInvoice(
    labOrderId: string,
    dto: CreateLabInvoiceDto,
    requester: AuthenticatedRequester,
  ) {
    this.ensureAdmin(requester);

    const labOrder = await this.labOrderRepository.findOne({
      where: { id: labOrderId },
      relations: ["patient", "items"],
    });

    if (!labOrder) {
      throw new NotFoundException("Laboratory order not found");
    }

    if (!labOrder.items?.length) {
      throw new BadRequestException(
        "Cannot generate an invoice for an order without test items",
      );
    }

    const existing = await this.invoiceRepository.findOne({
      where: { labOrder: { id: labOrderId } },
    });

    if (existing) {
      throw new ConflictException(
        "An invoice already exists for this laboratory order",
      );
    }

    const items = labOrder.items.map((item) => ({
      description: `${item.testName} (${item.testCode})`,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.subtotal),
    }));

    return this.saveInvoice({
      patient: labOrder.patient,
      labOrder,
      createdById: requester.user_id,
      notes: dto.notes,
      items,
    });
  }

  private async saveInvoice(input: {
    patient: User;
    appointment?: Appointment;
    labOrder?: LabOrder;
    createdById: string;
    notes?: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }>;
  }) {
    const creator = await this.userRepository.findOne({
      where: { id: input.createdById },
    });

    if (!creator) {
      throw new NotFoundException("Current admin user not found");
    }

    const subtotal = input.items.reduce(
      (sum, item) => sum + item.lineTotal,
      0,
    );
    const discount = 0;
    const total = subtotal - discount;

    const invoiceNumber =
      `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const saved = await this.dataSource.transaction(async (manager) => {
        const invoice = manager.create(Invoice, {
          invoiceNumber,
          patient: input.patient,
          createdBy: creator,
          appointment: input.appointment ?? null,
          labOrder: input.labOrder ?? null,
          subtotal: subtotal.toFixed(2),
          discount: discount.toFixed(2),
          total: total.toFixed(2),
          status: InvoiceStatus.ISSUED,
          notes: input.notes,
          items: input.items.map((item) =>
            manager.create(InvoiceItem, {
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice.toFixed(2),
              lineTotal: item.lineTotal.toFixed(2),
            }),
          ),
        });

        return manager.save(Invoice, invoice);
      });

      const complete = await this.findInvoiceEntity(saved.id);
      return {
        message: "Invoice generated successfully",
        invoice: this.toResponse(complete!),
      };
    } catch (error) {
      // Unique source indexes also protect against concurrent duplicate creation.
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "23505"
      ) {
        throw new ConflictException("An invoice already exists for this source");
      }
      throw error;
    }
  }

  async findAll(requester: AuthenticatedRequester) {
    const query = this.invoiceRepository
      .createQueryBuilder("invoice")
      .leftJoinAndSelect("invoice.patient", "patient")
      .leftJoinAndSelect("invoice.items", "items")
      .leftJoinAndSelect("invoice.appointment", "appointment")
      .leftJoinAndSelect("invoice.labOrder", "labOrder")
      .orderBy("invoice.createdAt", "DESC");

    if (requester.role === Role.PATIENT) {
      query.where("patient.id = :userId", {
        userId: requester.user_id,
      });
    } else if (requester.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You are not authorized to view invoices",
      );
    }

    const invoices = await query.getMany();

    return {
      message: "Invoices retrieved successfully",
      count: invoices.length,
      invoices: invoices.map((invoice) => this.toResponse(invoice)),
    };
  }

  async findMy(requester: AuthenticatedRequester) {
    if (requester.role !== Role.PATIENT) {
      throw new ForbiddenException(
        "This endpoint is available to patients",
      );
    }
    return this.findAll(requester);
  }

  async findOne(id: string, requester: AuthenticatedRequester) {
    const invoice = await this.findInvoiceEntity(id);

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    const isAdmin = requester.role === Role.ADMIN;
    const isOwner =
      requester.role === Role.PATIENT &&
      invoice.patient.id === requester.user_id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException("You cannot access this invoice");
    }

    return {
      message: "Invoice retrieved successfully",
      invoice: this.toResponse(invoice),
    };
  }

  async cancel(
    id: string,
    dto: CancelInvoiceDto,
    requester: AuthenticatedRequester,
  ) {
    this.ensureAdmin(requester);

    const invoice = await this.findInvoiceEntity(id);

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException("A paid invoice cannot be cancelled");
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException("Invoice is already cancelled");
    }

    invoice.status = InvoiceStatus.CANCELLED;
    invoice.notes = invoice.notes
      ? `${invoice.notes}\nCancellation reason: ${dto.reason}`
      : `Cancellation reason: ${dto.reason}`;

    const saved = await this.invoiceRepository.save(invoice);
    const complete = await this.findInvoiceEntity(saved.id);

    return {
      message: "Invoice cancelled successfully",
      invoice: this.toResponse(complete!),
    };
  }

  private ensureAdmin(requester: AuthenticatedRequester) {
    if (requester.role !== Role.ADMIN) {
      throw new ForbiddenException("Only administrators can manage invoices");
    }
  }

  private findInvoiceEntity(id: string) {
    return this.invoiceRepository.findOne({
      where: { id },
      relations: [
        "patient",
        "createdBy",
        "appointment",
        "labOrder",
        "items",
      ],
    });
  }

  private toResponse(invoice: Invoice) {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      patient: {
        id: invoice.patient.id,
        fullName: invoice.patient.fullName,
        email: invoice.patient.email,
      },
      appointmentId: invoice.appointment?.id ?? null,
      labOrderId: invoice.labOrder?.id ?? null,
      items: (invoice.items ?? []).map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      total: invoice.total,
      status: invoice.status,
      issuedAt: invoice.issuedAt,
      dueAt: invoice.dueAt,
      notes: invoice.notes,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }
}
