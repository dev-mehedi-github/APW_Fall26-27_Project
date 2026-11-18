
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Slot } from "./entities/slot.entity";
import { Doctor } from "../doctor/entities/doctor.entity";
import { SlotController } from "./slot.controller";
import { SlotService } from "./slot.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Slot,
      Doctor,
    ]),
  ],
  controllers: [SlotController],
  providers: [SlotService],
  exports: [SlotService],
})
export class SlotModule {}
