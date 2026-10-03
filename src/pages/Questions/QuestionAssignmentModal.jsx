import { useState, useMemo, useEffect } from 'react';
import { getApiErrorMessage } from '../../features/auth/authApi';
import { useGetEmployeesQuery } from '../../features/employees/employeesApi';
import { useAssignQuestionsMutation } from '../../features/questions/questionBankApi';

function getTodayDate() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function getEmployeeUserId(employee) {
  const rawId = employee.user_id ?? employee.id;
  if (rawId == null || rawId === '') return null;
  const userId = Number(rawId);
  return Number.isInteger(userId) ? userId : null;
}

function isAssignableEmployee(employee) {
  return employee.is_active !== false
    && String(employee.role || 'Employee').trim().toUpperCase() === 'EMPLOYEE'
    && getEmployeeUserId(employee) !== null;
}

export default function QuestionAssignmentModal({ questions, onClose, onAssigned }) {
  const [employeePage, setEmployeePage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setEmployeePage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isFetching, isError, error, refetch } = useGetEmployeesQuery({
    page: employeePage,
    size: 50,
    search: debouncedSearch || undefined,
    is_active: true,
  });
  const [assignQuestions, { isLoading: isAssigning }] = useAssignQuestionsMutation();
  const [selectedEmployees, setSelectedEmployees] = useState({});
  const [formError, setFormError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const rawEmployees = useMemo(() => {
    return (data?.data ?? []).filter(isAssignableEmployee);
  }, [data]);

  const employees = useMemo(() => {
    if (!debouncedSearch) return rawEmployees;
    const lower = debouncedSearch.toLowerCase();
    return rawEmployees.filter((emp) => {
      const name = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
      const email = String(emp.email || '').toLowerCase();
      const empId = String(emp.employee_id || '').toLowerCase();
      return name.includes(lower) || email.includes(lower) || empId.includes(lower);
    });
  }, [rawEmployees, debouncedSearch]);

  const totalPages = data?.total_pages ?? 1;
  const selectedEmployeeList = Object.values(selectedEmployees);

  const allVisibleSelected = employees.length > 0 && employees.every((emp) => {
    const id = getEmployeeUserId(emp);
    return id !== null && Boolean(selectedEmployees[String(id)]);
  });

  const toggleSelectAll = () => {
    if (employees.length === 0) return;
    setSelectedEmployees((current) => {
      const next = { ...current };
      if (allVisibleSelected) {
        employees.forEach((emp) => {
          const id = getEmployeeUserId(emp);
          if (id !== null) delete next[String(id)];
        });
      } else {
        employees.forEach((emp) => {
          const id = getEmployeeUserId(emp);
          if (id !== null) {
            const name = `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
            next[String(id)] = { id, name: name || emp.employee_id || `Employee ${id}` };
          }
        });
      }
      return next;
    });
    setFormError('');
  };

  const toggleEmployee = (employee) => {
    const id = getEmployeeUserId(employee);
    if (id === null) return;

    const key = String(id);
    const name = `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
    setSelectedEmployees((current) => {
      const next = { ...current };
      if (next[key]) delete next[key];
      else next[key] = { id, name: name || employee.employee_id || `Employee ${id}` };
      return next;
    });
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (selectedEmployeeList.length === 0) {
      setFormError('Select at least one employee.');
      return;
    }
    if (questions.length === 0) {
      setFormError('Select at least one question.');
      return;
    }

    try {
      await assignQuestions({
        userIds: selectedEmployeeList.map((employee) => employee.id),
        questionIds: questions.map((question) => question.id),
        assignedDate: getTodayDate(),
      }).unwrap();
      setIsSuccess(true);
    } catch (assignmentError) {
      setFormError(getApiErrorMessage(assignmentError));
    }
  };

  return (
    <div
      className="qba-overlay"
      onClick={() => !isAssigning && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qba-title"
    >
      <div className="qba-modal" onClick={(event) => event.stopPropagation()}>
        <div className="qba-header">
          <div>
            <h2 id="qba-title">Assign Questions</h2>
            <p>{questions.length} {questions.length === 1 ? 'question' : 'questions'} selected</p>
          </div>
          <button type="button" className="qba-close" onClick={onClose} disabled={isAssigning} aria-label="Close dialog">
            &times;
          </button>
        </div>

        {isSuccess ? (
          <div className="qba-success-wrap">
            <div className="qba-body">
              <div className="qba-success" role="status">
                {questions.length} {questions.length === 1 ? 'question was' : 'questions were'} assigned to {selectedEmployeeList.length} {selectedEmployeeList.length === 1 ? 'employee' : 'employees'}.
              </div>
            </div>
            <div className="qba-footer">
              <button type="button" className="qba-submit" onClick={() => { onAssigned(); onClose(); }}>Done</button>
            </div>
          </div>
        ) : (
          <form className="qba-form" onSubmit={handleSubmit}>
            <div className="qba-body">
              {formError && <div className="qba-error" role="alert">{formError}</div>}

              <div className="qba-selected-questions">
                <strong>Questions to assign</strong>
                {questions.slice(0, 3).map((question) => (
                  <span key={question.id}>{question.title}</span>
                ))}
                {questions.length > 3 && <span>and {questions.length - 3} more</span>}
              </div>

              {/* Search employees input */}
              <div className="qba-search-wrap">
                <span className="qba-search-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="qba-search-input"
                  placeholder="Search employees by name, ID or email..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="qba-search-clear"
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                  >
                    &times;
                  </button>
                )}
              </div>

              <div className="qba-list-heading">
                <div className="qba-list-heading-left">
                  <h3>Active employees</h3>
                  <span className="qba-count-pill">{selectedEmployeeList.length} selected</span>
                </div>
                {employees.length > 0 && (
                  <label className="qba-select-all-btn">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all employees"
                    />
                    <span>Select all ({employees.length})</span>
                  </label>
                )}
              </div>

              {isLoading ? (
                <p className="qba-state">Loading employees...</p>
              ) : isError ? (
                <div className="qba-state" role="alert">
                  <p>{getApiErrorMessage(error)}</p>
                  <button type="button" className="qba-secondary" onClick={refetch} disabled={isFetching}>
                    {isFetching ? 'Retrying...' : 'Retry'}
                  </button>
                </div>
              ) : employees.length === 0 ? (
                <p className="qba-state">
                  {searchTerm
                    ? `No active employees found matching "${searchTerm}".`
                    : 'No active employees available to assign.'}
                </p>
              ) : (
                <div className="qba-employee-list" aria-busy={isFetching}>
                  {employees.map((employee) => {
                    const id = getEmployeeUserId(employee);
                    const key = String(id);
                    const name = `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
                    const isSelected = Boolean(selectedEmployees[key]);
                    return (
                      <label className={`qba-employee-option ${isSelected ? 'qba-employee-option--selected' : ''}`} key={key}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleEmployee(employee)}
                        />
                        <span>
                          <strong>{name || 'Unnamed employee'}</strong>
                          <small>{employee.employee_id} · {employee.email}</small>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && !isError && (
                <div className="qba-pagination">
                  <button type="button" className="qba-secondary" onClick={() => setEmployeePage((page) => Math.max(1, page - 1))} disabled={employeePage <= 1 || isFetching}>
                    Previous
                  </button>
                  <span className="qba-page-indicator">Page {employeePage} of {totalPages}</span>
                  <button type="button" className="qba-secondary" onClick={() => setEmployeePage((page) => Math.min(totalPages, page + 1))} disabled={employeePage >= totalPages || isFetching}>
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="qba-footer">
              <button
                type="button"
                className="qba-secondary"
                onClick={onClose}
                disabled={isAssigning}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="qba-submit"
                disabled={isAssigning || isLoading || isFetching || isError || selectedEmployeeList.length === 0}
              >
                {isAssigning ? (
                  <>
                    <svg className="qba-btn-spinner" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                    </svg>
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                    <span>
                      Assign to employees{selectedEmployeeList.length > 0 ? ` (${selectedEmployeeList.length})` : ''}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
