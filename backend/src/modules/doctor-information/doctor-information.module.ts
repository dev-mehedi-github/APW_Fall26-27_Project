import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DoctorInformation } from "./entities/doctor-information.entity";
import { Doctor } from "../doctor/entities/doctor.entity";
import { DoctorInformationController } from "./doctor-information.controller";
import { DoctorInformationService } from "./doctor-information.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DoctorInformation,
      Doctor,
    ]),
  ],
  controllers: [DoctorInformationController],
  providers: [DoctorInformationService],
  exports: [DoctorInformationService],
})
export class DoctorInformationModule {}
