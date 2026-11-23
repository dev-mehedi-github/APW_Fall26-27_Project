NOTIFICATION MANAGEMENT MODULE
==============================

Copy the entire "notification" folder into:
backend/src/modules/

Destination:
backend/src/modules/notification/

Included:
- entities/notification.entity.ts
- dto/create-notification.dto.ts
- notification.controller.ts
- notification.service.ts
- notification.module.ts

FEATURES
--------
- Admin can create an in-app notification for a user.
- Patient, doctor and admin can view notifications addressed to themselves.
- Admin can view all notifications.
- Users can mark one notification as read.
- Users can mark all their notifications as read.
- Unread count is included in list responses.
- Notifications store type, title, message, optional action URL, read status and timestamps.
- NotificationService.createForUser is exported for future automatic notification hooks
  from Appointment, Lab Report, Billing and Payment modules.
- This version provides in-app notifications only. Email, SMS, push delivery and
  Bull/Redis background jobs are not enabled yet.

MANUAL INTEGRATION REQUIRED
---------------------------

1. Register NotificationModule in backend/src/app.module.ts:

   import { NotificationModule } from "./modules/notification/notification.module";

   Add NotificationModule to the AppModule imports array.

2. Create a TypeORM migration for table "notifications".

   Columns:
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
   recipientId UUID NOT NULL
   createdById UUID NULL
   type VARCHAR(30) NOT NULL
   title VARCHAR(180) NOT NULL
   message TEXT NOT NULL
   actionUrl VARCHAR(255) NULL
   isRead BOOLEAN NOT NULL DEFAULT false
   readAt TIMESTAMP NULL
   createdAt TIMESTAMP NOT NULL DEFAULT now()
   updatedAt TIMESTAMP NOT NULL DEFAULT now()

   Foreign keys:
   recipientId -> users(id), ON DELETE CASCADE
   createdById -> users(id), ON DELETE SET NULL

   Checks:
   type IN ('APPOINTMENT', 'LAB_REPORT', 'INVOICE', 'PAYMENT', 'GENERAL')

   Add indexes on recipientId, isRead and createdAt if desired.

3. Run pnpm run build.
4. Run migration:run after reviewing the migration.
5. NotificationService is exported so other modules can inject it later.
   Automatic event hooks are a separate integration step and should be added
   after the base notification module is working.

API ROUTES
----------

POST  /notifications
GET   /notifications
GET   /notifications/my
PATCH /notifications/read-all
PATCH /notifications/:id/read

All routes require JWT authentication.
Only ADMIN can create notifications through POST.
ADMIN can list all notifications.
Other authenticated users can view only their own notifications.

IMPORTANT
---------

This is an in-app notification module, not an email/SMS gateway.
The migration and AppModule registration are intentionally left for manual work.
Review against the current backend before running migrations.
