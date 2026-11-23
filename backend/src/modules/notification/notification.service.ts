import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Role } from "@/common/enums/role.enum";

import { User } from "../user/entities/user.entity";
import {
  Notification,
  NotificationType,
} from "./entities/notification.entity";
import { CreateNotificationDto } from "./dto/create-notification.dto";

interface AuthenticatedRequester {
  user_id: string;
  role: Role | string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Admin can send an in-app notification to a patient, doctor or another user.
  async create(
    dto: CreateNotificationDto,
    requester: AuthenticatedRequester,
  ) {
    this.ensureAdmin(requester);

    const recipient = await this.userRepository.findOne({
      where: { id: dto.recipientId },
    });

    if (!recipient) {
      throw new NotFoundException("Notification recipient not found");
    }

    const createdBy = await this.userRepository.findOne({
      where: { id: requester.user_id },
    });

    if (!createdBy) {
      throw new NotFoundException("Current admin user not found");
    }

    const notification = this.notificationRepository.create({
      recipient,
      createdBy,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      actionUrl: dto.actionUrl,
      isRead: false,
    });

    const saved = await this.notificationRepository.save(notification);
    const complete = await this.findNotificationEntity(saved.id);

    return {
      message: "Notification created successfully",
      notification: this.toResponse(complete!),
    };
  }

  // Admin can view all notifications; other users only their own.
  async findAll(requester: AuthenticatedRequester) {
    const query = this.notificationRepository
      .createQueryBuilder("notification")
      .leftJoinAndSelect("notification.recipient", "recipient")
      .leftJoinAndSelect("notification.createdBy", "createdBy")
      .orderBy("notification.createdAt", "DESC");

    if (requester.role !== Role.ADMIN) {
      query.where("recipient.id = :userId", {
        userId: requester.user_id,
      });
    }

    const notifications = await query.getMany();

    return {
      message: "Notifications retrieved successfully",
      count: notifications.length,
      unreadCount: notifications.filter((item) => !item.isRead).length,
      notifications: notifications.map((item) => this.toResponse(item)),
    };
  }

  async findMy(requester: AuthenticatedRequester) {
    return this.findAll(requester);
  }

  async markAsRead(
    id: string,
    requester: AuthenticatedRequester,
  ) {
    const notification = await this.findNotificationEntity(id);

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    if (
      requester.role !== Role.ADMIN &&
      notification.recipient.id !== requester.user_id
    ) {
      throw new ForbiddenException(
        "You cannot update another user's notification",
      );
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await this.notificationRepository.save(notification);
    }

    const complete = await this.findNotificationEntity(id);

    return {
      message: "Notification marked as read",
      notification: this.toResponse(complete!),
    };
  }

  async markAllAsRead(requester: AuthenticatedRequester) {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({
        isRead: true,
        readAt: () => "CURRENT_TIMESTAMP",
      })
      .where('"recipientId" = :userId', {
        userId: requester.user_id,
      })
      .andWhere('"isRead" = false')
      .execute();

    return {
      message: "All notifications marked as read",
      updatedCount: result.affected ?? 0,
    };
  }

  // This method is exported for later use by Appointment, Lab Report,
  // Billing and Payment services to create automatic in-app notifications.
  async createForUser(input: {
    recipientId: string;
    type: NotificationType;
    title: string;
    message: string;
    actionUrl?: string;
    createdById?: string;
  }) {
    const recipient = await this.userRepository.findOne({
      where: { id: input.recipientId },
    });

    if (!recipient) {
      throw new NotFoundException("Notification recipient not found");
    }

    const createdBy = input.createdById
      ? await this.userRepository.findOne({
          where: { id: input.createdById },
        })
      : null;

    const notification = this.notificationRepository.create({
      recipient,
      createdBy,
      type: input.type,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  private ensureAdmin(requester: AuthenticatedRequester) {
    if (requester.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "Only administrators can create notifications through this endpoint",
      );
    }
  }

  private findNotificationEntity(id: string) {
    return this.notificationRepository.findOne({
      where: { id },
      relations: ["recipient", "createdBy"],
    });
  }

  private toResponse(notification: Notification) {
    return {
      id: notification.id,
      recipient: {
        id: notification.recipient.id,
        fullName: notification.recipient.fullName,
        email: notification.recipient.email,
      },
      createdBy: notification.createdBy
        ? {
            id: notification.createdBy.id,
            fullName: notification.createdBy.fullName,
          }
        : null,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl,
      isRead: notification.isRead,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}
