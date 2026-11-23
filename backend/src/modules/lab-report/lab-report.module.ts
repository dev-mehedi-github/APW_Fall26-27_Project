import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "../user/entities/user.entity";
import { LabOrder } from "../laboratory/entities/lab-order.entity";
import { LabOrderItem } from "../laboratory/entities/lab-order-item.entity";

import { LabReport } from "./entities/lab-report.entity";
import { LabReportController } from "./lab-report.controller";
import { LabReportService } from "./lab-report.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LabReport,
      LabOrderItem,
      LabOrder,
      User,
    ]),
  ],
  controllers: [LabReportController],
  providers: [LabReportService],
  exports: [LabReportService],
})
export class LabReportModule {}
