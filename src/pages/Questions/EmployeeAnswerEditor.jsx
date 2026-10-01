import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getApiErrorMessage, useGetProfileQuery } from '../../features/auth/authApi';
import {
  useDeleteEmployeeAnswerMutation,
  useLazyGetEmployeeAnswerQuery,
  useSubmitEmployeeAnswerMutation,
  useUpdateEmployeeAnswerMutation,
} from '../../features/questions/questionBankApi';

function getAnswerRecords(response) {
  return Array.isArray(response) ? response : [];
}

function getAnswerAuthorId(savedAnswer) {
  if (!savedAnswer || typeof savedAnswer !== 'object') return null;
  return (
    savedAnswer.user_id
    ?? savedAnswer.userId
    ?? savedAnswer.employee_id
    ?? savedAnswer.employeeId
    ?? savedAnswer.created_by
    ?? savedAnswer.createdBy
    ?? savedAnswer.author_id
    ?? savedAnswer.authorId
    ?? savedAnswer.user?.id
    ?? savedAnswer.user?.user_id
    ?? savedAnswer.user?.employee_id
    ?? savedAnswer.employee?.id
    ?? savedAnswer.employee?.user_id
    ?? savedAnswer.employee?.employee_id
    ?? null
  );
}

function getAnswerAuthorEmail(savedAnswer) {
  if (!savedAnswer || typeof savedAnswer !== 'object') return null;
  return (
    savedAnswer.email
    ?? savedAnswer.user_email
    ?? savedAnswer.userEmail
    ?? savedAnswer.author_email
    ?? savedAnswer.user?.email
    ?? savedAnswer.employee?.email
    ?? null
  );
}

export function canManageAnswer(savedAnswer, currentUser) {
  if (!savedAnswer || !currentUser) return false;

  // Explicit boolean flag if backend provides it
  if (savedAnswer.is_owner === true || savedAnswer.isOwner === true || savedAnswer.is_mine === true || savedAnswer.can_edit === true) {
    return true;
  }
  if (savedAnswer.is_owner === false || savedAnswer.isOwner === false || savedAnswer.is_mine === false || savedAnswer.can_edit === false) {
    return false;
  }

  const answerAuthorId = getAnswerAuthorId(savedAnswer);
  const answerAuthorEmail = getAnswerAuthorEmail(savedAnswer);

  const currentUserId = currentUser.id ?? currentUser.user_id ?? currentUser.userId;
  const currentEmployeeId = currentUser.employee_id ?? currentUser.employeeId;
  const currentEmail = currentUser.email;

  // ID matching (numeric or string)
  if (answerAuthorId != null) {
    const authorIdStr = String(answerAuthorId).trim().toLowerCase();
    if (currentUserId != null && String(currentUserId).trim().toLowerCase() === authorIdStr) {
      return true;
    }
    if (currentEmployeeId != null && String(currentEmployeeId).trim().toLowerCase() === authorIdStr) {
      return true;
    }
  }

  // Email matching
  if (answerAuthorEmail && currentEmail) {
    if (String(answerAuthorEmail).trim().toLowerCase() === String(currentEmail).trim().toLowerCase()) {
      return true;
    }
  }

  return false;
}

