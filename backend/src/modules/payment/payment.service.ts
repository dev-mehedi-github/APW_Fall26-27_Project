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
import { Invoice, InvoiceStatus } from "../billing/entities/invoice.entity";

import { Payment, PaymentStatus } from "./entities/payment.entity";
import { RecordPaymentDto } from "./dto/record-payment.dto";

interface AuthenticatedRequester {
  user_id: string;
  role: Role | string;
}

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

  // Admin records a verified, full payment against an issued invoice.
  async recordPayment(
    invoiceId: string,
    dto: RecordPaymentDto,
    requester: AuthenticatedRequester,
  ) {
    this.ensureAdmin(requester);

    try {
      const savedPaymentId = await this.dataSource.transaction(
        async (manager) => {
          const invoice = await manager.findOne(Invoice, {
            where: { id: invoiceId },
            relations: ["patient"],
            lock: { mode: "pessimistic_write" },
          });

          if (!invoice) {
            throw new NotFoundException("Invoice not found");
          }

          if (invoice.status === InvoiceStatus.CANCELLED) {
            throw new BadRequestException(
              "Payment cannot be recorded for a cancelled invoice",
            );
          }

          if (invoice.status === InvoiceStatus.PAID) {
            throw new ConflictException("Invoice has already been paid");
          }

          const amount = Number(dto.amount);
          const invoiceTotal = Number(invoice.total);

          if (!Number.isFinite(amount) || amount <= 0) {
            throw new BadRequestException("Payment amount must be positive");
          }

          // Partial payments are intentionally not supported in this version.
          if (Math.round(amount * 100) !== Math.round(invoiceTotal * 100)) {
            throw new BadRequestException(
              "Payment amount must equal the full invoice total",
            );
          }

          const existingPayment = await manager.findOne(Payment, {
            where: { invoice: { id: invoiceId } },
          });

          if (existingPayment) {
            throw new ConflictException(
              "A payment is already recorded for this invoice",
            );
          }

          const recordedBy = await manager.findOne(User, {
            where: { id: requester.user_id },
          });

          if (!recordedBy) {
            throw new NotFoundException("Current admin user not found");
          }

          const payment = manager.create(Payment, {
            invoice,
            patient: invoice.patient,
            recordedBy,
            amount: amount.toFixed(2),
            paymentMethod: dto.paymentMethod,
            status: PaymentStatus.COMPLETED,
            transactionReference: dto.transactionReference?.trim() || null,
            notes: dto.notes,
            paidAt: new Date(),
          });

          const saved = await manager.save(Payment, payment);

          invoice.status = InvoiceStatus.PAID;
          await manager.save(Invoice, invoice);

          return saved.id;
        },
      );

      const complete = await this.findPaymentEntity(savedPaymentId);

      return {
        message: "Payment recorded successfully",
        payment: this.toResponse(complete!),
      };
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "23505"
      ) {
        throw new ConflictException(
          "A payment with this invoice or transaction reference already exists",
        );
      }
      throw error;
    }
  }

  // Admin sees all payments; patients see only their own payments.
  async findAll(requester: AuthenticatedRequester) {
    const query = this.paymentRepository
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.invoice", "invoice")
      .leftJoinAndSelect("payment.patient", "patient")
      .leftJoinAndSelect("payment.recordedBy", "recordedBy")
      .orderBy("payment.paidAt", "DESC");

    if (requester.role === Role.PATIENT) {
      query.where("patient.id = :userId", {
        userId: requester.user_id,
      });
    } else if (requester.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You are not authorized to view payment transactions",
      );
    }

    const payments = await query.getMany();

    return {
      message: "Payment transactions retrieved successfully",
      count: payments.length,
      payments: payments.map((payment) => this.toResponse(payment)),
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
    const payment = await this.findPaymentEntity(id);

    if (!payment) {
      throw new NotFoundException("Payment transaction not found");
    }

    const isAdmin = requester.role === Role.ADMIN;
    const isOwner =
      requester.role === Role.PATIENT &&
      payment.patient.id === requester.user_id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        "You cannot access this payment transaction",
      );
    }

    return {
      message: "Payment transaction retrieved successfully",
      payment: this.toResponse(payment),
    };
  }

  private ensureAdmin(requester: AuthenticatedRequester) {
    if (requester.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "Only administrators can record payments",
      );
    }
  }

  private findPaymentEntity(id: string) {
    return this.paymentRepository.findOne({
      where: { id },
      relations: ["invoice", "patient", "recordedBy"],
    });
  }

  private toResponse(payment: Payment) {
    return {
      id: payment.id,
      invoice: {
        id: payment.invoice.id,
        invoiceNumber: payment.invoice.invoiceNumber,
        total: payment.invoice.total,
        status: payment.invoice.status,
      },
      patient: {
        id: payment.patient.id,
        fullName: payment.patient.fullName,
        email: payment.patient.email,
      },
      recordedBy: {
        id: payment.recordedBy.id,
        fullName: payment.recordedBy.fullName,
      },
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      transactionReference: payment.transactionReference,
      notes: payment.notes,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
