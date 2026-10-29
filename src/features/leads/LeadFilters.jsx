import React from 'react';
import { Search, Filter, RotateCcw, X } from 'lucide-react';
import Card from '../../components/common/Card';
import { COURSE_OPTIONS, SOURCE_OPTIONS } from '../../services/leadService';

export default function LeadFilters({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedCourse,
  onCourseChange,
  selectedSource,
  onSourceChange,
  onResetFilters,
  totalResults = 0,
}) {
  const isFiltered =
    searchTerm.trim() !== '' ||
    selectedStatus !== 'ALL' ||
    selectedCourse !== 'ALL' ||
    selectedSource !== 'ALL';

  const statusList = [
    { key: 'ALL', label: 'All Statuses' },
    { key: 'New', label: 'New' },
    { key: 'Contacted', label: 'Contacted' },
    { key: 'Qualified', label: 'Qualified' },
    { key: 'Converted', label: 'Converted' },
    { key: 'Lost', label: 'Lost' },
  ];

  return (
    <Card style={{ marginBottom: '1.25rem', padding: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {/* Top Row: Search input + dropdowns */}
        <div className="lead-filters-row" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '240px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="search"
              aria-label="Search enquiries by name, phone, email, or course"
              placeholder="Search by student name, phone, course..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 2rem 0.5rem 2.25rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-page)',
                fontSize: '0.875rem',
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '0.625rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Course Dropdown */}
          <div style={{ flex: '0 1 200px' }}>
            <select
              aria-label="Filter by course"
              value={selectedCourse}
              onChange={(e) => onCourseChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
              }}
            >
              <option value="ALL">All Courses</option>
              {COURSE_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Source Dropdown */}
          <div style={{ flex: '0 1 180px' }}>
            <select
              aria-label="Filter by source"
              value={selectedSource}
              onChange={(e) => onSourceChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
              }}
            >
              <option value="ALL">All Sources</option>
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="btn btn-outline btn-sm"
              style={{ color: '#b91c1c', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Bottom Row: Status Filter Chips + Results count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div role="group" aria-label="Filter by status" style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span aria-hidden="true" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.25rem' }}>
              <Filter size={13} /> Status:
            </span>
            {statusList.map((st) => {
              const active = selectedStatus === st.key;
              return (
                <button
                  key={st.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onStatusChange(st.key)}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.625rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid',
                    borderColor: active ? 'var(--primary)' : 'var(--border-color)',
                    backgroundColor: active ? 'var(--primary)' : '#ffffff',
                    color: active ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {st.label}
                </button>
              );
            })}
          </div>

          <span aria-live="polite" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'enquiry' : 'enquiries'}
          </span>
        </div>
      </div>
    </Card>
  );
}
