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

import { NotificationService } from "./notification.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";

@Controller("notifications")
@UseGuards(JwtGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(
    @Body() dto: CreateNotificationDto,
    @Req() req: any,
  ) {
    return this.notificationService.create(dto, req.user);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.notificationService.findAll(req.user);
  }

  @Get("my")
  findMy(@Req() req: any) {
    return this.notificationService.findMy(req.user);
  }

  @Patch("read-all")
  markAllAsRead(@Req() req: any) {
    return this.notificationService.markAllAsRead(req.user);
  }

  @Patch(":id/read")
  markAsRead(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    return this.notificationService.markAsRead(id, req.user);
  }
}
