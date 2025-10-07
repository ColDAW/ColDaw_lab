-- ============================================
-- Fix Database Constraints for ColDaw
-- ============================================
-- This script fixes foreign key constraint issues
-- by ensuring default users exist and updating constraints

-- 1. Create system users if they don't exist
-- ============================================

-- Create 'VST Plugin' system user
INSERT INTO users (id, email, password, username, name, created_at, last_login)
VALUES (
  'vst-plugin-system',
  'vst@system.local',
  '$2b$10$dummyHashForSystemUser',
  'VST Plugin',
  'VST Plugin System',
  EXTRACT(EPOCH FROM NOW()) * 1000,
  EXTRACT(EPOCH FROM NOW()) * 1000
)
ON CONFLICT (id) DO NOTHING;

-- Create 'Anonymous' system user
INSERT INTO users (id, email, password, username, name, created_at, last_login)
VALUES (
  'anonymous-system',
  'anonymous@system.local',
  '$2b$10$dummyHashForSystemUser',
  'Anonymous',
  'Anonymous User',
  EXTRACT(EPOCH FROM NOW()) * 1000,
  EXTRACT(EPOCH FROM NOW()) * 1000
)
ON CONFLICT (id) DO NOTHING;

-- 2. Update existing branches with NULL created_by
-- ============================================
UPDATE branches
SET created_by = 'anonymous-system'
WHERE created_by IS NULL;

-- 3. Update existing versions with invalid user_id
-- ============================================

-- First, create any missing users that are referenced in versions
INSERT INTO users (id, email, password, username, name, created_at, last_login)
SELECT DISTINCT
  v.user_id,
  v.user_id || '@legacy.local',
  '$2b$10$dummyHashForLegacyUser',
  v.user_id,
  v.user_id,
  EXTRACT(EPOCH FROM NOW()) * 1000,
  EXTRACT(EPOCH FROM NOW()) * 1000
FROM versions v
LEFT JOIN users u ON v.user_id = u.id
WHERE u.id IS NULL
  AND v.user_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Update versions where user_id = 'VST Plugin'
UPDATE versions
SET user_id = 'vst-plugin-system'
WHERE user_id = 'VST Plugin';

-- Update versions where user_id = 'Anonymous'
UPDATE versions
SET user_id = 'anonymous-system'
WHERE user_id = 'Anonymous';

-- 4. Update existing branches with invalid created_by
-- ============================================

-- Create any missing users that are referenced in branches
INSERT INTO users (id, email, password, username, name, created_at, last_login)
SELECT DISTINCT
  b.created_by,
  b.created_by || '@legacy.local',
  '$2b$10$dummyHashForLegacyUser',
  b.created_by,
  b.created_by,
  EXTRACT(EPOCH FROM NOW()) * 1000,
  EXTRACT(EPOCH FROM NOW()) * 1000
FROM branches b
LEFT JOIN users u ON b.created_by = u.id
WHERE u.id IS NULL
  AND b.created_by IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Update branches where created_by = 'anonymous'
UPDATE branches
SET created_by = 'anonymous-system'
WHERE created_by = 'anonymous';

-- 5. Verify the fixes
-- ============================================

-- Check for any remaining NULL or invalid references
SELECT 
  'Branches with NULL created_by' AS issue,
  COUNT(*) AS count
FROM branches
WHERE created_by IS NULL

UNION ALL

SELECT 
  'Branches with invalid created_by' AS issue,
  COUNT(*) AS count
FROM branches b
LEFT JOIN users u ON b.created_by = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
  'Versions with invalid user_id' AS issue,
  COUNT(*) AS count
FROM versions v
LEFT JOIN users u ON v.user_id = u.id
WHERE u.id IS NULL;

-- Display system users created
SELECT 
  'System user: ' || username AS info,
  id,
  email
FROM users
WHERE id IN ('vst-plugin-system', 'anonymous-system');

-- ============================================
-- Success message
-- ============================================
SELECT '✅ Database constraints fixed successfully!' AS status;
