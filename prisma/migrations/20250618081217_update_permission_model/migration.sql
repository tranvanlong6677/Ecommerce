-- DropIndex
DROP INDEX "Permission_path_method_idx";

-- CreateIndex
CREATE INDEX "Permission_path_method_deletedAt_idx" ON "Permission"("path", "method", "deletedAt");

-- CreateIndex
CREATE INDEX "Permission_id_deletedAt_idx" ON "Permission"("id", "deletedAt");
