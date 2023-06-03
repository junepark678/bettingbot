/*
  Warnings:

  - You are about to drop the column `serverid` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `uid` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[combid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `combid` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "serverid";
ALTER TABLE "User" DROP COLUMN "uid";
ALTER TABLE "User" ADD COLUMN     "combid" STRING NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_combid_key" ON "User"("combid");
