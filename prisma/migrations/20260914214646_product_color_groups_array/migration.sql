-- Add the new multi-value color field, backfill it from the existing
-- single-value colorGroup so no data is lost, then drop the old column.
ALTER TABLE "Product" ADD COLUMN "colorGroups" TEXT[] NOT NULL DEFAULT '{}';

UPDATE "Product"
SET "colorGroups" = ARRAY["colorGroup"]
WHERE "colorGroup" IS NOT NULL;

ALTER TABLE "Product" DROP COLUMN "colorGroup";
