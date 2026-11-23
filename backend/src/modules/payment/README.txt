PAYMENT & TRANSACTION MANAGEMENT MODULE
========================================

Copy this entire "payment" folder into:
backend/src/modules/

Destination:
backend/src/modules/payment/

Included:
- entities/payment.entity.ts
- dto/record-payment.dto.ts
- payment.controller.ts
- payment.service.ts
- payment.module.ts

FEATURES
--------
- Admin records a verified payment against an issued invoice.
- Supported methods: CASH, CARD, BANK_TRANSFER, MOBILE_BANKING.
- Stores amount, transaction reference, notes, payment time and recording admin.
- Payment amount must equal the invoice's full total; partial payments are not supported.
- A successful payment changes the invoice status from ISSUED to PAID.
- One payment per invoice is enforced.
- Admin can view all payments.
- Patients can view only their own payment history.
- Payment and invoice status update are saved in one database transaction.
- This is manual payment recording; no external payment gateway is connected.

MANUAL INTEGRATION REQUIRED
---------------------------

1. Register PaymentModule in backend/src/app.module.ts:

   import { PaymentModule } from "./modules/payment/payment.module";

   Add PaymentModule after BillingModule in the AppModule imports array.

2. Create a TypeORM migration for table "payments".

   Columns:
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
   invoiceId UUID NOT NULL UNIQUE
   patientId UUID NOT NULL
   recordedById UUID NOT NULL
   amount NUMERIC(10,2) NOT NULL
   paymentMethod VARCHAR(30) NOT NULL
   status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED'
   transactionReference VARCHAR(120) NULL UNIQUE
   notes TEXT NULL
   paidAt TIMESTAMP NOT NULL DEFAULT now()
   createdAt TIMESTAMP NOT NULL DEFAULT now()
   updatedAt TIMESTAMP NOT NULL DEFAULT now()

   Foreign keys:
   invoiceId -> invoices(id), ON DELETE RESTRICT
   patientId -> users(id), ON DELETE RESTRICT
   recordedById -> users(id), ON DELETE RESTRICT

   Checks:
   amount > 0
   paymentMethod IN ('CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_BANKING')
   status IN ('COMPLETED')

3. Confirm TypeORM entity loading strategy includes this entity (the module uses
   TypeOrmModule.forFeature).

4. Run pnpm run build, then migration:run after reviewing the migration.

API ROUTES
----------

POST /payments/invoices/:invoiceId/record
GET  /payments
GET  /payments/my
GET  /payments/:id

All routes require JWT authentication.
Only ADMIN can record payments.
ADMIN can list all payments; PATIENT can list only their own.

IMPORTANT
---------

The module depends on the Billing module's Invoice entity and invoices table.
Merge/sync the Billing module before integrating this module.
The migration and AppModule registration are intentionally left for manual work.
Review the code against the current local backend before running migrations.
