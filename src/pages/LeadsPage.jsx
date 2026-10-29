import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import LeadFilters from '../features/leads/LeadFilters';
import LeadTable from '../features/leads/LeadTable';
import CreateLeadModal from '../features/leads/CreateLeadModal';
import { fetchLeads } from '../services/leadService';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await fetchLeads({
        search: searchTerm,
        status: selectedStatus,
        course: selectedCourse,
        source: selectedSource,
      });

      if (error) {
        setErrorMsg(error);
      } else {
        setLeads(data || []);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error loading enquiries');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedStatus, selectedCourse, selectedSource]);

  useEffect(() => {
    // Debounce search/filter calls slightly
    const timer = setTimeout(() => {
      loadLeads();
    }, 200);

    return () => clearTimeout(timer);
  }, [loadLeads]);

  function handleResetFilters() {
    setSearchTerm('');
    setSelectedStatus('ALL');
    setSelectedCourse('ALL');
    setSelectedSource('ALL');
  }

  const isFiltered =
    searchTerm.trim() !== '' ||
    selectedStatus !== 'ALL' ||
    selectedCourse !== 'ALL' ||
    selectedSource !== 'ALL';

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Student Enquiry Pipeline</h2>
          <p className="page-description">
            Track prospective students, qualify leads, and manage admissions under active Row Level Security.
          </p>
        </div>
        <div className="page-actions">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw size={14} className={loading ? 'spinner' : ''} />}
            onClick={loadLeads}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Enquiry
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div
          role="alert"
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.8125rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <LeadFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
        selectedSource={selectedSource}
        onSourceChange={setSelectedSource}
        onResetFilters={handleResetFilters}
        totalResults={leads.length}
      />

      {/* Leads Table Component */}
      <LeadTable
        leads={leads}
        loading={loading}
        isFiltered={isFiltered}
        onResetFilters={handleResetFilters}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Create Lead Modal */}
      {isCreateModalOpen && (
        <CreateLeadModal
          onClose={() => setIsCreateModalOpen(false)}
          onLeadCreated={(newLead) => {
            // Prepend newly created lead or reload list
            setLeads((prev) => [newLead, ...prev]);
            loadLeads();
          }}
        />
      )}
    </div>
  );
}
