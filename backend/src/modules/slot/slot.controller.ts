
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards,} from "@nestjs/common";
import { SlotService } from "./slot.service";
import { CreateSlotDto } from "./dto/create-slot.dto";
import { UpdateSlotDto } from "./dto/update-slot.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/src/common/enums/role.enum";

@Controller("slots")
@UseGuards(JwtGuard)
export class SlotController {
  constructor(
    private readonly slotService: SlotService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateSlotDto) {
    return this.slotService.createSlot(dto);
  }

  @Get()
  findAll() {
    return this.slotService.findAllSlots();
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.slotService.findOneSlot(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateSlotDto,
  ) {
    return this.slotService.updateSlot(id, dto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.slotService.removeSlot(id);
  }
}
