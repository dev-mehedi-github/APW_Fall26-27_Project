import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";

import { LabReportService } from "./lab-report.service";
import { CreateLabReportDto } from "./dto/create-lab-report.dto";
import { UpdateLabReportDto } from "./dto/update-lab-report.dto";

@Controller("lab-reports")
@UseGuards(JwtGuard)
export class LabReportController {
  constructor(
    private readonly labReportService: LabReportService,
  ) {}

  // Admin creates a report after the laboratory order is completed.
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateLabReportDto, @Req() req: any) {
    return this.labReportService.create(dto, req.user);
  }

  // Admin sees all reports; doctors and patients see their released reports.
  @Get()
  findAll(@Req() req: any) {
    return this.labReportService.findAll(req.user);
  }

  // Patients and doctors see their own released reports.
  @Get("my")
  findMy(@Req() req: any) {
    return this.labReportService.findMy(req.user);
  }

  @Get(":id")
  findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    return this.labReportService.findOne(id, req.user);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateLabReportDto,
  ) {
    return this.labReportService.update(id, dto);
  }

  @Patch(":id/release")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  release(@Param("id", ParseUUIDPipe) id: string) {
    return this.labReportService.release(id);
  }
}
