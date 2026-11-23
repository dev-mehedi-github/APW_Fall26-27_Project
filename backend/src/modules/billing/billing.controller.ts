import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";

import { BillingService } from "./billing.service";
import { CreateAppointmentInvoiceDto } from "./dto/create-appointment-invoice.dto";
import { CreateLabInvoiceDto } from "./dto/create-lab-invoice.dto";
import { CancelInvoiceDto } from "./dto/cancel-invoice.dto";

@Controller("billing")
@UseGuards(JwtGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post("invoices/appointments/:appointmentId")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  createAppointmentInvoice(
    @Param("appointmentId", ParseUUIDPipe) appointmentId: string,
    @Body() dto: CreateAppointmentInvoiceDto,
    @Req() req: any,
  ) {
    return this.billingService.createAppointmentInvoice(
      appointmentId,
      dto,
      req.user,
    );
  }

  @Post("invoices/lab-orders/:labOrderId")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  createLabInvoice(
    @Param("labOrderId", ParseUUIDPipe) labOrderId: string,
    @Body() dto: CreateLabInvoiceDto,
    @Req() req: any,
  ) {
    return this.billingService.createLabInvoice(
      labOrderId,
      dto,
      req.user,
    );
  }

  @Get("invoices")
  findAll(@Req() req: any) {
    return this.billingService.findAll(req.user);
  }

  @Get("invoices/my")
  findMy(@Req() req: any) {
    return this.billingService.findMy(req.user);
  }

  @Get("invoices/:id")
  findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    return this.billingService.findOne(id, req.user);
  }

  @Patch("invoices/:id/cancel")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  cancel(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CancelInvoiceDto,
    @Req() req: any,
  ) {
    return this.billingService.cancel(id, dto, req.user);
  }
}
