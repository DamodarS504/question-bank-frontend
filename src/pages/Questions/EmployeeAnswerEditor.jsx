import { useEffect, useState, useRef } from 'react';
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

function formatAnswerDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getAuthorInitial(name) {
  if (!name) return 'A';
  return name.trim().charAt(0).toUpperCase();
}

function getAnswerAuthorName(savedAnswer, isOwner) {
  if (isOwner) return 'You';
  return (
    savedAnswer.author_name
    || savedAnswer.user_name
    || savedAnswer.employee_name
    || (savedAnswer.first_name ? `${savedAnswer.first_name} ${savedAnswer.last_name || ''}`.trim() : null)
    || (savedAnswer.user ? `${savedAnswer.user.first_name || ''} ${savedAnswer.user.last_name || ''}`.trim() : null)
    || (savedAnswer.employee_id ? `Employee #${savedAnswer.employee_id}` : null)
    || 'Contributor'
  );
}

/* 5-Star Rating Component */
function StarRating({ rating }) {
  const numericRating = Math.max(0, Math.min(5, Number(rating) || 0));
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating - fullStars >= 0.5;

  return (
    <div className="qba-stars-badge" title={`Rating: ${numericRating} / 5`}>
      <div className="qba-stars-row" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= fullStars;
          const isHalf = !isFilled && star === fullStars + 1 && hasHalfStar;
          return (
            <svg
              key={star}
              className={`qba-star-svg ${isFilled ? 'qba-star--filled' : isHalf ? 'qba-star--half' : 'qba-star--empty'}`}
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill={isFilled || isHalf ? '#f59e0b' : 'none'}
              stroke={isFilled || isHalf ? '#f59e0b' : '#cbd5e1'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          );
        })}
      </div>
      <span className="qba-stars-number">
        {numericRating > 0 ? numericRating.toFixed(numericRating % 1 === 0 ? 0 : 1) : '0'}
      </span>
    </div>
  );
}

function renderInlineMarkdown(str) {
  const elements = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      elements.push(str.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      elements.push(<code key={match.index} className="qba-inline-code">{token.slice(1, -1)}</code>);
    } else if (token.startsWith('**') && token.endsWith('**')) {
      elements.push(<strong key={match.index}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      elements.push(<em key={match.index}>{token.slice(1, -1)}</em>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < str.length) {
    elements.push(str.substring(lastIndex));
  }

  return elements.length > 0 ? elements : str;
}

function FormattedAnswer({ text }) {
  if (!text) return null;

  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="qba-formatted-text">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const content = part.slice(3, -3).replace(/^[a-z0-9_-]*\n/i, '');
          return (
            <pre key={index} className="qba-code-block">
              <code>{content}</code>
            </pre>
          );
        }

        const paragraphs = part.split(/\n{2,}/);
        return paragraphs.map((para, pIdx) => {
          if (!para.trim()) return null;

          const lines = para.split('\n');
          const isList = lines.every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '));
          if (isList) {
            return (
              <ul key={`${index}-${pIdx}`} className="qba-answer-list">
                {lines.map((line, lIdx) => (
                  <li key={lIdx}>{renderInlineMarkdown(line.trim().replace(/^[-*]\s+/, ''))}</li>
                ))}
              </ul>
            );
          }

          return (
            <p key={`${index}-${pIdx}`} className="qba-answer-paragraph">
              {lines.map((line, lIdx) => (
                <span key={lIdx}>
                  {renderInlineMarkdown(line)}
                  {lIdx < lines.length - 1 && <br />}
                </span>
              ))}
            </p>
          );
        });
      })}
    </div>
  );
}

