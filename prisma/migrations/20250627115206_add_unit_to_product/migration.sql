/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'piece';

-- CreateIndex
CREATE UNIQUE INDEX "Product_userId_name_key" ON "Product"("userId", "name");
