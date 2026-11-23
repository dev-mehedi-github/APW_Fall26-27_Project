import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "../user/entities/user.entity";
import { Appointment } from "../appointments/entities/appointment.entity";
import { LabOrder } from "../laboratory/entities/lab-order.entity";

import { Invoice } from "./entities/invoice.entity";
import { InvoiceItem } from "./entities/invoice-item.entity";
import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceItem,
      User,
      Appointment,
      LabOrder,
    ]),
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
