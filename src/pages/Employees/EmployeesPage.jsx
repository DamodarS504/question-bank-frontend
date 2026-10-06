import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import {
  useGetEmployeesQuery,
  useDeleteEmployeeMutation,
} from '../../features/employees/employeesApi';
import { getApiErrorMessage } from '../../features/auth/authApi';
import UploadEmployeeModal from './UploadEmployeeModal';
import CreateEmployeeModal from './CreateEmployeeModal';
import CustomSelect from '../../components/ui/CustomSelect';
import './Employees.css';

const COMPETENCY_OPTIONS = [
  { value: '', label: 'All Competencies' },
  { value: 'Python', label: 'Python' },
  { value: 'Java', label: 'Java' },
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'React', label: 'React' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'QA', label: 'QA' },
  { value: 'Data', label: 'Data' },
];

const LOCATION_OPTIONS = [
  { value: '', label: 'All Locations' },
  { value: 'Indore', label: 'Indore' },
  { value: 'Bangalore', label: 'Bangalore' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Remote', label: 'Remote' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

function UserXIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="17" y1="8" x2="22" y2="13" />
      <line x1="22" y1="8" x2="17" y2="13" />
    </svg>
  );
}

function highlightMatch(text, query) {
  if (text == null) return text;
  const str = String(text);
  if (!str) return text;
  if (typeof query !== 'string' || !query.trim()) return text;

  const terms = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (terms.length === 0) return text;

  const testRegex = new RegExp(`^(${terms.join('|')})$`, 'i');
  const splitRegex = new RegExp(`(${terms.join('|')})`, 'gi');
  const parts = str.split(splitRegex);

  if (parts.length <= 1) return text;

  return parts.map((part, index) =>
    testRegex.test(part) ? (
      <mark key={index} className="emp-search-highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function EmployeesPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  /* Query Parameters State */
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [competency, setCompetency] = useState('');
  const [baseLocation, setBaseLocation] = useState('');
  const [isActive, setIsActive] = useState('');

  /* Deactivate State */
  const [employeeToDeactivate, setEmployeeToDeactivate] = useState(null);
  const [deactivateError, setDeactivateError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();

  /* Debounce search input */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  /* Build query arguments for GET /api/v1/employees */
  const queryArgs = useMemo(() => {
    return {
      page,
      size,
      search: debouncedSearch || undefined,
      competency: competency || undefined,
      base_location: baseLocation || undefined,
      is_active: isActive !== '' ? isActive === 'true' : undefined,
    };
  }, [page, size, debouncedSearch, competency, baseLocation, isActive]);

  const { data, isLoading, isError, error, isFetching, refetch } = useGetEmployeesQuery(queryArgs);

  const employees = useMemo(() => data?.data ?? [], [data]);
  const totalRecords = data?.total_records ?? employees.length;
  const totalPages = data?.total_pages ?? Math.max(1, Math.ceil(totalRecords / size));

  const handleConfirmDeactivate = async () => {
    if (!employeeToDeactivate) return;
    setDeactivateError('');

    try {
      const idToDelete = employeeToDeactivate.id ?? employeeToDeactivate.employee_id;
      await deleteEmployee({
        userId: idToDelete,
      }).unwrap();

      const name = `${employeeToDeactivate.first_name} ${employeeToDeactivate.last_name || ''}`.trim();
      setSuccessBanner(`Employee "${name || employeeToDeactivate.employee_id}" was deactivated and marked as Inactive.`);
      setEmployeeToDeactivate(null);

      setTimeout(() => {
        setSuccessBanner('');
      }, 4000);
    } catch (err) {
      setDeactivateError(getApiErrorMessage(err));
    }
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setCompetency('');
    setBaseLocation('');
    setIsActive('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchInput || competency || baseLocation || isActive !== ''
  );

  return (
    <DashboardLayout title="Employees" eyebrow="Administration" allowedRoles={['ADMIN']}>
      <div className="emp-container">
        {/* Header Action Card */}
        <div className="emp-header-actions">
          <div className="emp-header-info">
            <h2>Employee Directory</h2>
            <p>Manage and onboard company employees across technical tracks</p>
          </div>
          <div className="emp-action-buttons">
            <button
              type="button"
              className="emp-btn-upload"
              onClick={() => setIsUploadOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload Employees
            </button>
            <button
              type="button"
              className="emp-btn-create"
              onClick={() => setIsCreateOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Employee
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successBanner && (
          <div className="emp-alert-banner emp-alert-banner--success" role="status">
            <span>✓ {successBanner}</span>
            <button
              type="button"
              onClick={() => setSuccessBanner('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
            >
              &times;
            </button>
          </div>
        )}

        {/* Toolbar & Filters */}
        <div className="emp-toolbar">
          <div className="emp-search-wrap">
            <span className="emp-search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="emp-search-input"
              placeholder="Search by name, ID, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="emp-filters-group">
            {/* Competency Filter */}
            <CustomSelect
              options={COMPETENCY_OPTIONS}
              value={competency}
              onChange={(val) => {
                setCompetency(val);
                setPage(1);
              }}
              placeholder="All Competencies"
              ariaLabel="Filter by competency"
            />

            {/* Base Location Filter */}
            <CustomSelect
              options={LOCATION_OPTIONS}
              value={baseLocation}
              onChange={(val) => {
                setBaseLocation(val);
                setPage(1);
              }}
              placeholder="All Locations"
              ariaLabel="Filter by location"
            />

            {/* Status Filter */}
            <CustomSelect
              options={STATUS_OPTIONS}
              value={isActive}
              onChange={(val) => {
                setIsActive(val);
                setPage(1);
              }}
              placeholder="All Statuses"
              ariaLabel="Filter by status"
            />

            {hasActiveFilters && (
              <button
                type="button"
                className="emp-btn-clear-filters"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Content State */}
        {isLoading ? (
          <div className="profile-state">Loading employees...</div>
        ) : isError ? (
          <div className="emp-card">
            <div className="emp-state-empty">
              <div className="emp-state-icon">⚠️</div>
              <h3>Unable to load employees</h3>
              <p>{getApiErrorMessage(error)}</p>
              <button
                type="button"
                className="emp-btn-create"
                onClick={() => {
                  if (page !== 1) setPage(1);
                  refetch();
                }}
                disabled={isFetching}
              >
                {isFetching ? 'Retrying...' : 'Try Again'}
              </button>
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div className="emp-card">
            <div className="emp-state-empty emp-state-empty--no-data">
              <h3>{hasActiveFilters ? 'No matching employees found' : 'No employees in directory yet'}</h3>
              <p>
                {hasActiveFilters
                  ? 'Try searching with different keywords or clearing your filters.'
                  : 'Employee records added to the directory will appear here.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="emp-card" style={{ opacity: isFetching ? 0.75 : 1, transition: 'opacity 0.2s' }}>
            <div className="emp-table-wrap">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Gender</th>
                    <th>Base Location</th>
                    <th>Competency</th>
                    <th>Status</th>
                    <th className="emp-actions-cell">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, idx) => {
                    const isInactive = emp.is_active === false;
                    return (
                      <tr
                        key={emp.id || emp.employee_id || idx}
                        className={isInactive ? 'emp-row--inactive' : ''}
                      >
                        <td>
                          <span className="emp-badge-id">
                            {highlightMatch(emp.employee_id || emp.id, debouncedSearch || searchInput)}
                          </span>
                        </td>
                        <td>
                          <strong>
                            {highlightMatch(`${emp.first_name} ${emp.last_name || ''}`.trim(), debouncedSearch || searchInput)}
                          </strong>
                        </td>
                        <td>{highlightMatch(emp.email, debouncedSearch || searchInput)}</td>
                        <td>
                          <span className="emp-badge-role">
                            {highlightMatch(emp.role || 'Employee', debouncedSearch || searchInput)}
                          </span>
                        </td>
                        <td>{emp.gender || '—'}</td>
                        <td>{highlightMatch(emp.base_location || '—', debouncedSearch || searchInput)}</td>
                        <td>{highlightMatch(emp.competency || '—', debouncedSearch || searchInput)}</td>
                        <td>
                          <span
                            className={`emp-badge-status ${!isInactive
                                ? 'emp-badge-status--active'
                                : 'emp-badge-status--inactive'
                              }`}
                          >
                            {!isInactive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="emp-actions-cell">
                          {isInactive ? (
                            <button
                              type="button"
                              className="emp-btn-action-deactivate emp-btn-action-deactivate--disabled"
                              disabled
                              title="Employee is already inactive"
                              aria-label={`${emp.first_name} ${emp.last_name || ''} is already inactive`}
                            >
                              <UserXIcon />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="emp-btn-action-deactivate"
                              onClick={() => {
                                setDeactivateError('');
                                setEmployeeToDeactivate(emp);
                              }}
                              title={`Deactivate ${emp.first_name} ${emp.last_name || ''}`}
                              aria-label={`Deactivate ${emp.first_name} ${emp.last_name || ''}`}
                            >
                              <UserXIcon />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="emp-pagination">
              <span className="emp-pagination-info">
                Showing{' '}
                <strong>{totalRecords === 0 ? 0 : (page - 1) * size + 1}</strong>
                {' '}to{' '}
                <strong>{Math.min(page * size, totalRecords)}</strong>
                {' '}of{' '}
                <strong>{totalRecords}</strong> employees
              </span>

              <div className="emp-pagination-controls">
                <button
                  type="button"
                  className="emp-pagination-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                >
                  &larr; Previous
                </button>
                <span className="emp-page-indicator">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="emp-pagination-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isFetching}
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deactivate Confirmation Modal */}
      {employeeToDeactivate && (
        <div
          className="emp-modal-overlay"
          onClick={() => !isDeleting && setEmployeeToDeactivate(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="deactivate-employee-modal-title"
        >
          <div className="emp-modal emp-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="emp-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="emp-delete-modal-icon">
                  <UserXIcon />
                </div>
                <h3 id="deactivate-employee-modal-title" style={{ margin: 0 }}>Deactivate Employee</h3>
              </div>
              <button
                type="button"
                className="emp-modal-close"
                onClick={() => setEmployeeToDeactivate(null)}
                disabled={isDeleting}
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            <div className="emp-modal-body">
              {deactivateError && (
                <div className="profile-alert-error" role="alert" style={{ marginBottom: '16px' }}>
                  {deactivateError}
                </div>
              )}
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Are you sure you want to deactivate{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {employeeToDeactivate.first_name} {employeeToDeactivate.last_name || ''}
                </strong>
                {' '}
                (ID: <code>{employeeToDeactivate.employee_id || employeeToDeactivate.id}</code>)?
              </p>
              <div className="emp-deactivate-notice">
                <div className="emp-deactivate-notice-header">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>Please Note</span>
                </div>
                <p>
                  This action will mark the employee as <strong>Inactive</strong> in the directory. They will no longer be able to log in or receive new assessment assignments.
                </p>
              </div>
            </div>

            <div className="emp-modal-footer">
              <button
                type="button"
                className="profile-btn-cancel"
                onClick={() => setEmployeeToDeactivate(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="emp-btn-danger emp-btn-deactivate"
                onClick={handleConfirmDeactivate}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deactivating...' : 'Deactivate Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Employee Modal */}
      <UploadEmployeeModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      {/* Create Employee Modal */}
      <CreateEmployeeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

    </DashboardLayout>
  );
}
