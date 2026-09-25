import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import {
  useGetEmployeesQuery,
  useDeleteEmployeeMutation,
} from '../../features/employees/employeesApi';
import { useGetProfileQuery, getApiErrorMessage } from '../../features/auth/authApi';
import UploadEmployeeModal from './UploadEmployeeModal';
import CreateEmployeeModal from './CreateEmployeeModal';
import './Employees.css';

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function normalizeEmployees(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.employees)) return data.employees;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  return [];
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

  /* Delete State */
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();

  const { data: profile } = useGetProfileQuery();
  const employeeId = profile?.employee_id;

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
    if (!employeeId) return undefined;
    return {
      employee_id: employeeId,
      page,
      size,
      search: debouncedSearch || undefined,
      competency: competency || undefined,
      base_location: baseLocation || undefined,
      is_active: isActive !== '' ? isActive === 'true' : undefined,
    };
  }, [employeeId, page, size, debouncedSearch, competency, baseLocation, isActive]);

  const { data, isLoading, isError, error, isFetching } = useGetEmployeesQuery(queryArgs, {
    skip: !employeeId,
  });

  const employees = useMemo(() => normalizeEmployees(data), [data]);
  const totalRecords = data?.total_records ?? employees.length;
  const totalPages = data?.total_pages ?? Math.max(1, Math.ceil(totalRecords / size));

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    setDeleteError('');

    try {
      const idToDelete = employeeToDelete.id ?? employeeToDelete.employee_id;
      await deleteEmployee({
        userId: idToDelete,
        employee_id: employeeId,
      }).unwrap();

      const name = `${employeeToDelete.first_name} ${employeeToDelete.last_name || ''}`.trim();
      setSuccessBanner(`Employee "${name || employeeToDelete.employee_id}" deleted successfully.`);
      setEmployeeToDelete(null);

      setTimeout(() => {
        setSuccessBanner('');
      }, 4000);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
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
    <DashboardLayout title="Employees" eyebrow="Administration">
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
            <select
              className="emp-select"
              value={competency}
              onChange={(e) => {
                setCompetency(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by competency"
            >
              <option value="">All Competencies</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="JavaScript">JavaScript</option>
              <option value="React">React</option>
              <option value="DevOps">DevOps</option>
              <option value="QA">QA</option>
              <option value="Data">Data</option>
            </select>

            {/* Base Location Filter */}
            <select
              className="emp-select"
              value={baseLocation}
              onChange={(e) => {
                setBaseLocation(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by location"
            >
              <option value="">All Locations</option>
              <option value="Indore">Indore</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Pune">Pune</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Remote">Remote</option>
            </select>

            {/* Status Filter */}
            <select
              className="emp-select"
              value={isActive}
              onChange={(e) => {
                setIsActive(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

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
                onClick={() => setPage(1)}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div className="emp-card">
            <div className="emp-state-empty">
              <div className="emp-state-icon">👥</div>
              <h3>{hasActiveFilters ? 'No matching employees found' : 'No employees in directory yet'}</h3>
              <p>
                {hasActiveFilters
                  ? 'Try searching with different keywords or clearing your filters.'
                  : 'Get started by creating an individual employee record or uploading a batch CSV/Excel file.'}
              </p>
              <div className="emp-action-buttons">
                {hasActiveFilters ? (
                  <button
                    type="button"
                    className="emp-btn-upload"
                    onClick={handleClearFilters}
                  >
                    Reset Filters
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="emp-btn-upload"
                      onClick={() => setIsUploadOpen(true)}
                    >
                      Upload Batch
                    </button>
                    <button
                      type="button"
                      className="emp-btn-create"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      Create First Employee
                    </button>
                  </>
                )}
              </div>
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
                  {employees.map((emp, idx) => (
                    <tr key={emp.id || emp.employee_id || idx}>
                      <td>
                        <span className="emp-badge-id">{emp.employee_id || emp.id}</span>
                      </td>
                      <td>
                        <strong>{emp.first_name} {emp.last_name || ''}</strong>
                      </td>
                      <td>{emp.email}</td>
                      <td>
                        <span className="emp-badge-role">{emp.role || 'Employee'}</span>
                      </td>
                      <td>{emp.gender || '—'}</td>
                      <td>
                        <span className="emp-badge-location">{emp.base_location || '—'}</span>
                      </td>
                      <td>
                        <span className="emp-badge-competency">{emp.competency || '—'}</span>
                      </td>
                      <td>
                        <span
                          className={`emp-badge-status ${
                            emp.is_active !== false
                              ? 'emp-badge-status--active'
                              : 'emp-badge-status--inactive'
                          }`}
                        >
                          {emp.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="emp-actions-cell">
                        <button
                          type="button"
                          className="emp-btn-delete"
                          onClick={() => {
                            setDeleteError('');
                            setEmployeeToDelete(emp);
                          }}
                          title={`Delete ${emp.first_name} ${emp.last_name || ''}`}
                          aria-label={`Delete ${emp.first_name} ${emp.last_name || ''}`}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
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

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div
          className="emp-modal-overlay"
          onClick={() => !isDeleting && setEmployeeToDelete(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-employee-modal-title"
        >
          <div className="emp-modal emp-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="emp-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="emp-delete-modal-icon">
                  <TrashIcon />
                </div>
                <h3 id="delete-employee-modal-title" style={{ margin: 0 }}>Delete Employee</h3>
              </div>
              <button
                type="button"
                className="emp-modal-close"
                onClick={() => setEmployeeToDelete(null)}
                disabled={isDeleting}
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            <div className="emp-modal-body">
              {deleteError && (
                <div className="profile-alert-error" role="alert" style={{ marginBottom: '16px' }}>
                  {deleteError}
                </div>
              )}
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Are you sure you want to delete{' '}
                <strong>
                  {employeeToDelete.first_name} {employeeToDelete.last_name || ''}
                </strong>
                {' '}
                (ID: <code>{employeeToDelete.employee_id || employeeToDelete.id}</code>)?
              </p>
              <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: '#e11d48', fontWeight: 600 }}>
                This will permanently delete this employee record from the system.
              </p>
            </div>

            <div className="emp-modal-footer">
              <button
                type="button"
                className="profile-btn-cancel"
                onClick={() => setEmployeeToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="emp-btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Employee'}
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
