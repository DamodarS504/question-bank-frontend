import { useState } from 'react';
import { useCreateEmployeeMutation } from '../../features/employees/employeesApi';
import { getApiErrorMessage } from '../../features/auth/authApi';
import './Employees.css';

export default function CreateEmployeeModal({ isOpen, onClose }) {
  const [createEmployee, { isLoading }] = useCreateEmployeeMutation();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    gender: 'Male',
    base_location: '',
    competency: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
    if (successMsg) setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await createEmployee({
        employee_id: form.employee_id.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        gender: form.gender,
        base_location: form.base_location.trim(),
        competency: form.competency.trim(),
      }).unwrap();

      setSuccessMsg('Employee created successfully.');
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    }
  };

  const handleClose = () => {
    setForm({
      employee_id: '',
      first_name: '',
      last_name: '',
      email: '',
      gender: 'Male',
      base_location: '',
      competency: '',
    });
    setErrorMsg('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <div className="emp-modal-overlay" onClick={handleClose}>
      <div className="emp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="emp-modal-header">
          <div>
            <h3>Create Employee</h3>
            <p className="emp-dropzone-sub">Add a new employee record to the directory</p>
          </div>
          <button type="button" className="emp-modal-close" onClick={handleClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="emp-modal-body">
            {errorMsg && (
              <div className="profile-alert-error" role="alert">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="profile-alert-success">
                {successMsg}
              </div>
            )}

            <div className="emp-form-grid">
              <div className="auth-field emp-field-full">
                <label className="auth-label">Employee ID *</label>
                <input
                  type="text"
                  name="employee_id"
                  className="auth-input"
                  placeholder="e.g. EMP-1050"
                  value={form.employee_id}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  className="auth-input"
                  placeholder="John"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  className="auth-input"
                  placeholder="Doe"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field emp-field-full">
                <label className="auth-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="auth-input"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Gender</label>
                <select
                  name="gender"
                  className="auth-input"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="auth-field">
                <label className="auth-label">Base Location *</label>
                <input
                  type="text"
                  name="base_location"
                  className="auth-input"
                  placeholder="e.g. Indore"
                  value={form.base_location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field emp-field-full">
                <label className="auth-label">Competency *</label>
                <input
                  type="text"
                  name="competency"
                  className="auth-input"
                  placeholder="e.g. Python, React, Java"
                  value={form.competency}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="emp-modal-footer">
            <button
              type="button"
              className="profile-btn-cancel"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="emp-btn-create"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