/* Interactive Star Rating Selector */
function InteractiveRatingSelector({ rating, onChange, disabled }) {
  const [hoveredRating, setHoveredRating] = useState(null);
  const currentRating = Math.max(1, Math.min(5, Number(rating) || 5));
  const displayRating = hoveredRating !== null ? hoveredRating : currentRating;

  const ratingDescriptions = {
    1: '1 star (Basic)',
    2: '2 stars (Fair)',
    3: '3 stars (Good)',
    4: '4 stars (Very good)',
    5: '5 stars (Excellent)',
  };

  return (
    <div className="qba-interactive-rating" role="group" aria-label="Select answer rating">
      <span className="qba-interactive-rating__label">Rating:</span>
      <div
        className="qba-interactive-stars"
        onMouseLeave={() => setHoveredRating(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          return (
            <button
              key={star}
              type="button"
              className={`qba-star-btn ${isFilled ? 'qba-star-btn--filled' : ''}`}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoveredRating(star)}
              disabled={disabled}
              title={`Rate ${star} star${star > 1 ? 's' : ''}`}
              aria-label={`${star} star`}
            >
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill={isFilled ? '#f59e0b' : 'none'}
                stroke={isFilled ? '#f59e0b' : '#cbd5e1'}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          );
        })}
      </div>
      <span className="qba-interactive-rating__hint">
        {ratingDescriptions[displayRating]}
      </span>
    </div>
  );
}

