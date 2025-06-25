-- CreateEnum
CREATE TYPE "LectureType" AS ENUM ('ONLINE', 'OFFLINE');

-- AlterTable
ALTER TABLE "Lecture" ADD COLUMN     "type" "LectureType" NOT NULL DEFAULT 'OFFLINE';
