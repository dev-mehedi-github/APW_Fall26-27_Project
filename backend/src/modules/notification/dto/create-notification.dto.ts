import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

import { NotificationType } from "../entities/notification.entity";

export class CreateNotificationDto {
  @IsUUID()
  recipientId!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsString()
  @MaxLength(180)
  title!: string;

  @IsString()
  @MaxLength(5000)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  actionUrl?: string;
}
