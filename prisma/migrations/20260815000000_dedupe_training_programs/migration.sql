-- Dedupe TrainingProgram rows before enforcing uniqueness on `name`.
--
-- The seed script re-inserted the same 5 training programs on every deploy
-- (createMany + skipDuplicates has no effect without a unique constraint to
-- collide against), so production accumulated many duplicate rows. This
-- migration keeps the oldest row per name, repoints any Appointment/Package
-- rows that reference a duplicate onto the keeper, then deletes the rest
-- before adding the unique index.

WITH ranked AS (
  SELECT
    id,
    name,
    FIRST_VALUE(id) OVER (PARTITION BY name ORDER BY "createdAt" ASC, id ASC) AS keep_id
  FROM "TrainingProgram"
),
dupes AS (
  SELECT id, keep_id FROM ranked WHERE id <> keep_id
)
UPDATE "Appointment" a
SET "trainingProgramId" = d.keep_id
FROM dupes d
WHERE a."trainingProgramId" = d.id;

WITH ranked AS (
  SELECT
    id,
    name,
    FIRST_VALUE(id) OVER (PARTITION BY name ORDER BY "createdAt" ASC, id ASC) AS keep_id
  FROM "TrainingProgram"
),
dupes AS (
  SELECT id, keep_id FROM ranked WHERE id <> keep_id
)
UPDATE "Package" p
SET "trainingProgramId" = d.keep_id
FROM dupes d
WHERE p."trainingProgramId" = d.id;

WITH ranked AS (
  SELECT
    id,
    name,
    FIRST_VALUE(id) OVER (PARTITION BY name ORDER BY "createdAt" ASC, id ASC) AS keep_id
  FROM "TrainingProgram"
)
DELETE FROM "TrainingProgram" t
USING ranked r
WHERE t.id = r.id AND r.id <> r.keep_id;

-- AlterTable
CREATE UNIQUE INDEX "TrainingProgram_name_key" ON "TrainingProgram"("name");
