import { useState, useMemo } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { useGetEmployeesQuery } from '../../features/employees/employeesApi';
import { useGetProfileQuery, getApiErrorMessage } from '../../features/auth/authApi';
import UploadEmployeeModal from './UploadEmployeeModal';
import CreateEmployeeModal from './CreateEmployeeModal';
import './Employees.css';

function normalizeEmployees(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.employees)) return data.employees;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

export default function EmployeesPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: profile } = useGetProfileQuery();
  const employeeId = profile?.employee_id;

  const { data, isLoading, isError, error, refetch } = useGetEmployeesQuery(
    employeeId ? { employee_id: employeeId } : undefined,
    { skip: !employeeId }
  );

  const employees = useMemo(() => normalizeEmployees(data), [data]);

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employees;
    const term = search.toLowerCase();
    return employees.filter((emp) => {
      const id = String(emp.employee_id || emp.id || '').toLowerCase();
      const name = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
      const email = String(emp.email || '').toLowerCase();
      const location = String(emp.base_location || '').toLowerCase();
      const competency = String(emp.competency || '').toLowerCase();
      return (
        id.includes(term) ||
        name.includes(term) ||
        email.includes(term) ||
        location.includes(term) ||
        competency.includes(term)
      );
    });
  }, [employees, search]);

  return (
    <DashboardLayout title="Employees" eyebrow="Administration">
      <div className="emp-container">
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
              placeholder="Search by name, ID, email, competency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="profile-state">Loading employees...</div>
        ) : isError ? (
          <div className="emp-card">
            <div className="emp-state-empty">
              <div className="emp-state-icon">👥</div>
              <h3>Employee Management</h3>
              <p>
                Directory listing endpoint is not available yet. You can still use the options above to upload bulk files or create individual employee records.
              </p>
              <div className="emp-action-buttons">
                <button
                  type="button"
                  className="emp-btn-upload"
                  onClick={() => setIsUploadOpen(true)}
                >
                  Upload Employees
                </button>
                <button
                  type="button"
                  className="emp-btn-create"
                  onClick={() => setIsCreateOpen(true)}
                >
                  Create Employee
                </button>
              </div>
            </div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="emp-card">
            <div className="emp-state-empty">
              <div className="emp-state-icon">👥</div>
              <h3>{search ? 'No matching employees found' : 'No employees in directory yet'}</h3>
              <p>
                {search
                  ? 'Try searching with different keywords or clear the filter.'
                  : 'Get started by creating an individual employee record or uploading a batch CSV/Excel file.'}
              </p>
              <div className="emp-action-buttons">
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
              </div>
            </div>
          </div>
        ) : (
          <div className="emp-card">
            <div className="emp-table-wrap">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Base Location</th>
                    <th>Competency</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp, idx) => (
                    <tr key={emp.employee_id || emp.id || idx}>
                      <td>
                        <span className="emp-badge-id">{emp.employee_id || emp.id}</span>
                      </td>
                      <td>
                        <strong>{emp.first_name} {emp.last_name || ''}</strong>
                      </td>
                      <td>{emp.email}</td>
                      <td>{emp.gender || '—'}</td>
                      <td>
                        <span className="emp-badge-location">{emp.base_location || '—'}</span>
                      </td>
                      <td>
                        <span className="emp-badge-competency">{emp.competency || '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <UploadEmployeeModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      <CreateEmployeeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </DashboardLayout>
  );
}
