-- ============================================
-- MIGRATION: Add exercise_type column
-- Run this on Supabase SQL Editor
-- ============================================

-- Add exercise_type column with default 'weighted'
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS exercise_type TEXT DEFAULT 'weighted'
  CHECK (exercise_type IN ('weighted', 'bodyweight', 'timed'));

-- Categorize bodyweight exercises
UPDATE exercises SET exercise_type = 'bodyweight' WHERE name IN (
  'Pompes',
  'Tractions',
  'Dips pectoraux',
  'Dips triceps',
  'Relevé de jambes suspendu',
  'Crunch',
  'Russian twist',
  'Ab wheel (roue abdominale)'
);

-- Categorize timed/isometric exercises
UPDATE exercises SET exercise_type = 'timed' WHERE name IN (
  'Planche (gainage)'
);
