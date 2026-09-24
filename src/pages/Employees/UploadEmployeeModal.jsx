import { useState, useRef } from 'react';
import { useUploadEmployeesMutation } from '../../features/employees/employeesApi';
import { getApiErrorMessage } from '../../features/auth/authApi';
import './Employees.css';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function UploadEmployeeModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  const [uploadEmployees, { isLoading }] = useUploadEmployeesMutation();

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectFile = (selected) => {
    setErrorMsg('');
    setSuccessMsg('');
    setFile(selected);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setErrorMsg('');
    setSuccessMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadEmployees(formData).unwrap();

      setSuccessMsg('Employees uploaded successfully.');
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    }
  };

  const handleClose = () => {
    setFile(null);
    setErrorMsg('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <div className="emp-modal-overlay" onClick={handleClose}>
      <div className="emp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="emp-modal-header">
          <div>
            <h3>Upload Employees</h3>
            <p className="emp-dropzone-sub">Bulk import employee data via spreadsheet file</p>
          </div>
          <button type="button" className="emp-modal-close" onClick={handleClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleUpload}>
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

            <div
              className={`emp-dropzone ${isDragging ? 'emp-dropzone--active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="emp-hidden-input"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleSelectFile(e.target.files[0]);
                  }
                }}
              />
              <div className="emp-dropzone-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="emp-dropzone-title">Click to upload or drag and drop</p>
              <p className="emp-dropzone-sub">Supports CSV, XLSX, or XLS spreadsheets</p>
            </div>

            {file && (
              <div className="emp-selected-file">
                <div className="emp-file-info">
                  <span className="emp-file-name">{file.name}</span>
                  <span className="emp-file-size">({formatBytes(file.size)})</span>
                </div>
                <button type="button" className="emp-remove-file" onClick={handleRemoveFile}>
                  &times;
                </button>
              </div>
            )}
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
              disabled={isLoading || !file}
            >
              {isLoading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
