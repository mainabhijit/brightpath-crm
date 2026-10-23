import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Phone,
  Mail,
  GraduationCap,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function LeadsPage() {
  const navigate = useNavigate();
  const { openCreateLeadModal } = useOutletContext() || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Representative sample leads for Phase 1 verification
  const sampleLeads = [
    {
      id: 'lead-1',
      full_name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '+91 98765 43210',
      course_interest: 'IIT-JEE Target 2027',
      source: 'Website Enquiry',
      status: 'New',
      next_followup: 'Oct 24, 10:30 AM',
    },
    {
      id: 'lead-2',
      full_name: 'Priya Patel',
      email: 'priya.patel@example.com',
      phone: '+91 98231 12345',
      course_interest: 'NEET Droppers Batch',
      source: 'Walk-in Counselling',
      status: 'Contacted',
      next_followup: 'Oct 23, 02:00 PM',
    },
    {
      id: 'lead-3',
      full_name: 'Rohan Deshmukh',
      email: 'rohan.d@example.com',
      phone: '+91 91234 56789',
      course_interest: 'Foundation Class 10',
      source: 'Parent Referral',
      status: 'Qualified',
      next_followup: 'Oct 25, 11:00 AM',
    },
    {
      id: 'lead-4',
      full_name: 'Ananya Gupta',
      email: 'ananya.g@example.com',
      phone: '+91 99887 76655',
      course_interest: 'IIT-JEE Advanced Intensive',
      source: 'Social Media Ad',
      status: 'Converted',
      next_followup: 'Completed',
    },
  ];

  const filteredLeads = sampleLeads.filter((lead) => {
    const matchesSearch =
      lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.course_interest.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === 'ALL' || lead.status.toUpperCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Student Enquiry Pipeline</h2>
          <p className="page-description">
            Track student leads from initial enquiry to confirmed admission.
          </p>
        </div>
        <div className="page-actions">
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => openCreateLeadModal && openCreateLeadModal()}
          >
            Create Enquiry
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 280px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search by student name, phone, course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-page)',
              }}
            />
          </div>

          {/* Status Filter Chips */}
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Filter size={14} /> Filter:
            </span>
            {['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.625rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: selectedStatus === st ? 'var(--primary)' : 'var(--border-color)',
                  backgroundColor: selectedStatus === st ? 'var(--primary)' : '#ffffff',
                  color: selectedStatus === st ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Leads Table Card */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Student Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Contact Info</th>
                <th style={{ padding: '0.75rem 1rem' }}>Course Interest</th>
                <th style={{ padding: '0.75rem 1rem' }}>Source</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Next Follow-up</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 150ms' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: '#e0e7ff',
                            color: '#3730a3',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {lead.full_name[0]}
                        </div>
                        <span>{lead.full_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
                        <Phone size={12} /> {lead.phone}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <Mail size={12} /> {lead.email}
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                        <GraduationCap size={14} color="var(--primary)" /> {lead.course_interest}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {lead.source}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Badge variant={lead.status}>{lead.status}</Badge>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem' }}>
                      {lead.next_followup}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye size={14} />}
                        onClick={() => navigate(`/leads/${lead.id}`)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No leads found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
