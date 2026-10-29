import { supabase, isConfigured } from '../lib/supabaseClient';
import { friendlyError } from '../lib/errorMessages';
import { logActivity } from './activityService';

/**
 * Follow-up Scheduling Service Layer
 * Interfaces directly with Supabase PostgreSQL under Row Level Security (RLS)
 */

/**
 * Overdue rule: still pending and the due time has already passed
 */
export function isOverdue(followUp, now = new Date()) {
  return followUp.status === 'pending' && new Date(followUp.due_at) < now;
}

export function getOverdue(followUps, now = new Date()) {
  return followUps.filter((f) => isOverdue(f, now));
}

export function getUpcoming(followUps, now = new Date()) {
  return followUps.filter((f) => f.status === 'pending' && !isOverdue(f, now));
}

export function getCompleted(followUps) {
  return followUps.filter((f) => f.status === 'completed');
}

function formatDue(dueAt) {
  return new Date(dueAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

/**
 * Fetch follow-ups (optionally for a single lead), soonest due first
 */
export async function fetchFollowUps({ leadId = null } = {}) {
  if (!isConfigured) {
    return { data: [], error: null };
  }

  try {
    let query = supabase
      .from('follow_ups')
      .select(`
        *,
        lead:lead_id (id, full_name, course_interest, phone),
        assigned_to_profile:assigned_to (id, full_name)
      `)
      .order('due_at', { ascending: true });

    if (leadId) {
      query = query.eq('lead_id', leadId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err) {
    console.error('[followUpService] fetchFollowUps error:', err);
    return { data: [], error: friendlyError(err, 'Failed to fetch follow-ups') };
  }
}

/**
 * Schedule a new follow-up task against a lead
 */
export async function createFollowUp({ leadId, dueAt, note, assignedTo }, userId) {
  if (!isConfigured) {
    return { data: null, error: 'Database is not configured' };
  }

  try {
    const trimmedNote = note?.trim();

    if (!leadId) throw new Error('Please select an enquiry for this follow-up');
    if (!dueAt || Number.isNaN(new Date(dueAt).getTime())) throw new Error('A valid due date and time is required');
    if (!trimmedNote) throw new Error('Follow-up note is required');

    const payload = {
      lead_id: leadId,
      due_at: new Date(dueAt).toISOString(),
      note: trimmedNote,
      assigned_to: assignedTo || userId || null,
      created_by: userId || null,
    };

    const { data, error } = await supabase
      .from('follow_ups')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    await logActivity({
      leadId,
      actorId: userId,
      type: 'follow_up_scheduled',
      description: `Follow-up scheduled for ${formatDue(data.due_at)}: ${trimmedNote}`,
      metadata: { follow_up_id: data.id, due_at: data.due_at },
    });

    return { data, error: null };
  } catch (err) {
    console.error('[followUpService] createFollowUp error:', err);
    return { data: null, error: friendlyError(err, 'Failed to schedule follow-up') };
  }
}

/**
 * Mark a follow-up as completed (clears its overdue state)
 */
export async function completeFollowUp(followUp, userId) {
  if (!followUp?.id || !isConfigured) {
    return { data: null, error: 'Invalid follow-up or database not configured' };
  }

  try {
    const wasOverdue = isOverdue(followUp);

    const { data, error } = await supabase
      .from('follow_ups')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', followUp.id)
      .select()
      .single();

    if (error) throw error;

    await logActivity({
      leadId: followUp.lead_id,
      actorId: userId,
      type: 'follow_up_completed',
      description: `Follow-up completed${wasOverdue ? ' (was overdue)' : ''}: ${followUp.note}`,
      metadata: { follow_up_id: followUp.id, due_at: followUp.due_at, was_overdue: wasOverdue },
    });

    return { data, error: null };
  } catch (err) {
    console.error('[followUpService] completeFollowUp error:', err);
    return { data: null, error: friendlyError(err, 'Failed to complete follow-up') };
  }
}
