import supabaseAdmin from '@/lib/supabase/admin'

/**
 * Whether the logged-in user may invite/edit staff for this company.
 * Uses profiles.role === 'admin' OR companies.owner_id === userId (organisation creator).
 */
export async function canManageCompanyStaff(userId, companyId, profileRole) {
  if (profileRole === 'admin') return true

  const { data, error } = await supabaseAdmin
    .from('companies')
    .select('owner_id')
    .eq('id', companyId)
    .maybeSingle()

  if (!error && data?.owner_id != null && data.owner_id === userId) {
    return true
  }

  return false
}
