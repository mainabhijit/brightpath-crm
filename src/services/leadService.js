import { supabase, isConfigured } from '../lib/supabaseClient';
import { friendlyError } from '../lib/errorMessages';
import { logActivity } from './activityService';

/**
 * Lead Management Service Layer
 * Interfaces directly with Supabase PostgreSQL under Row Level Security (RLS)
 */

export const COURSE_OPTIONS = [
  'IIT-JEE Target 2027',
  'IIT-JEE Advanced Intensive',
  'NEET Droppers Batch',
  'NEET Weekend Crash Course',
  'Foundation Class 10 (Science/Math)',
  'Foundation Class 9 Olympiad',
  'Full Stack Web Development Bootcamp',
  'Data Science & AI Foundations',
];

export const SOURCE_OPTIONS = [
  'Website Enquiry',
  'Walk-in Counselling',
  'Parent Referral',
  'Social Media Ad',
  'Google Search',
  'Campus Seminar',
  'Newspaper / Leaflet',
  'Other',
];

export const LOST_REASON_PRESETS = [
  'Joined competitor institute',
  'Financial / fee constraints',
  'Commute distance / center location too far',
  'Changed academic stream or target career',
  'Parent decided against external coaching',
  'Not responding after multiple attempts / Invalid number',
  'Other reason',
];

export const STATUS_OPTIONS = [
  'New',
  'Contacted',
  'Qualified',
  'Converted',
  'Lost',
];

/**
 * Fetch filtered leads with profiles joined
 */
export async function fetchLeads({
  search = '',
  status = 'ALL',
  course = 'ALL',
  source = 'ALL',
  assigneeId = 'ALL',
  sortField = 'created_at',
  sortAsc = false,
} = {}) {
  if (!isConfigured) {
    return { data: [], error: null };
  }

  try {
    let query = supabase
      .from('leads')
      .select(`
        *,
        assigned_to_profile:assigned_to (id, full_name, role),
        created_by_profile:created_by (id, full_name)
      `)
      .order(sortField, { ascending: sortAsc });

    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }

    if (course && course !== 'ALL') {
      query = query.eq('course_interest', course);
    }

    if (source && source !== 'ALL') {
      query = query.eq('source', source);
    }

    if (assigneeId && assigneeId !== 'ALL') {
      query = query.eq('assigned_to', assigneeId);
    }

    if (search && search.trim()) {
      const term = search.trim();
      query = query.or(
        `full_name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%,course_interest.ilike.%${term}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err) {
    console.error('[leadService] fetchLeads error:', err);
    return { data: [], error: friendlyError(err, 'Failed to fetch leads') };
  }
}

/**
 * Fetch a single lead by UUID
 */
export async function fetchLeadById(id) {
  if (!id || !isConfigured) {
    return { data: null, error: 'Invalid lead ID or unconfigured database' };
  }

  try {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        assigned_to_profile:assigned_to (id, full_name, role),
        created_by_profile:created_by (id, full_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('[leadService] fetchLeadById error:', err);
    return { data: null, error: friendlyError(err, 'Lead not found') };
  }
}

/**
 * Create a new student enquiry
 */
export async function createLead(leadData, userId) {
  if (!isConfigured) {
    return { data: null, error: 'Database is not configured' };
  }

  try {
    const trimmedName = leadData.full_name?.trim();
    const trimmedPhone = leadData.phone?.trim();

    if (!trimmedName) throw new Error('Student full name is required');
    if (!trimmedPhone) throw new Error('Phone number is required');

    const payload = {
      full_name: trimmedName,
      phone: trimmedPhone,
      email: leadData.email?.trim() || null,
      course_interest: leadData.course_interest || COURSE_OPTIONS[0],
      source: leadData.source || SOURCE_OPTIONS[0],
      status: leadData.status || 'New',
      assigned_to: leadData.assigned_to || userId || null,
      created_by: userId || null,
      notes: leadData.notes?.trim() || null,
    };

    const { data, error } = await supabase
      .from('leads')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    // Log automated initial activity
    if (data?.id) {
      await logActivity({
        leadId: data.id,
        actorId: userId || null,
        type: 'lead_created',
        description: `New enquiry captured for ${data.course_interest} via ${data.source}`,
        metadata: { source: data.source, course: data.course_interest },
      });
    }

    return { data, error: null };
  } catch (err) {
    console.error('[leadService] createLead error:', err);
    return { data: null, error: friendlyError(err, 'Failed to create lead') };
  }
}

/**
 * Update an existing lead record
 */
export async function updateLead(id, updates, userId) {
  if (!id || !isConfigured) {
    return { data: null, error: 'Invalid lead ID or database not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity if details were updated
    await logActivity({
      leadId: id,
      actorId: userId || null,
      type: 'lead_updated',
      description: 'Lead profile and contact information updated',
      metadata: updates,
    });

    return { data, error: null };
  } catch (err) {
    console.error('[leadService] updateLead error:', err);
    return { data: null, error: friendlyError(err, 'Failed to update lead') };
  }
}

/**
 * Update lead status with mandatory reason check if marking as Lost
 */
export async function updateLeadStatus(id, newStatus, lostReason = null, userId = null) {
  if (!id || !isConfigured) {
    return { data: null, error: 'Invalid lead ID or database not configured' };
  }

  try {
    if (newStatus === 'Lost' && (!lostReason || !lostReason.trim())) {
      throw new Error('A reason is mandatory when marking an enquiry as Lost.');
    }

    const payload = {
      status: newStatus,
      lost_reason: newStatus === 'Lost' ? lostReason.trim() : null,
    };

    const { data, error } = await supabase
      .from('leads')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log status transition activity
    const desc = newStatus === 'Lost'
      ? `Enquiry marked as Lost. Reason: ${lostReason}`
      : `Status changed to ${newStatus}`;

    await logActivity({
      leadId: id,
      actorId: userId || null,
      type: 'status_updated',
      description: desc,
      metadata: { new_status: newStatus, lost_reason: lostReason },
    });

    return { data, error: null };
  } catch (err) {
    console.error('[leadService] updateLeadStatus error:', err);
    return { data: null, error: friendlyError(err, 'Failed to update lead status') };
  }
}

/**
 * Delete a lead (Admins / Managers only per RLS)
 */
export async function deleteLead(id) {
  if (!id || !isConfigured) {
    return { error: 'Invalid lead ID or database not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) throw error;
    // RLS silently filters a disallowed delete to zero rows instead of erroring
    if (!data || data.length === 0) {
      throw new Error("You don't have permission to delete this lead.");
    }
    return { error: null };
  } catch (err) {
    console.error('[leadService] deleteLead error:', err);
    return { error: friendlyError(err, 'Failed to delete lead') };
  }
}

/**
 * Fetch staff counsellors for lead assignment
 */
export async function fetchCounsellors() {
  if (!isConfigured) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .order('full_name');

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err) {
    console.error('[leadService] fetchCounsellors error:', err);
    return { data: [], error: friendlyError(err) };
  }
}
