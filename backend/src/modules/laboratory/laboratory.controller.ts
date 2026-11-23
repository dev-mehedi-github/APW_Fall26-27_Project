
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import { LaboratoryService } from "./laboratory.service";

import { CreateLabTestDto } from "./dto/create-lab-test.dto";
import { UpdateLabTestDto } from "./dto/update-lab-test.dto";
import { CreateLabOrderDto } from "./dto/create-lab-order.dto";
import { UpdateLabOrderStatusDto } from "./dto/update-lab-order-status.dto";

import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";

@Controller("laboratory")
@UseGuards(JwtGuard)
export class LaboratoryController {
  constructor(
    private readonly laboratoryService: LaboratoryService,
  ) {}

  // ==========================================
  // LAB TEST MANAGEMENT
  // ==========================================

  // ADMIN: Create a laboratory test
  @Post("tests")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  createTest(@Body() dto: CreateLabTestDto) {
    return this.laboratoryService.createTest(dto);
  }

  // AUTHENTICATED USERS: Get all active tests
  @Get("tests")
  findAllTests() {
    return this.laboratoryService.findAllTests();
  }

  // AUTHENTICATED USERS: Get one test
  @Get("tests/:id")
  findTest(
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.laboratoryService.findTest(id);
  }

  // ADMIN: Update a laboratory test
  @Patch("tests/:id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateTest(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateLabTestDto,
  ) {
    return this.laboratoryService.updateTest(id, dto);
  }

  // ADMIN: Deactivate a laboratory test
  @Delete("tests/:id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  removeTest(
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.laboratoryService.removeTest(id);
  }

  // ==========================================
  // LAB ORDER MANAGEMENT
  // ==========================================

  // DOCTOR: Create laboratory order
  @Post("orders")
  @UseGuards(RolesGuard)
  @Roles(Role.DOCTOR)
  createOrder(
    @Body() dto: CreateLabOrderDto,
    @Req() req: any,
  ) {
    return this.laboratoryService.createOrder(
      dto,
      req.user,
    );
  }

  // ADMIN / DOCTOR / PATIENT:
  // Get orders according to authenticated user's role
  @Get("orders")
  findAllOrders(@Req() req: any) {
    return this.laboratoryService.findAllOrders(
      req.user,
    );
  }

  // PATIENT / DOCTOR: Get own orders
  @Get("orders/my")
  findMyOrders(@Req() req: any) {
    return this.laboratoryService.findMyOrders(
      req.user,
    );
  }

  // ADMIN / DOCTOR / PATIENT:
  // Get one order with ownership verification
  @Get("orders/:id")
  findOrder(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    return this.laboratoryService.findOrder(
      id,
      req.user,
    );
  }

  // ADMIN: Update order status
  @Patch("orders/:id/status")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateOrderStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateLabOrderStatusDto,
  ) {
    return this.laboratoryService.updateOrderStatus(
      id,
      dto,
    );
  }
}
