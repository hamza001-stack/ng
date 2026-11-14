-- Academy payments: Stripe Checkout fields on enrolments + sales table.
ALTER TABLE "nv_academy_enrolment"
  ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'NONE',
  ADD COLUMN "amountPence" INTEGER,
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'gbp',
  ADD COLUMN "stripeSessionId" TEXT,
  ADD COLUMN "stripePaymentId" TEXT,
  ADD COLUMN "paymentIsTest" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "paidAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "nv_academy_enrolment_stripeSessionId_key" ON "nv_academy_enrolment"("stripeSessionId");
CREATE INDEX "nv_academy_enrolment_paymentStatus_idx" ON "nv_academy_enrolment"("paymentStatus");

CREATE TABLE "nv_academy_payment" (
  "id" TEXT NOT NULL,
  "enrolmentId" TEXT,
  "programmeId" TEXT NOT NULL,
  "amountPence" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'gbp',
  "stripeSessionId" TEXT NOT NULL,
  "stripePaymentId" TEXT,
  "isTest" BOOLEAN NOT NULL DEFAULT false,
  "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "nv_academy_payment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "nv_academy_payment_stripeSessionId_key" ON "nv_academy_payment"("stripeSessionId");
CREATE INDEX "nv_academy_payment_enrolmentId_idx" ON "nv_academy_payment"("enrolmentId");
CREATE INDEX "nv_academy_payment_programmeId_idx" ON "nv_academy_payment"("programmeId");
CREATE INDEX "nv_academy_payment_isTest_paidAt_idx" ON "nv_academy_payment"("isTest", "paidAt");
ALTER TABLE "nv_academy_payment" ADD CONSTRAINT "nv_academy_payment_enrolmentId_fkey"
  FOREIGN KEY ("enrolmentId") REFERENCES "nv_academy_enrolment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
