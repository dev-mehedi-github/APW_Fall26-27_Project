
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { LaboratoryController } from "./laboratory.controller";
import { LaboratoryService } from "./laboratory.service";

import { LabTest } from "./entities/lab-test.entity";
import { LabOrder } from "./entities/lab-order.entity";
import { LabOrderItem } from "./entities/lab-order-item.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LabTest,
      LabOrder,
      LabOrderItem,
    ]),
  ],

  controllers: [
    LaboratoryController,
  ],

  providers: [
    LaboratoryService,
  ],

  exports: [
    LaboratoryService,
  ],
})
export class LaboratoryModule {}
