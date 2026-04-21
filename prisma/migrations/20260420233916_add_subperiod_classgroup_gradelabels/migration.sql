-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "sub_period_id" UUID;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "class_group_id" UUID;

-- AlterTable
ALTER TABLE "degrees" ADD COLUMN     "grade_level_labels" JSONB;

-- CreateTable
CREATE TABLE "sub_periods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" SMALLINT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "closed_at" TIMESTAMPTZ,
    "period_id" UUID NOT NULL,

    CONSTRAINT "sub_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "period_id" UUID NOT NULL,

    CONSTRAINT "class_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sub_periods_period_id_slug_key" ON "sub_periods"("period_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "sub_periods_period_id_order_key" ON "sub_periods"("period_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "class_groups_period_id_slug_key" ON "class_groups"("period_id", "slug");

-- AddForeignKey
ALTER TABLE "sub_periods" ADD CONSTRAINT "sub_periods_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_groups" ADD CONSTRAINT "class_groups_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_class_group_id_fkey" FOREIGN KEY ("class_group_id") REFERENCES "class_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_sub_period_id_fkey" FOREIGN KEY ("sub_period_id") REFERENCES "sub_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
