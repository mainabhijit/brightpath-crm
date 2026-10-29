import { supabase, isConfigured } from '../lib/supabaseClient';
import { STATUS_OPTIONS } from './leadService';

/**
 * Dashboard Metrics Service Layer
 * All counts are computed from rows the current user can see under RLS,
 * so a counsellor's dashboard reconciles with their own Leads table.
 */

const EMPTY_METRICS = {
  totalLeads: 0,
  newLeads: 0,
  convertedLeads: 0,
  overdueCount: 0,
  conversionRate: 0,
  statusBreakdown: STATUS_OPTIONS.map((status) => ({ label: status, count: 0 })),
  sourceBreakdown: [],
  urgentFollowUps: [],
};

/**
 * Conversion rate as a percentage rounded to 1 decimal; 0 when there are no leads
 */
export function computeConversionRate(converted, total) {
  if (!total) return 0;
  return Math.round((converted / total) * 1000) / 10;
}

/**
 * Fetch and aggregate every dashboard metric in two queries
 */
export async function fetchDashboardMetrics() {
  if (!isConfigured) {
    return { data: EMPTY_METRICS, error: null };
  }

  try {
    const [leadsRes, overdueRes] = await Promise.all([
      supabase.from('leads').select('id, status, source'),
      supabase
        .from('follow_ups')
        .select(`
          id, lead_id, due_at, note,
          lead:lead_id (id, full_name, course_interest, phone)
        `)
        .eq('status', 'pending')
        .lt('due_at', new Date().toISOString())
        .order('due_at', { ascending: true }),
    ]);

    if (leadsRes.error) throw leadsRes.error;
    if (overdueRes.error) throw overdueRes.error;

    const leads = leadsRes.data || [];
    const overdue = overdueRes.data || [];

    const statusCounts = {};
    const sourceCounts = {};
    for (const lead of leads) {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
      sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1;
    }

    const totalLeads = leads.length;
    const convertedLeads = statusCounts.Converted || 0;

    return {
      data: {
        totalLeads,
        newLeads: statusCounts.New || 0,
        convertedLeads,
        overdueCount: overdue.length,
        conversionRate: computeConversionRate(convertedLeads, totalLeads),
        // Pipeline order, every stage shown even at zero
        statusBreakdown: STATUS_OPTIONS.map((status) => ({
          label: status,
          count: statusCounts[status] || 0,
        })),
        // Only sources that have leads, largest first
        sourceBreakdown: Object.entries(sourceCounts)
          .map(([label, count]) => ({ label, count }))
          .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
        // Longest-overdue first
        urgentFollowUps: overdue.slice(0, 5),
      },
      error: null,
    };
  } catch (err) {
    console.error('[dashboardService] fetchDashboardMetrics error:', err);
    return { data: EMPTY_METRICS, error: err.message || 'Failed to load dashboard metrics' };
  }
}
