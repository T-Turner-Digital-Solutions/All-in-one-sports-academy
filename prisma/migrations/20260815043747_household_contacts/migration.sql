-- CreateTable
CREATE TABLE "HouseholdContact" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseholdContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HouseholdContact_householdId_idx" ON "HouseholdContact"("householdId");

-- AddForeignKey
ALTER TABLE "HouseholdContact" ADD CONSTRAINT "HouseholdContact_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
