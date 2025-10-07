-- Fix Foreign Key Constraints to Add CASCADE DELETE
-- This script will drop and recreate foreign key constraints with ON DELETE CASCADE
-- Run this on your Railway PostgreSQL database to fix the deletion issues

-- First, drop all existing foreign key constraints
ALTER TABLE versions DROP CONSTRAINT IF EXISTS versions_project_id_fkey;
ALTER TABLE versions DROP CONSTRAINT IF EXISTS versions_user_id_fkey;

ALTER TABLE collaborators DROP CONSTRAINT IF EXISTS collaborators_project_id_fkey;
ALTER TABLE collaborators DROP CONSTRAINT IF EXISTS collaborators_user_id_fkey;

ALTER TABLE branches DROP CONSTRAINT IF EXISTS branches_project_id_fkey;
ALTER TABLE branches DROP CONSTRAINT IF EXISTS branches_created_by_fkey;

ALTER TABLE project_collaborators DROP CONSTRAINT IF EXISTS project_collaborators_project_id_fkey;
ALTER TABLE project_collaborators DROP CONSTRAINT IF EXISTS project_collaborators_user_id_fkey;

ALTER TABLE pending_changes DROP CONSTRAINT IF EXISTS pending_changes_project_id_fkey;
ALTER TABLE pending_changes DROP CONSTRAINT IF EXISTS pending_changes_user_id_fkey;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;

-- Now add the foreign key constraints back with ON DELETE CASCADE

-- Projects table - if user is deleted, set user_id to NULL
ALTER TABLE projects 
ADD CONSTRAINT projects_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Versions table - if project or user is deleted, delete the version
ALTER TABLE versions 
ADD CONSTRAINT versions_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE versions 
ADD CONSTRAINT versions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Collaborators table - if project or user is deleted, delete the collaborator record
ALTER TABLE collaborators 
ADD CONSTRAINT collaborators_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE collaborators 
ADD CONSTRAINT collaborators_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Branches table - if project or user is deleted, delete the branch
ALTER TABLE branches 
ADD CONSTRAINT branches_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE branches 
ADD CONSTRAINT branches_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

-- Project_collaborators table - if project or user is deleted, delete the collaboration
ALTER TABLE project_collaborators 
ADD CONSTRAINT project_collaborators_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE project_collaborators 
ADD CONSTRAINT project_collaborators_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Pending_changes table - if project or user is deleted, delete the pending changes
ALTER TABLE pending_changes 
ADD CONSTRAINT pending_changes_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE pending_changes 
ADD CONSTRAINT pending_changes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Verification: Check that all constraints are in place
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
  AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('projects', 'versions', 'branches', 'collaborators', 'project_collaborators', 'pending_changes')
ORDER BY tc.table_name, tc.constraint_name;
