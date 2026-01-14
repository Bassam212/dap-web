# Organization Management Setup Guide

This guide will help you set up the organization management system with Clerk and Supabase.

## Prerequisites
- Clerk account with Organizations feature enabled
- Supabase project set up
- Environment variables configured

## Step 1: Enable Clerk Organizations

1. Go to your Clerk Dashboard: https://dashboard.clerk.com
2. Navigate to your application
3. Click on "Organizations" in the left sidebar
4. Enable Organizations feature
5. Configure organization settings:
   - **Enable automatic organization creation**: OFF (we'll handle this programmatically)
   - **Allow users to create organizations**: ON
   - **Allow users to delete organizations**: OFF (only super_admin through our UI)

## Step 2: Configure Organization Roles in Clerk

1. In Clerk Dashboard, go to Organizations → Roles
2. Create the following roles:

### Super Admin Role
- **Name**: `super_admin`
- **Key**: `super_admin`
- **Permissions**:
  - `org:manage`
  - `org:delete`
  - `org:billing:read`
  - `org:billing:manage`
  - `org:domains:read`
  - `org:domains:manage`
  - `org:members:read`
  - `org:members:manage`

### Admin Role
- **Name**: `admin`
- **Key**: `admin`
- **Permissions**:
  - `org:billing:read`
  - `org:billing:manage`
  - `org:domains:read`
  - `org:domains:manage`
  - `org:members:read`
  - `org:members:manage`

### User Role (Basic Member)
- **Name**: `user`
- **Key**: `user`
- **Permissions**:
  - `org:members:read` (can view other members)

## Step 3: Set Up Clerk Webhooks

1. In Clerk Dashboard, go to Webhooks
2. Click "Add Endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/clerk`
4. Select the following events:
   - `organization.created`
   - `organization.updated`
   - `organization.deleted`
   - `organizationMembership.created`
   - `organizationMembership.updated`
   - `organizationMembership.deleted`
   - `user.created`
5. Copy the Signing Secret and add it to your `.env.local`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

## Step 4: Run Supabase Migration

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy the contents of `supabase/migrations/001_create_organizations.sql`
4. Paste and run the migration

This will create:
- `organizations` table
- `organization_members` table
- Add `organization_id` to `guides` and `analytics` tables
- Set up Row Level Security (RLS) policies
- Create necessary indexes

## Step 5: Environment Variables

Add these to your `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
```

## Step 6: Update Supabase Client for Auth

The app uses Supabase RLS to enforce permissions. When making requests from the client, we need to set the user's JWT token:

```typescript
import { useAuth } from '@clerk/nextjs'

const { getToken } = useAuth()
const token = await getToken({ template: 'supabase' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }
)
```

## Step 7: Testing

1. Sign up a new user - they should automatically create an organization and become super_admin
2. As super_admin, invite another user
3. Verify the invited user receives an email
4. Verify role-based access control works
5. Test organization data isolation (users can only see their org's data)

## Permissions Summary

### Super Admin
- ✅ Manage organization settings
- ✅ Delete organization
- ✅ View and manage billing
- ✅ View and manage domains
- ✅ View and manage members
- ✅ Assign roles (admin, user)
- ❌ Cannot assign super_admin role (must be done manually in Supabase)

### Admin
- ❌ Cannot manage organization settings
- ❌ Cannot delete organization
- ✅ View and manage billing
- ✅ View and manage domains
- ✅ View and manage members
- ✅ Assign roles (user only, not admin)

### User (Basic Member)
- ❌ Cannot manage organization
- ❌ Cannot manage billing
- ❌ Cannot manage domains
- ✅ View organization members
- ❌ Cannot invite or manage members

## Role Escalation Security

**Important**: Only super_admin can be assigned through the database. To prevent privilege escalation:
1. Super admin role can ONLY be set via Supabase SQL
2. Admins cannot promote themselves or others to super_admin
3. Only ONE super_admin per organization (the creator)

To manually change a user to super_admin (rare case):
```sql
UPDATE organization_members
SET role = 'super_admin'
WHERE organization_id = 'org-uuid'
AND clerk_user_id = 'user_xxxxx';
```

## Troubleshooting

### Webhook not receiving events
- Check webhook URL is publicly accessible
- Verify signing secret is correct
- Check Clerk Dashboard → Webhooks → Event Logs

### RLS policies blocking queries
- Ensure JWT token is being passed correctly
- Check user is a member of the organization
- Verify user has correct role

### User can't see organization data
- Check `organization_members` table has correct entries
- Verify `organization_id` is set on guides and analytics
- Check RLS policies are enabled
