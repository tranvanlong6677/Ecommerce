-- DropIndex
DROP INDEX "Role_name_key";

 CREATE UNIQUE INDEX Role_name_unique
   ON "Permission" (name)
   WHERE "deletedAt" IS NULL;