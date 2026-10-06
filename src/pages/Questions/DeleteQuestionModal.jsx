import { useState } from 'react';
import { useDeleteQuestionMutation } from '../../features/questions/questionBankApi';
import { getApiErrorMessage } from '../../features/auth/authApi';
import './Questions.css';

export default function DeleteQuestionModal({
  isOpen,
  onClose,
  question,
  onSuccess,
}) {
  const [deleteQuestion, { isLoading }] = useDeleteQuestionMutation();
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !question) return null;

  const questionId = question.question_id ?? question.id ?? question._id;
  const questionText = question.question || question.question_text || question.title || 'Untitled Question';
  const technology = question.technology_name || question.technology || question.category;
  const client = question.client_name || question.client;
  const difficulty = question.difficulty;

  const handleDelete = async () => {
    setErrorMsg('');
    try {
      await deleteQuestion({
        question_id: Number(questionId),
      }).unwrap();

      onSuccess?.(questionId, 'Question deleted successfully.');
      onClose();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    }
  };

  return (
    <div
      className="upload-modal-overlay"
      onClick={() => !isLoading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-question-title"
    >
      <div className="upload-modal qb-delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-modal__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="qb-delete-icon-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            <div>
              <h2 id="delete-question-title" style={{ fontSize: '1.15rem', margin: 0, color: '#0f172a' }}>Delete Question</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>Question #{questionId}</p>
            </div>
          </div>
          <button
            type="button"
            className="upload-modal__close-btn"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <div className="upload-modal__body" style={{ gap: '1rem' }}>
          {errorMsg && (
            <div className="upload-alert upload-alert--error" role="alert">
              <span>{errorMsg}</span>
            </div>
          )}

          <p style={{ margin: 0, color: '#334155', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Are you sure you want to permanently delete this question?
          </p>

          {/* Question Preview Box */}
          <div className="qb-delete-preview">
            <p className="qb-delete-preview-text">"{questionText}"</p>
            <div className="qb-delete-preview-tags">
              {technology && <span className="qb-category-badge">{technology}</span>}
              {difficulty && <span className="qb-diff-badge">{difficulty}</span>}
              {client && <span className="qb-client-tag">{client}</span>}
            </div>
          </div>

          <div className="qb-delete-warning">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>This action cannot be undone. The question will be permanently removed from the system.</span>
          </div>
        </div>

        <div className="upload-modal__footer">
          <button
            type="button"
            className="upload-btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="qb-btn-danger"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="upload-spinner" />
                Deleting...
              </>
            ) : (
              'Delete Question'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
