/*
  Warnings:

  - Changed the type of `uid` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `serverid` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "uid";
ALTER TABLE "User" ADD COLUMN     "uid" STRING NOT NULL;
ALTER TABLE "User" DROP COLUMN "serverid";
ALTER TABLE "User" ADD COLUMN     "serverid" STRING NOT NULL;
