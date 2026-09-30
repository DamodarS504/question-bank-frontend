import { useState } from 'react';
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
  const { data, isLoading, isFetching, isError, error, refetch } = useGetEmployeesQuery({
    page: employeePage,
    size: 10,
    is_active: true,
  });
  const [assignQuestions, { isLoading: isAssigning }] = useAssignQuestionsMutation();
  const [selectedEmployees, setSelectedEmployees] = useState({});
  const [assignedDate, setAssignedDate] = useState(getTodayDate);
  const [formError, setFormError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const employees = (data?.data ?? []).filter(isAssignableEmployee);
  const totalPages = data?.total_pages ?? 1;
  const selectedEmployeeList = Object.values(selectedEmployees);

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
        assignedDate,
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
          <div className="qba-body">
            <div className="qba-success" role="status">
              {questions.length} {questions.length === 1 ? 'question was' : 'questions were'} assigned to {selectedEmployeeList.length} {selectedEmployeeList.length === 1 ? 'employee' : 'employees'}.
            </div>
            <div className="qba-footer">
              <button type="button" className="qba-submit" onClick={() => { onAssigned(); onClose(); }}>Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="qba-body">
              {formError && <div className="qba-error" role="alert">{formError}</div>}

              <div className="qba-selected-questions">
                <strong>Questions to assign</strong>
                {questions.slice(0, 3).map((question) => (
                  <span key={question.id}>{question.title}</span>
                ))}
                {questions.length > 3 && <span>and {questions.length - 3} more</span>}
              </div>

              <div className="qba-date-field">
                <label htmlFor="qba-assigned-date">Assigned date</label>
                <input
                  id="qba-assigned-date"
                  type="date"
                  value={assignedDate}
                  onChange={(event) => setAssignedDate(event.target.value)}
                  required
                />
              </div>

              <div className="qba-list-heading">
                <div>
                  <h3>Active employees</h3>
                  <span>{selectedEmployeeList.length} selected</span>
                </div>
                {totalPages > 1 && <span>Page {employeePage} of {totalPages}</span>}
              </div>

              {isLoading ? (
                <p className="qba-state">Loading employees...</p>
              ) : isError ? (
                <div className="qba-state" role="alert">
                  <p>{getApiErrorMessage(error)}</p>
                  <button type="button" className="qba-secondary" onClick={refetch}>Retry</button>
                </div>
              ) : employees.length === 0 ? (
                <p className="qba-state">No active employees available to assign.</p>
              ) : (
                <div className="qba-employee-list" aria-busy={isFetching}>
                  {employees.map((employee) => {
                    const id = getEmployeeUserId(employee);
                    const key = String(id);
                    const name = `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
                    return (
                      <label className="qba-employee-option" key={key}>
                        <input
                          type="checkbox"
                          checked={Boolean(selectedEmployees[key])}
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
                  <button type="button" className="qba-secondary" onClick={() => setEmployeePage((page) => Math.min(totalPages, page + 1))} disabled={employeePage >= totalPages || isFetching}>
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="qba-footer">
              <button type="button" className="qba-secondary" onClick={onClose} disabled={isAssigning}>Cancel</button>
              <button type="submit" className="qba-submit" disabled={isAssigning || isLoading || isFetching || isError || employees.length === 0}>
                {isAssigning ? 'Assigning...' : 'Assign to employees'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
