import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";

import { PaymentService } from "./payment.service";
import { RecordPaymentDto } from "./dto/record-payment.dto";

@Controller("payments")
@UseGuards(JwtGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("invoices/:invoiceId/record")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  recordPayment(
    @Param("invoiceId", ParseUUIDPipe) invoiceId: string,
    @Body() dto: RecordPaymentDto,
    @Req() req: any,
  ) {
    return this.paymentService.recordPayment(
      invoiceId,
      dto,
      req.user,
    );
  }

  @Get("my")
  findMy(@Req() req: any) {
    return this.paymentService.findMy(req.user);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.paymentService.findAll(req.user);
  }

  @Get(":id")
  findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    return this.paymentService.findOne(id, req.user);
  }
}
