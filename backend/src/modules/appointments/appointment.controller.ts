
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards, } from "@nestjs/common";
import { AppointmentService } from "./appointment.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/src/common/enums/role.enum";

@Controller("appointments")
@UseGuards(JwtGuard)
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
  ) { }

  // Create appointment Patient only
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.PATIENT)
  create(
    @Body() dto: CreateAppointmentDto,
    @Req() req: any,
  ) {
    return this.appointmentService.createAppointment(dto, req.user.user_id);
  }

  // Get all appointments Admin only
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.appointmentService.findAll();
  }

  // Get logged in patient appointments
  @Get("my")
  findMyAppointments(@Req() req: any) {
    return this.appointmentService.findMyAppointments(req.user.user_id);
  }

  // Get single appointment
  @Get(":id")
  findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    return this.appointmentService.findOne(
      id,
      req.user.user_id,
      req.user.role,
    );
  }

  // Update / Cancel appointment
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateAppointmentDto,
    @Req() req: any,
  ) {
    return this.appointmentService.update(
      id,
      dto,
      req.user.user_id,
      req.user.role,
    );
  }

  // Delete appointment Admin only
  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.appointmentService.remove(id);
  }
}
