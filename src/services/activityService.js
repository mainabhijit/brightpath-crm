import { supabase, isConfigured } from '../lib/supabaseClient';

/**
 * Activity Audit Log Service Layer
 * Append-only chronological history of lead events (RLS scoped to lead access)
 */

/**
 * Write a single activity row for a lead.
 * Logging failures are reported but never thrown, so a failed audit write
 * does not roll back or block the user action that triggered it.
 */
export async function logActivity({ leadId, actorId = null, type, description, metadata = {} }) {
  if (!leadId || !isConfigured) {
    return { error: 'Invalid lead ID or database not configured' };
  }

  try {
    const { error } = await supabase.from('activities').insert({
      lead_id: leadId,
      actor_id: actorId,
      activity_type: type,
      description,
      metadata,
    });

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('[activityService] logActivity error:', err);
    return { error: err.message || 'Failed to log activity' };
  }
}

/**
 * Fetch the activity timeline for a lead, newest first
 */
export async function getLeadActivities(leadId) {
  if (!leadId || !isConfigured) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        actor:actor_id (id, full_name)
      `)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err) {
    console.error('[activityService] getLeadActivities error:', err);
    return { data: [], error: err.message || 'Failed to fetch activities' };
  }
}
