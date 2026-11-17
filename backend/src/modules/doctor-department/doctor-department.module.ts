import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DoctorDepartment } from "./entities/doctor-department.entity";
import { Doctor } from "../doctor/entities/doctor.entity";
import { Department } from "../department/entities/department.entity";
import { DoctorDepartmentController } from "./doctor-department.controller";
import { DoctorDepartmentService } from "./doctor-department.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DoctorDepartment,
      Doctor,
      Department,
    ]),
  ],
  controllers: [DoctorDepartmentController],
  providers: [DoctorDepartmentService],
  exports: [DoctorDepartmentService],
})
export class DoctorDepartmentModule {}
