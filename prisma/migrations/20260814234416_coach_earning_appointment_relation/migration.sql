-- AddForeignKey
ALTER TABLE "CoachEarning" ADD CONSTRAINT "CoachEarning_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
