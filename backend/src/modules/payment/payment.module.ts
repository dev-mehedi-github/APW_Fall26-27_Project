import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "../user/entities/user.entity";
import { Invoice } from "../billing/entities/invoice.entity";

import { Payment } from "./entities/payment.entity";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Invoice,
      User,
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
