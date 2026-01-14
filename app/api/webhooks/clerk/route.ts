import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// Helper function to get Supabase admin client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!
  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create new Svix instance with webhook secret
  const wh = new Webhook(webhookSecret)

  let evt: WebhookEvent

  // Verify webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Webhook verification failed', err)
    return new Response('Error: Verification failed', { status: 400 })
  }

  // Handle the webhook
  const eventType = evt.type

  try {
    switch (eventType) {
      case 'organization.created':
        await handleOrganizationCreated(evt)
        break

      case 'organization.updated':
        await handleOrganizationUpdated(evt)
        break

      case 'organization.deleted':
        await handleOrganizationDeleted(evt)
        break

      case 'organizationMembership.created':
        await handleMembershipCreated(evt)
        break

      case 'organizationMembership.updated':
        await handleMembershipUpdated(evt)
        break

      case 'organizationMembership.deleted':
        await handleMembershipDeleted(evt)
        break

      case 'user.created':
        await handleUserCreated(evt)
        break

      default:
        console.log(`Unhandled webhook event type: ${eventType}`)
    }

    return new Response('Webhook processed successfully', { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Error processing webhook', { status: 500 })
  }
}

async function handleOrganizationCreated(evt: WebhookEvent) {
  if (evt.type !== 'organization.created') return

  const supabaseAdmin = getSupabaseAdmin()
  const { id, name, slug, created_by } = evt.data

  console.log('Creating organization in Supabase:', { id, name, slug })

  // Insert organization into Supabase
  const { error: orgError } = await supabaseAdmin
    .from('organizations')
    .insert({
      clerk_org_id: id,
      name: name,
      slug: slug,
    })

  if (orgError) {
    console.error('Error creating organization:', orgError)
    throw orgError
  }

  // Get the organization ID from Supabase
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('clerk_org_id', id)
    .single()

  if (!org) {
    throw new Error('Organization not found after creation')
  }

  // Add creator as super_admin
  const { error: memberError } = await supabaseAdmin
    .from('organization_members')
    .insert({
      organization_id: org.id,
      clerk_user_id: created_by,
      email: '', // Will be updated by membership event
      role: 'super_admin'
    })

  if (memberError) {
    console.error('Error adding super_admin:', memberError)
    throw memberError
  }

  console.log('Organization created successfully')
}

async function handleOrganizationUpdated(evt: WebhookEvent) {
  if (evt.type !== 'organization.updated') return

  const supabaseAdmin = getSupabaseAdmin()
  const { id, name, slug } = evt.data

  console.log('Updating organization in Supabase:', { id, name, slug })

  const { error } = await supabaseAdmin
    .from('organizations')
    .update({
      name: name,
      slug: slug,
    })
    .eq('clerk_org_id', id)

  if (error) {
    console.error('Error updating organization:', error)
    throw error
  }

  console.log('Organization updated successfully')
}

async function handleOrganizationDeleted(evt: WebhookEvent) {
  if (evt.type !== 'organization.deleted') return

  const supabaseAdmin = getSupabaseAdmin()
  const { id } = evt.data

  console.log('Deleting organization from Supabase:', { id })

  const { error } = await supabaseAdmin
    .from('organizations')
    .delete()
    .eq('clerk_org_id', id)

  if (error) {
    console.error('Error deleting organization:', error)
    throw error
  }

  console.log('Organization deleted successfully')
}

async function handleMembershipCreated(evt: WebhookEvent) {
  if (evt.type !== 'organizationMembership.created') return

  const supabaseAdmin = getSupabaseAdmin()
  const { organization, public_user_data, role } = evt.data

  console.log('Adding member to organization:', {
    org: organization.id,
    user: public_user_data?.user_id,
    role
  })

  // Get organization ID from Supabase
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('clerk_org_id', organization.id)
    .single()

  if (!org) {
    throw new Error('Organization not found')
  }

  // Map Clerk role to our role system
  let mappedRole = 'user'
  if (role === 'admin' || role === 'org:admin') {
    mappedRole = 'admin'
  }
  // Note: super_admin is only set during org creation or manually

  // Insert or update member
  const { error } = await supabaseAdmin
    .from('organization_members')
    .upsert({
      organization_id: org.id,
      clerk_user_id: public_user_data?.user_id,
      email: public_user_data?.identifier || '',
      role: mappedRole
    }, {
      onConflict: 'organization_id,clerk_user_id'
    })

  if (error) {
    console.error('Error adding member:', error)
    throw error
  }

  console.log('Member added successfully')
}

async function handleMembershipUpdated(evt: WebhookEvent) {
  if (evt.type !== 'organizationMembership.updated') return

  const supabaseAdmin = getSupabaseAdmin()
  const { organization, public_user_data, role } = evt.data

  console.log('Updating member:', {
    org: organization.id,
    user: public_user_data?.user_id,
    role
  })

  // Get organization ID from Supabase
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('clerk_org_id', organization.id)
    .single()

  if (!org) {
    throw new Error('Organization not found')
  }

  // Map Clerk role to our role system
  let mappedRole = 'user'
  if (role === 'admin' || role === 'org:admin') {
    mappedRole = 'admin'
  }

  // Update member role (but don't override super_admin)
  const { data: existingMember } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', org.id)
    .eq('clerk_user_id', public_user_data?.user_id)
    .single()

  // Don't downgrade super_admin
  if (existingMember?.role === 'super_admin') {
    console.log('Skipping update: user is super_admin')
    return
  }

  const { error } = await supabaseAdmin
    .from('organization_members')
    .update({
      role: mappedRole,
      email: public_user_data?.identifier || ''
    })
    .eq('organization_id', org.id)
    .eq('clerk_user_id', public_user_data?.user_id)

  if (error) {
    console.error('Error updating member:', error)
    throw error
  }

  console.log('Member updated successfully')
}

async function handleMembershipDeleted(evt: WebhookEvent) {
  if (evt.type !== 'organizationMembership.deleted') return

  const supabaseAdmin = getSupabaseAdmin()
  const { organization, public_user_data } = evt.data

  console.log('Removing member from organization:', {
    org: organization.id,
    user: public_user_data?.user_id
  })

  // Get organization ID from Supabase
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('clerk_org_id', organization.id)
    .single()

  if (!org) {
    throw new Error('Organization not found')
  }

  // Delete member
  const { error } = await supabaseAdmin
    .from('organization_members')
    .delete()
    .eq('organization_id', org.id)
    .eq('clerk_user_id', public_user_data?.user_id)

  if (error) {
    console.error('Error removing member:', error)
    throw error
  }

  console.log('Member removed successfully')
}

async function handleUserCreated(evt: WebhookEvent) {
  if (evt.type !== 'user.created') return

  const { id, email_addresses } = evt.data

  console.log('User created:', { id, email: email_addresses?.[0]?.email_address })

  // Optionally: Create a default organization for the user
  // This depends on your business logic - you might want users to explicitly create orgs

  // For now, we'll let organizations be created manually or through Clerk's UI
}
