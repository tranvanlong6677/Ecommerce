-- DropIndex
DROP INDEX "Permission_id_deletedAt_idx";

-- DropIndex
DROP INDEX "Permission_path_method_deletedAt_idx";

-- CreateIndex
CREATE INDEX "Permission_path_method_idx" ON "Permission"("path", "method");
