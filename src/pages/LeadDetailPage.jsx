import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  User,
  GraduationCap,
  Clock,
  Edit3,
  Trash2,
  AlertCircle,
  Tag,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import EditLeadModal from '../features/leads/EditLeadModal';
import StatusChangeModal from '../features/leads/StatusChangeModal';
import {
  fetchLeadById,
  updateLeadStatus,
  deleteLead,
  STATUS_OPTIONS,
} from '../services/leadService';
import useAuth from '../context/useAuth';

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusLostModalOpen, setIsStatusLostModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadLead = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await fetchLeadById(id);
      if (error) {
        setErrorMsg(error);
      } else {
        setLead(data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error loading lead details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  // Handle status selection from dropdown
  async function handleStatusSelect(newStatus) {
    if (!lead || newStatus === lead.status) return;

    if (newStatus === 'Lost') {
      setIsStatusLostModalOpen(true);
      return;
    }

    setStatusUpdating(true);
    try {
      const { data, error } = await updateLeadStatus(lead.id, newStatus, null, user?.id);
      if (error) {
        alert('Failed to update status: ' + error);
      } else {
        setLead((prev) => ({ ...prev, status: data.status, lost_reason: null }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setStatusUpdating(false);
    }
  }

  // Confirm Lost status with reason
  async function handleConfirmLost(reason) {
    const { data, error } = await updateLeadStatus(lead.id, 'Lost', reason, user?.id);
    if (error) {
      throw new Error(error);
    }
    setLead((prev) => ({ ...prev, status: 'Lost', lost_reason: reason }));
  }

  // Handle Delete Lead
  async function handleDeleteConfirm() {
    setDeleting(true);
    try {
      const { error } = await deleteLead(lead.id);
      if (error) {
        alert('Failed to delete lead: ' + error);
      } else {
        navigate('/leads', { replace: true });
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner" style={{ width: '2rem', height: '2rem', margin: '0 auto 1rem', color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading enquiry profile...</p>
      </div>
    );
  }

  if (errorMsg || !lead) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertCircle size={36} color="#dc2626" style={{ margin: '0 auto 0.75rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Unable to load enquiry</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{errorMsg || 'Lead record not found.'}</p>
        <Button variant="primary" onClick={() => navigate('/leads')}>
          Return to Leads Pipeline
        </Button>
      </div>
    );
  }

  const counsellorName = lead.assigned_to_profile?.full_name || 'Unassigned';
  const createdDate = new Date(lead.created_at).toLocaleDateString('en-IN', {
    dateStyle: 'medium',
  });

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link
          to="/leads"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Back to Enquiry Pipeline
        </Link>

        {/* Delete option for admin / manager */}
        {(isAdmin || isManager) && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={14} />}
            style={{ color: '#b91c1c' }}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Lead
          </Button>
        )}
      </div>

      {/* Main Header Card */}
      <Card style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {lead.full_name}
              </h2>
              <Badge variant={lead.status}>{lead.status}</Badge>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Enquiry ID: <code style={{ backgroundColor: '#f1f5f9', padding: '0.125rem 0.375rem', borderRadius: 'var(--radius-xs)' }}>{lead.id}</code> • Registered {createdDate}
            </p>
          </div>

          {/* Status Changer Dropdown & Edit Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Stage:
              </label>
              <select
                value={lead.status}
                disabled={statusUpdating}
                onChange={(e) => handleStatusSelect(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<Edit3 size={14} />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Details
            </Button>
          </div>
        </div>

        {/* Lost Reason banner if status is Lost */}
        {lead.status === 'Lost' && lead.lost_reason && (
          <div
            style={{
              marginTop: '1rem',
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
            <AlertTriangle size={16} />
            <span><strong>Reason for Lost Lead:</strong> {lead.lost_reason}</span>
          </div>
        )}
      </Card>

      {/* Grid: Profile Details & Activity Log */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Left Column: Student Details & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Contact Details Card */}
          <Card title="Student & Contact Information">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Phone size={16} color="var(--primary)" />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Primary Phone</span>
                  <a href={`tel:${lead.phone}`} style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    {lead.phone}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={16} color="var(--primary)" />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
                  {lead.email ? (
                    <a href={`mailto:${lead.email}`} style={{ color: 'var(--text-main)' }}>
                      {lead.email}
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Not provided</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <GraduationCap size={16} color="var(--primary)" />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Course Interest</span>
                  <strong style={{ color: 'var(--text-main)' }}>{lead.course_interest}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Tag size={16} color="var(--primary)" />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Enquiry Channel</span>
                  <span>{lead.source}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <User size={16} color="var(--primary)" />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Assigned Counsellor</span>
                  <strong>{counsellorName}</strong>
                </div>
              </div>
            </div>
          </Card>

          {/* Counselling Notes Card */}
          <Card title="Counselling & Academic Notes">
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <FileText size={16} color="var(--text-muted)" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
              <p style={{ fontSize: '0.875rem', color: lead.notes ? 'var(--text-main)' : 'var(--text-muted)', fontStyle: lead.notes ? 'normal' : 'italic', lineHeight: 1.6 }}>
                {lead.notes || 'No counselling notes recorded for this enquiry yet.'}
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Follow-up & Audit Trail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Scheduled Follow-up Card */}
          <Card
            title="Scheduled Follow-up Action"
            subtitle="Next contact milestone for this enquiry"
          >
            {lead.follow_ups && lead.follow_ups.length > 0 ? (
              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                  <Clock size={14} /> Scheduled Follow-up
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  {lead.follow_ups[0].note}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Due: {new Date(lead.follow_ups[0].due_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                No follow-up calls scheduled yet. Scheduling tasks will be activated in Phase 6.
              </p>
            )}
          </Card>

          {/* Activity Log Card */}
          <Card
            title="Audit & Activity Trail"
            subtitle="Chronological log of counsellor actions and state transitions"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary)', marginTop: '0.375rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Enquiry registered in CRM</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Calendar size={11} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    {createdDate}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Details Modal */}
      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        lead={lead}
        onLeadUpdated={(updated) => {
          setLead(updated);
        }}
      />

      {/* Mandatory Lost Reason Modal */}
      <StatusChangeModal
        isOpen={isStatusLostModalOpen}
        onClose={() => setIsStatusLostModalOpen(false)}
        leadName={lead.full_name}
        onConfirmLost={handleConfirmLost}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Lead Deletion"
        maxWidth="440px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} isLoading={deleting} disabled={deleting}>
              Permanently Delete
            </Button>
          </>
        }
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Are you sure you want to delete <strong>{lead.full_name}</strong>? This will remove all associated follow-up tasks and activity records. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
