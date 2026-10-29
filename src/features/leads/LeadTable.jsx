import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Phone,
  Mail,
  GraduationCap,
  Eye,
  Calendar,
  User,
  Plus,
  SearchX,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function LeadTable({
  leads = [],
  loading = false,
  isFiltered = false,
  onResetFilters,
  onOpenCreateModal,
}) {
  const navigate = useNavigate();

  // Loading skeleton placeholder rows
  if (loading) {
    return (
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              style={{
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f1f5f9',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      </Card>
    );
  }

  // Empty states
  if (leads.length === 0) {
    return (
      <Card style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#f1f5f9',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}
        >
          {isFiltered ? <SearchX size={28} /> : <GraduationCap size={28} />}
        </div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
          {isFiltered ? 'No enquiries match your search' : 'No student enquiries yet'}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
          {isFiltered
            ? 'Try adjusting your search keywords, status filter, or course selection.'
            : 'Capture walk-in visitors, website enquiries, and phone inquiries to start tracking conversions.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          {isFiltered ? (
            <Button variant="outline" onClick={onResetFilters}>
              Reset Filters
            </Button>
          ) : (
            <Button variant="primary" icon={<Plus size={16} />} onClick={onOpenCreateModal}>
              Create First Student Enquiry
            </Button>
          )}
        </div>
      </Card>
    );
  }

  function formatDate(isoString) {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      {/* Desktop Table View */}
      <div className="lead-table-desktop" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr
              style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <th scope="col" style={{ padding: '0.75rem 1rem' }}>Student Name</th>
              <th scope="col" style={{ padding: '0.75rem 1rem' }}>Contact Details</th>
              <th scope="col" style={{ padding: '0.75rem 1rem' }}>Target Course</th>
              <th scope="col" style={{ padding: '0.75rem 1rem' }}>Source</th>
              <th scope="col" style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th scope="col" style={{ padding: '0.75rem 1rem' }}>Assigned To</th>
              <th scope="col" style={{ padding: '0.75rem 1rem' }}>Created</th>
              <th scope="col" style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const counsellorName = lead.assigned_to_profile?.full_name || 'Unassigned';
              const initial = lead.full_name ? lead.full_name[0].toUpperCase() : 'S';

              return (
                <tr
                  key={lead.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color 150ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Name with initial avatar */}
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {initial}
                      </div>
                      <Link
                        to={`/leads/${lead.id}`}
                        style={{ color: 'var(--text-main)' }}
                        title="View enquiry details"
                      >
                        {lead.full_name}
                      </Link>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <a
                        href={`tel:${lead.phone}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.8125rem',
                          color: 'var(--primary)',
                          fontWeight: 500,
                        }}
                      >
                        <Phone size={12} /> {lead.phone}
                      </a>
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          <Mail size={12} /> {lead.email}
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Course */}
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                      <GraduationCap size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
                      <span>{lead.course_interest}</span>
                    </span>
                  </td>

                  {/* Source */}
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {lead.source}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <Badge variant={lead.status}>{lead.status}</Badge>
                  </td>

                  {/* Assignee */}
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <User size={13} /> {counsellorName}
                    </span>
                  </td>

                  {/* Created At */}
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} /> {formatDate(lead.created_at)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Eye size={13} />}
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (shown ≤ 768px via CSS) */}
      <ul className="lead-cards-mobile" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {leads.map((lead) => (
          <li key={lead.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <Link
              to={`/leads/${lead.id}`}
              style={{ display: 'block', padding: '0.875rem 1rem', color: 'inherit' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)', minWidth: 0, overflowWrap: 'anywhere' }}>
                  {lead.full_name}
                </span>
                <Badge variant={lead.status} style={{ flexShrink: 0 }}>{lead.status}</Badge>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <GraduationCap size={13} color="var(--primary)" aria-hidden="true" /> {lead.course_interest}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Phone size={13} aria-hidden="true" /> {lead.phone}
                </span>
                <span style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <User size={12} aria-hidden="true" /> {lead.assigned_to_profile?.full_name || 'Unassigned'}
                  </span>
                  <span>{formatDate(lead.created_at)}</span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