export default function EmployeeAnswerEditor({ questionId, questionTitle }) {
  const { data: profile } = useGetProfileQuery();
  const authUser = useSelector((state) => state.auth?.user);
  const currentUser = profile || authUser;

  const [isOpen, setIsOpen] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState([]);
  const [answer, setAnswer] = useState('');
  const [rating, setRating] = useState('0');
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editingAnswer, setEditingAnswer] = useState('');
  const [editingRating, setEditingRating] = useState('0');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loadAnswer, { isFetching: isLoadingAnswer }] = useLazyGetEmployeeAnswerQuery();
  const [submitAnswer, { isLoading: isSavingAnswer }] = useSubmitEmployeeAnswerMutation();
  const [updateAnswer, { isLoading: isUpdatingAnswer }] = useUpdateEmployeeAnswerMutation();
  const [deleteAnswer, { isLoading: isDeletingAnswer }] = useDeleteEmployeeAnswerMutation();
  const isMutatingAnswer = isSavingAnswer || isUpdatingAnswer || isDeletingAnswer;

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isMutatingAnswer) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMutatingAnswer]);

  const refreshAnswers = async () => {
    try {
      const response = await loadAnswer({ question_id: questionId }, false).unwrap();
      setSavedAnswers(getAnswerRecords(response));
    } catch (error) {
      if (error.status === 404) {
        setSavedAnswers([]);
      } else {
        setFormError(getApiErrorMessage(error));
      }
    }
  };

  const handleOpen = async () => {
    setIsOpen(true);
    setFormError('');
    setSuccessMessage('');
    setEditingAnswerId(null);
    setAnswer('');
    setRating('0');
    await refreshAnswers();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    const answerRating = Number(rating);
    if (!answer.trim()) {
      setFormError('Enter your answer before submitting.');
      return;
    }
    if (!Number.isInteger(answerRating) || answerRating < 0) {
      setFormError('Rating must be a non-negative whole number.');
      return;
    }

    try {
      await submitAnswer({
        question_id: questionId,
        answer: answer.trim(),
        answer_rating: answerRating,
      }).unwrap();
      setAnswer('');
      setRating('0');
      setSuccessMessage('Your answer has been added.');
      await refreshAnswers();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  const handleStartEdit = (savedAnswer) => {
    if (!canManageAnswer(savedAnswer, currentUser)) {
      setFormError('You can only edit answers written by you.');
      return;
    }
    const answerId = savedAnswer.answer_id ?? savedAnswer.id;
    setEditingAnswerId(answerId);
    setEditingAnswer(savedAnswer.answer ?? '');
    setEditingRating(String(savedAnswer.answer_rating ?? 0));
    setFormError('');
    setSuccessMessage('');
  };

  const handleUpdate = async (event, savedAnswer) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!canManageAnswer(savedAnswer, currentUser)) {
      setFormError('You can only update answers written by you.');
      return;
    }

    const answerId = savedAnswer.answer_id ?? savedAnswer.id;
    const answerRating = Number(editingRating);
    if (!editingAnswer.trim()) {
      setFormError('Enter an answer before saving.');
      return;
    }
    if (!Number.isInteger(answerRating) || answerRating < 0) {
      setFormError('Rating must be a non-negative whole number.');
      return;
    }

    try {
      await updateAnswer({
        answer_id: answerId,
        question_id: questionId,
        answer: editingAnswer.trim(),
        answer_rating: answerRating,
      }).unwrap();
      setEditingAnswerId(null);
      setSuccessMessage('Answer updated.');
      await refreshAnswers();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  const handleDelete = async (savedAnswer) => {
    if (!canManageAnswer(savedAnswer, currentUser)) {
      setFormError('You can only delete answers written by you.');
      return;
    }
    const answerId = savedAnswer.answer_id ?? savedAnswer.id;
    if (!window.confirm('Delete this answer? This cannot be undone.')) return;
    setFormError('');
    setSuccessMessage('');

    try {
      await deleteAnswer({ answer_id: answerId, question_id: questionId }).unwrap();
      setSavedAnswers((currentAnswers) => currentAnswers.filter(
        (item) => (item.answer_id ?? item.id) !== answerId,
      ));
      if (editingAnswerId === answerId) setEditingAnswerId(null);
      setSuccessMessage('Answer deleted.');
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="qba-answer-editor">
      <button
        type="button"
        className="qba-open-button"
        onClick={handleOpen}
        aria-haspopup="dialog"
      >
        Review &amp; answer
      </button>

      {isOpen && (
        <div
          className="qba-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isMutatingAnswer) setIsOpen(false);
          }}
        >
          <section
            className="qba-answer-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`qba-question-${questionId}`}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && !isMutatingAnswer) setIsOpen(false);
            }}
          >
            <header className="qba-answer-header">
              <div>
                <span className="qba-answer-eyebrow">QUESTION ANSWERS</span>
                <h2 id={`qba-question-${questionId}`}>{questionTitle || `Question ${questionId}`}</h2>
                <p>Review existing responses or contribute your own.</p>
              </div>
              <button
                type="button"
                className="qba-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close answer workspace"
                autoFocus
                disabled={isMutatingAnswer}
              >
                &times;
              </button>
            </header>

            <div className="qba-answer-body">
              {formError && <p className="qba-error" role="alert">{formError}</p>}
              {successMessage && <p className="qba-success" role="status">{successMessage}</p>}

              <div className="qba-answer-columns">
                <section className="qba-responses" aria-labelledby={`qba-responses-${questionId}`}>
                  <div className="qba-section-heading">
                    <h3 id={`qba-responses-${questionId}`}>Existing answers</h3>
                    <span>{savedAnswers.length}</span>
                  </div>
                  {isLoadingAnswer ? (
                    <p className="qba-answer-empty">Loading answers...</p>
                  ) : savedAnswers.length > 0 ? (
                    <div className="qba-saved-answers" aria-live="polite">
                      {savedAnswers.map((savedAnswer, index) => {
                        const answerId = savedAnswer.answer_id ?? savedAnswer.id;
                        const isEditing = editingAnswerId === answerId;
                        const isOwner = canManageAnswer(savedAnswer, currentUser);

                        return (
                          <article
                            className="qba-saved-answer"
                            key={answerId ?? `${questionId}-${index}`}
                          >
                            {isEditing ? (
                              <form
                                className="qba-answer-edit-form"
                                onSubmit={(event) => handleUpdate(event, savedAnswer)}
                              >
                                <label className="qba-answer-field">
                                  Answer
                                  <textarea
                                    value={editingAnswer}
                                    onChange={(event) => setEditingAnswer(event.target.value)}
                                    rows={4}
                                    required
                                    disabled={isMutatingAnswer}
                                  />
                                </label>
                                <label className="qba-rating-field">
                                  Rating
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={editingRating}
                                    onChange={(event) => setEditingRating(event.target.value)}
                                    required
                                    disabled={isMutatingAnswer}
                                  />
                                </label>
                                <div className="qba-answer-actions">
                                  <button type="submit" className="qba-submit" disabled={isMutatingAnswer}>
                                    {isUpdatingAnswer ? 'Saving...' : 'Save changes'}
                                  </button>
                                  <button
                                    type="button"
                                    className="qba-secondary"
                                    onClick={() => setEditingAnswerId(null)}
                                    disabled={isMutatingAnswer}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <p>{savedAnswer.answer}</p>
                                <div className="qba-saved-answer-meta">
                                  {savedAnswer.answer_rating != null && (
                                    <small>Rating: {savedAnswer.answer_rating}</small>
                                  )}
                                  {isOwner && (
                                    <span className="qba-owner-badge">Your response</span>
                                  )}
                                </div>
                                {answerId != null && isOwner && (
                                  <div className="qba-answer-actions">
                                    <button
                                      type="button"
                                      className="qba-answer-action"
                                      onClick={() => handleStartEdit(savedAnswer)}
                                      disabled={isMutatingAnswer}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="qba-answer-action qba-answer-action--delete"
                                      onClick={() => handleDelete(savedAnswer)}
                                      disabled={isMutatingAnswer}
                                    >
                                      {isDeletingAnswer ? 'Deleting...' : 'Delete'}
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="qba-answer-empty">No answers yet. Add the first response.</p>
                  )}
                </section>

                <form className="qba-answer-form" onSubmit={handleSubmit}>
                  <div className="qba-section-heading">
                    <h3>Add a response</h3>
                  </div>
                  <label className="qba-answer-field">
                    Answer
                    <textarea
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      rows={7}
                      required
                      disabled={isLoadingAnswer || isSavingAnswer}
                      placeholder="Write a clear, complete answer..."
                    />
                  </label>
                  <label className="qba-rating-field">
                    Rating
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={rating}
                      onChange={(event) => setRating(event.target.value)}
                      required
                      disabled={isLoadingAnswer || isSavingAnswer}
                    />
                    <small>Enter a non-negative whole number.</small>
                  </label>
                  <button type="submit" className="qba-submit" disabled={isLoadingAnswer || isSavingAnswer}>
                    {isSavingAnswer ? 'Saving...' : 'Add answer'}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}