/* Professional Editor Component with Formatting Toolbar & Preview */
function RichAnswerEditor({
  title = 'Your Answer',
  value,
  onChange,
  rating,
  onRatingChange,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = 'Post Your Answer',
  placeholder = 'Write a clear, complete answer with code snippets, bullet points, or detailed explanations...',
}) {
  const [activeTab, setActiveTab] = useState('write');
  const textareaRef = useRef(null);

  const applyFormat = (type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    let replacement = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        replacement = `**${selected || 'bold text'}**`;
        cursorOffset = selected ? replacement.length : 2;
        break;
      case 'italic':
        replacement = `*${selected || 'italic text'}*`;
        cursorOffset = selected ? replacement.length : 1;
        break;
      case 'code':
        replacement = `\`${selected || 'code'}\``;
        cursorOffset = selected ? replacement.length : 1;
        break;
      case 'codeblock':
        replacement = `\n\`\`\`\n${selected || '// code here'}\n\`\`\`\n`;
        cursorOffset = selected ? replacement.length : 5;
        break;
      case 'list':
        replacement = `\n- ${selected || 'item'}`;
        cursorOffset = replacement.length;
        break;
      case 'quote':
        replacement = `\n> ${selected || 'quote'}`;
        cursorOffset = replacement.length;
        break;
      default:
        return;
    }

    const nextValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(nextValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + cursorOffset,
        start + cursorOffset + (selected ? 0 : (replacement.length - cursorOffset * 2)),
      );
    }, 0);
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div className="qba-rich-editor">
      <div className="qba-editor-header">
        <div className="qba-editor-header-left">
          {title && <h4 className="qba-editor-title">{title}</h4>}
          <div className="qba-editor-tabs">
            <button
              type="button"
              className={`qba-editor-tab ${activeTab === 'write' ? 'qba-editor-tab--active' : ''}`}
              onClick={() => setActiveTab('write')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
              Write
            </button>
            <button
              type="button"
              className={`qba-editor-tab ${activeTab === 'preview' ? 'qba-editor-tab--active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              Preview
            </button>
          </div>
        </div>

        <div className="qba-editor-header-right">
          {activeTab === 'write' && (
            <div className="qba-editor-toolbar" role="toolbar" aria-label="Formatting options">
              <button
                type="button"
                className="qba-toolbar-btn"
                onClick={() => applyFormat('bold')}
                title="Bold (**text**)"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                className="qba-toolbar-btn"
                onClick={() => applyFormat('italic')}
                title="Italic (*text*)"
              >
                <em>I</em>
              </button>
              <button
                type="button"
                className="qba-toolbar-btn"
                onClick={() => applyFormat('code')}
                title="Inline Code (`code`)"
              >
                &lt;/&gt;
              </button>
              <button
                type="button"
                className="qba-toolbar-btn"
                onClick={() => applyFormat('codeblock')}
                title="Code Block (```)"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
              </button>
              <button
                type="button"
                className="qba-toolbar-btn"
                onClick={() => applyFormat('list')}
                title="Bulleted List (- item)"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="4" /><line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="4" /><line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="4" /></svg>
              </button>
              <button
                type="button"
                className="qba-toolbar-btn"
                onClick={() => applyFormat('quote')}
                title="Quote (> text)"
              >
                &ldquo;
              </button>
            </div>
          )}

          {onCancel && (
            <button
              type="button"
              className="qba-editor-dismiss-btn"
              onClick={onCancel}
              title="Close editor"
              aria-label="Close editor"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      <div className="qba-editor-body">
        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            className="qba-editor-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={6}
            disabled={isSubmitting}
            autoFocus
          />
        ) : (
          <div className="qba-editor-preview">
            {value.trim() ? (
              <FormattedAnswer text={value} />
            ) : (
              <p className="qba-preview-placeholder">Nothing to preview yet. Switch to Write to enter your answer.</p>
            )}
          </div>
        )}
      </div>

      <div className="qba-editor-footer">
        <div className="qba-editor-footer-left">
          {onRatingChange && (
            <InteractiveRatingSelector
              rating={rating}
              onChange={onRatingChange}
              disabled={isSubmitting}
            />
          )}
          <span className="qba-editor-count">
            {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} chars
          </span>
        </div>
        <div className="qba-editor-actions">
          {onCancel && (
            <button
              type="button"
              className="qba-btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            className="qba-btn-primary"
            onClick={onSubmit}
            disabled={isSubmitting || !value.trim()}
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeAnswerEditor({ questionId, questionTitle }) {
  const { data: profile } = useGetProfileQuery();
  const authUser = useSelector((state) => state.auth?.user);
  const currentUser = profile || authUser;

  const [isOpen, setIsOpen] = useState(false);
  const [isWritingAnswer, setIsWritingAnswer] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState([]);
  const [answer, setAnswer] = useState('');
  const [rating, setRating] = useState(5);
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editingAnswer, setEditingAnswer] = useState('');
  const [editingRating, setEditingRating] = useState(5);
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
    setIsWritingAnswer(false);
    setFormError('');
    setSuccessMessage('');
    setEditingAnswerId(null);
    setAnswer('');
    setRating(5);
    await refreshAnswers();
  };

  const handleSubmit = async () => {
    setFormError('');
    setSuccessMessage('');

    if (!answer.trim()) {
      setFormError('Please enter your answer before submitting.');
      return;
    }

    try {
      await submitAnswer({
        question_id: questionId,
        answer: answer.trim(),
        answer_rating: Number(rating) || 5,
      }).unwrap();
      setAnswer('');
      setRating(5);
      setIsWritingAnswer(false);
      setSuccessMessage('Your answer has been submitted.');
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
    setEditingRating(Math.max(1, Math.min(5, Number(savedAnswer.answer_rating ?? savedAnswer.rating) || 5)));
    setIsWritingAnswer(false);
    setFormError('');
    setSuccessMessage('');
  };

  const handleUpdate = async (savedAnswer) => {
    setFormError('');
    setSuccessMessage('');

    if (!canManageAnswer(savedAnswer, currentUser)) {
      setFormError('You can only update answers written by you.');
      return;
    }

    const answerId = savedAnswer.answer_id ?? savedAnswer.id;
    if (!editingAnswer.trim()) {
      setFormError('Answer cannot be empty.');
      return;
    }

    try {
      await updateAnswer({
        answer_id: answerId,
        question_id: questionId,
        answer: editingAnswer.trim(),
        answer_rating: Number(editingRating) || 5,
      }).unwrap();
      setEditingAnswerId(null);
      setEditingAnswer('');
      setSuccessMessage('Answer updated successfully.');
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
      setSuccessMessage('Answer deleted successfully.');
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
                <p>Read community responses or contribute your own explanation.</p>
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

              {/* Top Controls Bar */}
              <div className="qba-answers-bar">
                <div className="qba-answers-bar__title">
                  <h3>Answers</h3>
                  <span className="qba-count-badge">{savedAnswers.length}</span>
                </div>

                {!isWritingAnswer && (
                  <button
                    type="button"
                    className="qba-btn-add-answer"
                    onClick={() => {
                      setIsWritingAnswer(true);
                      setEditingAnswerId(null);
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Write an Answer
                  </button>
                )}
              </div>

              {/* Write New Answer Form */}
              {isWritingAnswer && (
                <RichAnswerEditor
                  title="Your Answer"
                  value={answer}
                  onChange={setAnswer}
                  rating={rating}
                  onRatingChange={setRating}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsWritingAnswer(false)}
                  isSubmitting={isSavingAnswer}
                  submitLabel="Post Your Answer"
                />
              )}

              {/* Answers List */}
              {isLoadingAnswer ? (
                <div className="qba-state">
                  <span className="upload-spinner" style={{ width: '24px', height: '24px', borderTopColor: '#0d9488' }} />
                  <p>Loading answers...</p>
                </div>
              ) : savedAnswers.length > 0 ? (
                <div className="qba-saved-answers-list" aria-live="polite">
                  {savedAnswers.map((savedAnswer, index) => {
                    const answerId = savedAnswer.answer_id ?? savedAnswer.id;
                    const isEditing = editingAnswerId === answerId;
                    const isOwner = canManageAnswer(savedAnswer, currentUser);
                    const authorName = getAnswerAuthorName(savedAnswer, isOwner);
                    const authorInitial = getAuthorInitial(authorName);
                    const createdDate = formatAnswerDate(savedAnswer.created_at || savedAnswer.createdAt);
                    if (isEditing) {
                      return (
                        <RichAnswerEditor
                          key={answerId ?? `${questionId}-${index}`}
                          title="Edit Your Answer"
                          value={editingAnswer}
                          onChange={setEditingAnswer}
                          rating={editingRating}
                          onRatingChange={setEditingRating}
                          onSubmit={() => handleUpdate(savedAnswer)}
                          onCancel={() => setEditingAnswerId(null)}
                          isSubmitting={isUpdatingAnswer}
                          submitLabel="Save Changes"
                        />
                      );
                    }

                    return (
                      <article
                        className={`qba-saved-answer-card ${isOwner ? 'qba-saved-answer-card--owner' : ''}`}
                        key={answerId ?? `${questionId}-${index}`}
                      >
                        <div className="qba-card-top-bar">
                          <div className="qba-author-block">
                            <div className="qba-author-avatar" aria-hidden="true">
                              {authorInitial}
                            </div>
                            <div className="qba-author-meta">
                              <div className="qba-author-name-row">
                                <strong className="qba-author-name">{authorName}</strong>
                                {isOwner && (
                                  <span className="qba-owner-badge">You</span>
                                )}
                              </div>
                              {createdDate && (
                                <span className="qba-author-date">{createdDate}</span>
                              )}
                            </div>
                          </div>

                          {isOwner && (
                            <div className="qba-card-actions">
                              <button
                                type="button"
                                className="qba-action-btn"
                                onClick={() => handleStartEdit(savedAnswer)}
                                disabled={isMutatingAnswer}
                                title="Edit this answer"
                                aria-label="Edit answer"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                type="button"
                                className="qba-action-btn qba-action-btn--delete"
                                onClick={() => handleDelete(savedAnswer)}
                                disabled={isMutatingAnswer}
                                title="Delete this answer"
                                aria-label="Delete answer"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="qba-card-text">
                          <FormattedAnswer text={savedAnswer.answer} />
                        </div>

                        <div className="qba-card-footer">
                          <StarRating rating={savedAnswer.answer_rating ?? savedAnswer.rating ?? 0} />
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : !isWritingAnswer ? (
                <div className="qba-empty-answers">
                  <div className="qba-empty-icon" aria-hidden="true">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <h3>No answers yet</h3>
                  <p>Be the first to contribute a clear, complete answer to this question.</p>
                  <button
                    type="button"
                    className="qba-btn-add-answer"
                    onClick={() => setIsWritingAnswer(true)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Write the First Answer
                  </button>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}