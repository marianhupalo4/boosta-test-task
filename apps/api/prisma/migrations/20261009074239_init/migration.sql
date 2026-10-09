-- CreateEnum
CREATE TYPE "QuizVersionStatus" AS ENUM ('draft', 'active', 'archived');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_versions" (
    "id" UUID NOT NULL,
    "quiz_key" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "QuizVersionStatus" NOT NULL DEFAULT 'draft',
    "definition" JSONB NOT NULL,
    "scoring" JSONB NOT NULL,
    "report_template" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" UUID NOT NULL,
    "quiz_version_id" UUID NOT NULL,
    "user_id" UUID,
    "claim_token_hash" TEXT,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempt_answers" (
    "attempt_id" UUID NOT NULL,
    "question_key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "attempt_answers_pkey" PRIMARY KEY ("attempt_id","question_key")
);

-- CreateTable
CREATE TABLE "attempt_results" (
    "attempt_id" UUID NOT NULL,
    "strategy" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL,
    "details" JSONB NOT NULL,

    CONSTRAINT "attempt_results_pkey" PRIMARY KEY ("attempt_id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "template" TEXT NOT NULL,
    "template_version" INTEGER NOT NULL,
    "sections" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_versions_quiz_key_version_key" ON "quiz_versions"("quiz_key", "version");

-- CreateIndex
CREATE UNIQUE INDEX "attempts_claim_token_hash_key" ON "attempts"("claim_token_hash");

-- CreateIndex
CREATE INDEX "attempts_user_id_completed_at_idx" ON "attempts"("user_id", "completed_at" DESC);

-- CreateIndex
CREATE INDEX "attempt_answers_question_key_idx" ON "attempt_answers"("question_key");

-- CreateIndex
CREATE UNIQUE INDEX "reports_attempt_id_key" ON "reports"("attempt_id");

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_quiz_version_id_fkey" FOREIGN KEY ("quiz_version_id") REFERENCES "quiz_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_results" ADD CONSTRAINT "attempt_results_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- At most one active version per quiz.
CREATE UNIQUE INDEX "quiz_versions_one_active_per_quiz" ON "quiz_versions"("quiz_key") WHERE "status" = 'active';
