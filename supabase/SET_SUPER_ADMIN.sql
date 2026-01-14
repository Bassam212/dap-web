-- Instructions to set a user as super_admin
-- Replace YOUR_CLERK_USER_ID with your actual Clerk user ID
-- Replace YOUR_ORG_ID with your organization's UUID from the organizations table

-- Step 1: Find your Clerk user ID
-- Go to Clerk Dashboard → Users → Click on your user → Copy the User ID (starts with "user_")

-- Step 2: Find your organization ID in Supabase
-- SELECT id, clerk_org_id, name FROM organizations;

-- Step 3: Run this command (replace the placeholders):
UPDATE organization_members
SET role = 'super_admin'
WHERE clerk_user_id = 'YOUR_CLERK_USER_ID'  -- Replace with your actual Clerk user ID (e.g., 'user_2abc123xyz')
  AND organization_id = (
    SELECT id FROM organizations
    WHERE clerk_org_id = 'YOUR_CLERK_ORG_ID'  -- Replace with your Clerk org ID (e.g., 'org_2xyz123abc')
  );

-- Verify it worked:
SELECT
  om.role,
  om.email,
  om.clerk_user_id,
  o.name as organization_name
FROM organization_members om
JOIN organizations o ON o.id = om.organization_id
WHERE om.clerk_user_id = 'YOUR_CLERK_USER_ID';  -- Replace with your actual Clerk user ID

-- You should see role = 'super_admin'
