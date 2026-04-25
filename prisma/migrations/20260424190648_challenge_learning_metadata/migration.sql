-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "learningObjective" TEXT NOT NULL DEFAULT 'Practice a real technical skill with clear feedback.',
ADD COLUMN     "relatedChallenges" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "validationMetadata" JSONB;
