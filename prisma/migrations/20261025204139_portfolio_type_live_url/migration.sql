-- CreateEnum
CREATE TYPE "PortfolioType" AS ENUM ('WEBSITE', 'MOBILE_APP', 'UI_UX_DESIGN', 'OTHER');

-- AlterTable
ALTER TABLE "PortfolioItem" ADD COLUMN     "liveUrl" TEXT,
ADD COLUMN     "type" "PortfolioType" NOT NULL DEFAULT 'OTHER';
