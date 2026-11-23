import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PostgresDatabaseProviderModule } from "@/providers/database/postgres/provider.module";
import { AppController } from "@/src/app.controller";
import { AppService } from "@/src/app.service";
import global_config from "@/config/global_config";
import { BullModule } from "@nestjs/bull";
import { UserModule } from "@/modules/user/user.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { DoctorModule } from '@/modules/doctor/doctor.module';
import { DepartmentModule } from "./modules/department/department.module";
import { DoctorDepartmentModule } from "./modules/doctor-department/doctor-department.module";
import { SlotModule } from "./modules/slot/slot.module";
import { AppointmentModule } from "./modules/appointments/appointment.module";
import { DoctorInformationModule } from "./modules/doctor-information/doctor-information.module";
import { LaboratoryModule } from "./modules/laboratory/laboratory.module";
import { LabReportModule } from "./modules/lab-report/lab-report.module";
import { BillingModule } from "./modules/billing/billing.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { NotificationModule } from "./modules/notification/notification.module";

@Module({
  imports: [
    PostgresDatabaseProviderModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
    }),
    BullModule.forRoot({
      url: process.env.REDIS_URL,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [global_config],
    }),
    UserModule,
    AuthModule,
    DoctorModule,
    DepartmentModule,
    DoctorDepartmentModule,
    SlotModule,
    AppointmentModule,
    DoctorInformationModule,
LaboratoryModule,
LabReportModule,
BillingModule,
PaymentModule,
NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
