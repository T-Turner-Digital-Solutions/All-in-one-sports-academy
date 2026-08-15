-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "relatedAppointmentId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "creditReason" TEXT,
ADD COLUMN     "redeemedAt" TIMESTAMP(3),
ADD COLUMN     "redeemedForAppointmentId" TEXT;

-- CreateIndex
CREATE INDEX "Notification_relatedAppointmentId_type_idx" ON "Notification"("relatedAppointmentId", "type");
