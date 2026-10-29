import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, ArrowUpRight, Calendar, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import MetricCards from '../features/dashboard/MetricCards';
import StatusDistributionChart from '../features/dashboard/StatusDistributionChart';
import SourceDistributionChart from '../features/dashboard/SourceDistributionChart';
import UrgentFollowUpsCard from '../features/dashboard/UrgentFollowUpsCard';
import { fetchDashboardMetrics } from '../services/dashboardService';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loadedAt, setLoadedAt] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const applyResult = useCallback(({ data, error }) => {
    setMetrics(data);
    setLoadedAt(new Date());
    setErrorMsg(error || '');
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchDashboardMetrics().then(applyResult);
  }, [applyResult]);

  function handleRefresh() {
    setRefreshing(true);
    fetchDashboardMetrics().then(applyResult);
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Executive Dashboard</h2>
          <p className="page-description">
            Enquiry pipeline, counsellor activity, and follow-up metrics.
          </p>
        </div>
        <div className="page-actions">
          <Badge variant="neutral" icon={<Calendar size={13} />}>
            Academic Session 2026–27
          </Badge>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw size={14} />}
            onClick={handleRefresh}
            isLoading={refreshing}
            disabled={!metrics || refreshing}
          >
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/leads')}>
            View Lead Pipeline
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {!metrics ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="spinner" style={{ width: '2rem', height: '2rem', margin: '0 auto 1rem', color: 'var(--primary)' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading dashboard metrics...</p>
        </div>
      ) : (
        <>
          <MetricCards metrics={metrics} />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '1.25rem',
            }}
          >
            <Card
              title="Pipeline Stage Breakdown"
              subtitle="Share of enquiries at each admission stage"
              actions={
                <Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>
                  View Table <ArrowUpRight size={14} />
                </Button>
              }
            >
              <StatusDistributionChart items={metrics.statusBreakdown} total={metrics.totalLeads} />
            </Card>

            <Card
              title="Lead Source Attribution"
              subtitle="Which channels enquiries come from"
            >
              <SourceDistributionChart items={metrics.sourceBreakdown} total={metrics.totalLeads} />
            </Card>

            <UrgentFollowUpsCard
              followUps={metrics.urgentFollowUps}
              totalOverdue={metrics.overdueCount}
              loadedAt={loadedAt}
            />
          </div>
        </>
      )}
    </div>
  );
}
