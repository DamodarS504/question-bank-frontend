import { useState, useMemo } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { useGetQuestionsQuery } from '../../features/questions/questionBankApi';
import { getApiErrorMessage } from '../../features/auth/authApi';
import EmployeeAnswerEditor from './EmployeeAnswerEditor';
import QuestionAssignmentModal from './QuestionAssignmentModal';
import UploadModal from './UploadModal';
import './Questions.css';

const ITEMS_PER_PAGE = 10;

function getDifficultyTone(diff) {
  if (!diff) return 'default';
  const d = String(diff).toLowerCase();
  if (d.includes('easy')) return 'easy';
  if (d.includes('med')) return 'medium';
  if (d.includes('hard')) return 'hard';
  return 'default';
}

function formatCreatedAt(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getQuestionId(question) {
  const id = question.question_id ?? question.id ?? question._id;
  if (id == null || id === '') return null;
  const numericId = Number(id);
  return Number.isInteger(numericId) ? numericId : null;
}

export default function QuestionsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTechnology, setSelectedTechnology] = useState('all');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedCloudPlatform, setSelectedCloudPlatform] = useState('all');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useGetQuestionsQuery();

  const allQuestions = useMemo(() => data?.data ?? [], [data]);

  const filterOptions = useMemo(() => {
    const options = {
      technology: new Set(),
      client: new Set(),
      framework: new Set(),
      cloudPlatform: new Set(),
    };

    allQuestions.forEach((q) => {
      const technology = q.technology_name || q.technology || q.tech_stack || q.category;
      const client = q.client_name || q.client;
      const framework = q.framework && q.framework.toLowerCase() !== 'nan' ? q.framework : null;
      const cloudPlatform = q.cloud_platform || q.cloud;

      if (technology) options.technology.add(technology);
      if (client) options.client.add(client);
      if (framework) options.framework.add(framework);
      if (cloudPlatform) options.cloudPlatform.add(cloudPlatform);
    });

    return Object.fromEntries(
      Object.entries(options).map(([key, values]) => [key, Array.from(values).sort()]),
    );
  }, [allQuestions]);

  const filtered = useMemo(() => {
    return allQuestions.filter((q) => {
      const text = (
        (q.question || q.question_text || q.title || q.prompt || '') +
        ' ' +
        (q.answer || q.solution || q.explanation || '') +
        ' ' +
        (q.technology_name || q.technology || q.tech_stack || q.category || '') +
        ' ' +
        (q.client_name || q.client || '') +
        ' ' +
        (q.framework || '') +
        ' ' +
        (q.cloud_platform || q.cloud || '')
      ).toLowerCase();

      const matchesSearch = !search.trim() || text.includes(search.toLowerCase());

      const diff = String(q.difficulty || q.level || '').toLowerCase();
      const matchesDiff =
        selectedDifficulty === 'all' || diff.includes(selectedDifficulty.toLowerCase());

      const technology = (q.technology_name || q.technology || q.tech_stack || q.category || '').toLowerCase();
      const client = (q.client_name || q.client || '').toLowerCase();
      const framework = (q.framework || '').toLowerCase();
      const cloudPlatform = (q.cloud_platform || q.cloud || '').toLowerCase();
      const matchesTechnology =
        selectedTechnology === 'all' || technology === selectedTechnology.toLowerCase();
      const matchesClient = selectedClient === 'all' || client === selectedClient.toLowerCase();
      const matchesFramework =
        selectedFramework === 'all' || framework === selectedFramework.toLowerCase();
      const matchesCloudPlatform =
        selectedCloudPlatform === 'all' || cloudPlatform === selectedCloudPlatform.toLowerCase();

      return matchesSearch && matchesDiff && matchesTechnology && matchesClient
        && matchesFramework && matchesCloudPlatform;
    });
  }, [
    allQuestions,
    search,
    selectedDifficulty,
    selectedTechnology,
    selectedClient,
    selectedFramework,
    selectedCloudPlatform,
  ]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const assignableQuestions = useMemo(
    () => allQuestions
      .filter((question) => selectedQuestionIds.has(getQuestionId(question)))
      .map((question) => ({
        id: getQuestionId(question),
        title: question.question || question.question_text || question.title || question.prompt || 'Untitled Question',
      })),
    [allQuestions, selectedQuestionIds],
  );
  const visibleQuestionIds = paginatedQuestions
    .map(getQuestionId)
    .filter((id) => id !== null);
  const allVisibleSelected = visibleQuestionIds.length > 0
    && visibleQuestionIds.every((id) => selectedQuestionIds.has(id));

  const hasActiveFilters = Boolean(
    search || selectedDifficulty !== 'all' || selectedTechnology !== 'all'
      || selectedClient !== 'all' || selectedFramework !== 'all' || selectedCloudPlatform !== 'all'
  );

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleQuestionSelection = (id) => {
    if (id === null) return;
    setSelectedQuestionIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(id)) nextIds.delete(id);
      else nextIds.add(id);
      return nextIds;
    });
  };

  const toggleVisibleQuestions = () => {
    setSelectedQuestionIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (allVisibleSelected) visibleQuestionIds.forEach((id) => nextIds.delete(id));
      else visibleQuestionIds.forEach((id) => nextIds.add(id));
      return nextIds;
    });
  };

  return (
    <DashboardLayout title="Question Bank" eyebrow="Administration" allowedRoles={['ADMIN']}>
      <div className="qb-container">
        {/* Top Header */}
        <div className="qb-header">
          <div className="qb-header__info">
            <h1>All Questions</h1>
            <p>View, search, and manage interview questions across all tech stacks</p>
          </div>
          <div className="qb-header__actions">
            {selectedQuestionIds.size > 0 && (
              <>
                <button
                  type="button"
                  className="qb-btn-assign"
                  onClick={() => setIsAssignOpen(true)}
                >
                  Assign {selectedQuestionIds.size} {selectedQuestionIds.size === 1 ? 'question' : 'questions'}
                </button>
                <button
                  type="button"
                  className="qb-clear-selection"
                  onClick={() => setSelectedQuestionIds(new Set())}
                >
                  Clear selection
                </button>
              </>
            )}
            <button
              type="button"
              className="qb-btn-upload"
              onClick={() => setIsUploadOpen(true)}
              id="upload-questions-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload Questions
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="qb-controls">
          <div className="qb-search-wrap">
            <span className="qb-search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="qb-search-input"
              placeholder="Search questions or keywords..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="qb-filters">
            <select
              className="qb-select"
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by difficulty"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {filterOptions.technology.length > 0 && (
              <select
                className="qb-select"
                value={selectedTechnology}
                onChange={(e) => {
                  setSelectedTechnology(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by technology"
              >
                <option value="all">All Technologies</option>
                {filterOptions.technology.map((technology) => (
                  <option key={technology} value={technology}>{technology}</option>
                ))}
              </select>
            )}

            {filterOptions.client.length > 0 && (
              <select
                className="qb-select"
                value={selectedClient}
                onChange={(e) => {
                  setSelectedClient(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by client"
              >
                <option value="all">All Clients</option>
                {filterOptions.client.map((client) => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            )}

            {filterOptions.framework.length > 0 && (
              <select
                className="qb-select"
                value={selectedFramework}
                onChange={(e) => {
                  setSelectedFramework(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by framework"
              >
                <option value="all">All Frameworks</option>
                {filterOptions.framework.map((framework) => (
                  <option key={framework} value={framework}>{framework}</option>
                ))}
              </select>
            )}

            {filterOptions.cloudPlatform.length > 0 && (
              <select
                className="qb-select"
                value={selectedCloudPlatform}
                onChange={(e) => {
                  setSelectedCloudPlatform(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by cloud platform"
              >
                <option value="all">All Cloud Platforms</option>
                {filterOptions.cloudPlatform.map((cloudPlatform) => (
                  <option key={cloudPlatform} value={cloudPlatform}>{cloudPlatform}</option>
                ))}
              </select>
            )}

            <span className="qb-count-badge">
              {filtered.length} {filtered.length === 1 ? 'question' : 'questions'}
            </span>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="qb-state-card">
            <div className="qb-state-icon">
              <span className="upload-spinner" style={{ width: '28px', height: '28px', borderTopColor: '#0d9488' }} />
            </div>
            <h2>Loading Question Bank...</h2>
            <p>Fetching questions from the server.</p>
          </div>
        ) : isError ? (
          <div className="qb-state-card" style={{ borderColor: '#fecaca' }}>
            <div className="qb-state-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2>Failed to load questions</h2>
            <p>{getApiErrorMessage(error)}</p>
            <button type="button" className="qb-btn-upload" onClick={refetch}>
              Retry Loading
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="qb-state-card qb-state-card--empty">
            <h2>{hasActiveFilters ? 'No matching questions found' : 'No questions in the bank yet'}</h2>
            <p>
              {hasActiveFilters
                ? 'Try adjusting your search keywords or clear filters to see more results.'
                : 'Questions added to the bank will appear here.'}
            </p>
          </div>
        ) : (
          <div className="qb-card">
            <div className="qb-table-wrap">
              <table className="qb-table">
                <thead>
                  <tr>
                    <th className="qb-selection-cell">
                      <label className="qb-checkbox-wrap">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={toggleVisibleQuestions}
                          aria-label="Select all visible questions"
                          disabled={visibleQuestionIds.length === 0}
                        />
                      </label>
                    </th>
                    <th className="qb-col-num">
                      <span className="qb-num-wrap">#</span>
                    </th>
                    <th>Question</th>
                    <th>Technology</th>
                    <th>Client</th>
                    <th>Framework</th>
                    <th>Cloud</th>
                    <th>Difficulty</th>
                    <th>Rating</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedQuestions.map((q, idx) => {
                    const rowId = q.question_id || q.id || q._id || `q-${idx}`;
                    const questionText = q.question || q.question_text || q.title || q.prompt || 'Untitled Question';
                    const answerText = q.answer || q.solution || q.explanation || null;
                    const technology = q.technology_name || q.technology || q.tech_stack || q.category || '—';
                    const client = q.client_name || q.client || '—';
                    const framework = q.framework && q.framework !== 'nan' ? q.framework : '—';
                    const cloudPlatform = q.cloud_platform || q.cloud || '—';
                    const diff = q.difficulty || q.level || 'Medium';
                    const diffTone = getDifficultyTone(diff);
                    const rating = q.rating ?? '—';
                    const isExpanded = expandedIds.has(rowId);
                    const displayIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                    const questionId = getQuestionId(q);
                    const isSelected = questionId !== null && selectedQuestionIds.has(questionId);

                    return (
                      <tr key={rowId} className={isSelected ? 'qb-row--selected' : ''}>
                        <td className="qb-selection-cell">
                          <label className="qb-checkbox-wrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleQuestionSelection(questionId)}
                              aria-label={`Select question ${displayIndex}`}
                              disabled={questionId === null}
                            />
                          </label>
                        </td>
                        <td className="qb-col-num">
                          <span className="qb-num-wrap">{displayIndex}</span>
                        </td>
                        <td className="qb-col-question">
                          <p className="qb-question-title">{questionText}</p>
                          <div className="qb-question-actions">
                            {answerText && (
                              <button
                                type="button"
                                className="qb-answer-toggle"
                                onClick={() => toggleExpand(rowId)}
                                aria-expanded={isExpanded}
                              >
                                {isExpanded ? 'Hide Answer' : 'View Answer'}
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </button>
                            )}
                            {questionId !== null && (
                              <EmployeeAnswerEditor questionId={questionId} questionTitle={questionText} />
                            )}
                          </div>
                          {answerText && isExpanded && (
                            <div className="qb-answer-preview">
                              {answerText}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="qb-category-badge">{technology}</span>
                        </td>
                        <td>{client}</td>
                        <td>{framework}</td>
                        <td>{cloudPlatform}</td>
                        <td>
                          <span className={`qb-diff-badge qb-diff-badge--${diffTone}`}>
                            {diff}
                          </span>
                        </td>
                        <td className="qb-rating">★ {rating}</td>
                        <td className="qb-created-date">{formatCreatedAt(q.created_at || q.createdAt)}</td>
                        <td style={{ textAlign: 'right' }}>
                          {answerText && (
                            <button
                              type="button"
                              className="qb-answer-toggle"
                              onClick={() => toggleExpand(rowId)}
                            >
                              {isExpanded ? 'Collapse' : 'Details'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="qb-pagination">
                <span>
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                </span>
                <div className="qb-pagination-buttons">
                  <button
                    type="button"
                    className="qb-page-btn"
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </button>
                  <span style={{ alignSelf: 'center', padding: '0 0.5rem', fontWeight: 600 }}>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="qb-page-btn"
                    onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* File Upload Modal */}
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
        />
        {isAssignOpen && (
          <QuestionAssignmentModal
            questions={assignableQuestions}
            onClose={() => setIsAssignOpen(false)}
            onAssigned={() => setSelectedQuestionIds(new Set())}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
