-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
