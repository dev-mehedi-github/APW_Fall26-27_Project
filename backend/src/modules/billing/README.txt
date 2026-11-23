BILLING & INVOICE MODULE
=======================

Copy this entire "billing" folder into:
backend/src/modules/

Destination:
backend/src/modules/billing/

Included:
- entities/invoice.entity.ts
- entities/invoice-item.entity.ts
- dto/create-appointment-invoice.dto.ts
- dto/create-lab-invoice.dto.ts
- dto/cancel-invoice.dto.ts
- billing.controller.ts
- billing.service.ts
- billing.module.ts

FEATURES
--------
- Admin generates an invoice from a confirmed appointment.
- Admin generates an invoice from an existing laboratory order.
- Appointment invoice amount is taken from the doctor's consultationFee.
- Laboratory invoice amounts are taken from saved laboratory order item price snapshots.
- Invoice line items preserve descriptions, quantities and unit prices.
- Admin can view all invoices and cancel unpaid invoices.
- Patients can view only their own invoices.
- Duplicate invoices for the same appointment or laboratory order are prevented.
- Invoice creation saves the invoice and its line items in a database transaction.

MANUAL INTEGRATION REQUIRED
---------------------------

1. Register BillingModule in backend/src/app.module.ts:

   import { BillingModule } from "./modules/billing/billing.module";

   Add BillingModule to the AppModule imports array.

2. Create a TypeORM migration for:
   TABLE: invoices

   Columns (respect the project's SnakeNamingStrategy):
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
   invoice_number VARCHAR(40) UNIQUE NOT NULL
   patientId UUID NOT NULL
   createdById UUID NOT NULL
   appointmentId UUID NULL
   labOrderId UUID NULL
   subtotal NUMERIC(10,2) NOT NULL
   discount NUMERIC(10,2) NOT NULL DEFAULT 0
   total NUMERIC(10,2) NOT NULL
   status VARCHAR(20) NOT NULL DEFAULT 'ISSUED'
   issuedAt TIMESTAMP NOT NULL DEFAULT now()
   due_at TIMESTAMP NULL
   notes TEXT NULL
   createdAt TIMESTAMP NOT NULL DEFAULT now()
   updatedAt TIMESTAMP NOT NULL DEFAULT now()

   Foreign keys:
   patientId -> users(id), ON DELETE RESTRICT
   createdById -> users(id), ON DELETE RESTRICT
   appointmentId -> appointments(id), ON DELETE RESTRICT
   labOrderId -> lab_orders(id), ON DELETE RESTRICT

   Add unique indexes on appointmentId and labOrderId (PostgreSQL permits
   multiple NULL values in ordinary unique indexes).

   Add a CHECK constraint requiring exactly one of appointmentId or labOrderId
   to be non-NULL. Add non-negative checks for subtotal, discount and total.

   TABLE: invoice_items

   Columns:
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
   invoiceId UUID NOT NULL
   description VARCHAR(180) NOT NULL
   quantity INTEGER NOT NULL DEFAULT 1
   unit_price NUMERIC(10,2) NOT NULL
   line_total NUMERIC(10,2) NOT NULL
   createdAt TIMESTAMP NOT NULL DEFAULT now()

   Foreign key:
   invoiceId -> invoices(id), ON DELETE CASCADE

   Add CHECK constraints: quantity > 0, unit_price >= 0, line_total >= 0.

3. Run pnpm run build.
4. Run pnpm run migration:run only after the migration is reviewed.
5. Keep payment processing for the separate Payment & Transactions module.

API ROUTES
----------

POST   /billing/invoices/appointments/:appointmentId
POST   /billing/invoices/lab-orders/:labOrderId
GET    /billing/invoices
GET    /billing/invoices/my
GET    /billing/invoices/:id
PATCH  /billing/invoices/:id/cancel

All routes require JWT authentication.
Only ADMIN can generate and cancel invoices.
ADMIN can list all invoices; PATIENT can list only their own.

NOTES
-----

This folder is a source-module starter. The migration and AppModule registration
are intentionally left for manual implementation. Review against the current
local backend before applying migrations.
