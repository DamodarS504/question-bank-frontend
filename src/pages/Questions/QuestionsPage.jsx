import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { useGetQuestionsQuery } from '../../features/questions/questionBankApi';
import { getApiErrorMessage } from '../../features/auth/authApi';
import EmployeeAnswerEditor from './EmployeeAnswerEditor';
import QuestionAssignmentModal from './QuestionAssignmentModal';
import UploadModal from './UploadModal';
import CustomSelect from '../../components/ui/CustomSelect';
import './Questions.css';

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'All Difficulties' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

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
  const [selectedQuestionsCache, setSelectedQuestionsCache] = useState(new Map());
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTechnology, setSelectedTechnology] = useState('all');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedCloudPlatform, setSelectedCloudPlatform] = useState('all');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  /* Debounce search input */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  /* Build backend query parameters */
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      size: ITEMS_PER_PAGE,
    };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    if (selectedDifficulty !== 'all') {
      params.difficulty = selectedDifficulty;
    }
    if (selectedTechnology !== 'all') {
      const parsedId = Number(selectedTechnology);
      if (Number.isInteger(parsedId)) {
        params.technology_id = parsedId;
      }
    }
    if (selectedClient !== 'all') {
      params.client = selectedClient;
    }
    if (selectedFramework !== 'all') {
      params.framework = selectedFramework;
    }
    if (selectedCloudPlatform !== 'all') {
      params.cloud_platform = selectedCloudPlatform;
    }

    return params;
  }, [
    currentPage,
    debouncedSearch,
    selectedDifficulty,
    selectedTechnology,
    selectedClient,
    selectedFramework,
    selectedCloudPlatform,
  ]);

  const { data, isLoading, isFetching, isError, error, refetch } = useGetQuestionsQuery(queryParams);

  const questions = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.questions)) return data.questions;
    if (Array.isArray(data.results)) return data.results;
    return [];
  }, [data]);

  const totalRecords = useMemo(() => {
    if (typeof data?.total === 'number') return data.total;
    if (typeof data?.total_records === 'number') return data.total_records;
    if (typeof data?.total_count === 'number') return data.total_count;
    if (typeof data?.count === 'number') return data.count;
    return questions.length;
  }, [data, questions.length]);

  const totalPages = useMemo(() => {
    if (typeof data?.total_pages === 'number') return data.total_pages;
    if (typeof data?.pages === 'number') return data.pages;
    return Math.max(1, Math.ceil(totalRecords / ITEMS_PER_PAGE));
  }, [data, totalRecords]);

  /* Dynamic filter options discovered from incoming questions */
  const [filterOptions, setFilterOptions] = useState({
    technology: [],
    client: [],
    framework: [],
    cloudPlatform: [],
  });

  useEffect(() => {
    if (!questions || questions.length === 0) return;

    setFilterOptions((prev) => {
      const techMap = new Map();
      prev.technology.forEach((t) => techMap.set(String(t.id ?? t.name), t));

      const clients = new Set(prev.client);
      const frameworks = new Set(prev.framework);
      const cloudPlatforms = new Set(prev.cloudPlatform);

      questions.forEach((q) => {
        const techName = q.technology_name || q.technology || q.tech_stack || q.category;
        const techId = q.technology_id ?? q.tech_id;
        if (techName) {
          const key = String(techId ?? techName);
          if (!techMap.has(key)) {
            techMap.set(key, { id: techId, name: techName });
          }
        }
        const client = q.client_name || q.client;
        const framework = q.framework && String(q.framework).toLowerCase() !== 'nan' ? q.framework : null;
        const cloudPlatform = q.cloud_platform || q.cloud;

        if (client) clients.add(client);
        if (framework) frameworks.add(framework);
        if (cloudPlatform) cloudPlatforms.add(cloudPlatform);
      });

      return {
        technology: Array.from(techMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
        client: Array.from(clients).sort(),
        framework: Array.from(frameworks).sort(),
        cloudPlatform: Array.from(cloudPlatforms).sort(),
      };
    });
  }, [questions]);

  /* Multi-question selection across pages */
  const toggleQuestionSelection = (question) => {
    const id = getQuestionId(question);
    if (id === null) return;
    setSelectedQuestionIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(id)) nextIds.delete(id);
      else nextIds.add(id);
      return nextIds;
    });
    setSelectedQuestionsCache((prev) => {
      const next = new Map(prev);
      const title = question.question || question.question_text || question.title || question.prompt || 'Untitled Question';
      next.set(id, { id, title });
      return next;
    });
  };

  const visibleQuestionIds = questions
    .map(getQuestionId)
    .filter((id) => id !== null);

  const allVisibleSelected = visibleQuestionIds.length > 0
    && visibleQuestionIds.every((id) => selectedQuestionIds.has(id));

  const toggleVisibleQuestions = () => {
    setSelectedQuestionIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (allVisibleSelected) {
        visibleQuestionIds.forEach((id) => nextIds.delete(id));
      } else {
        visibleQuestionIds.forEach((id) => nextIds.add(id));
      }
      return nextIds;
    });
    setSelectedQuestionsCache((prev) => {
      const next = new Map(prev);
      questions.forEach((q) => {
        const id = getQuestionId(q);
        if (id !== null) {
          const title = q.question || q.question_text || q.title || q.prompt || 'Untitled Question';
          next.set(id, { id, title });
        }
      });
      return next;
    });
  };

  const assignableQuestions = useMemo(() => {
    return Array.from(selectedQuestionIds).map((id) => {
      return selectedQuestionsCache.get(id) || { id, title: `Question #${id}` };
    });
  }, [selectedQuestionIds, selectedQuestionsCache]);

  const hasActiveFilters = Boolean(
    debouncedSearch || selectedDifficulty !== 'all' || selectedTechnology !== 'all'
    || selectedClient !== 'all' || selectedFramework !== 'all' || selectedCloudPlatform !== 'all'
  );

  const techOptions = useMemo(
    () => [
      { value: 'all', label: 'All Technologies' },
      ...filterOptions.technology.map((tech) => ({
        value: tech.id ?? tech.name,
        label: tech.name,
      })),
    ],
    [filterOptions.technology]
  );

  const clientOptions = useMemo(
    () => [
      { value: 'all', label: 'All Clients' },
      ...filterOptions.client.map((c) => ({ value: c, label: c })),
    ],
    [filterOptions.client]
  );

  const frameworkOptions = useMemo(
    () => [
      { value: 'all', label: 'All Frameworks' },
      ...filterOptions.framework.map((f) => ({ value: f, label: f })),
    ],
    [filterOptions.framework]
  );

  const cloudOptions = useMemo(
    () => [
      { value: 'all', label: 'All Cloud Platforms' },
      ...filterOptions.cloudPlatform.map((cp) => ({ value: cp, label: cp })),
    ],
    [filterOptions.cloudPlatform]
  );

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedDifficulty('all');
    setSelectedTechnology('all');
    setSelectedClient('all');
    setSelectedFramework('all');
    setSelectedCloudPlatform('all');
    setCurrentPage(1);
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
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
                  onClick={() => {
                    setSelectedQuestionIds(new Set());
                    setSelectedQuestionsCache(new Map());
                  }}
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
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="qb-filters">
            <CustomSelect
              options={DIFFICULTY_OPTIONS}
              value={selectedDifficulty}
              onChange={(val) => {
                setSelectedDifficulty(val);
                setCurrentPage(1);
              }}
              placeholder="All Difficulties"
              ariaLabel="Filter by difficulty"
            />

            {filterOptions.technology.length > 0 && (
              <CustomSelect
                options={techOptions}
                value={selectedTechnology}
                onChange={(val) => {
                  setSelectedTechnology(val);
                  setCurrentPage(1);
                }}
                placeholder="All Technologies"
                ariaLabel="Filter by technology"
              />
            )}

            {filterOptions.client.length > 0 && (
              <CustomSelect
                options={clientOptions}
                value={selectedClient}
                onChange={(val) => {
                  setSelectedClient(val);
                  setCurrentPage(1);
                }}
                placeholder="All Clients"
                ariaLabel="Filter by client"
              />
            )}

            {filterOptions.framework.length > 0 && (
              <CustomSelect
                options={frameworkOptions}
                value={selectedFramework}
                onChange={(val) => {
                  setSelectedFramework(val);
                  setCurrentPage(1);
                }}
                placeholder="All Frameworks"
                ariaLabel="Filter by framework"
              />
            )}

            {filterOptions.cloudPlatform.length > 0 && (
              <CustomSelect
                options={cloudOptions}
                value={selectedCloudPlatform}
                onChange={(val) => {
                  setSelectedCloudPlatform(val);
                  setCurrentPage(1);
                }}
                placeholder="All Cloud Platforms"
                ariaLabel="Filter by cloud platform"
              />
            )}

            <span className="qb-count-badge">
              {totalRecords} {totalRecords === 1 ? 'question' : 'questions'}
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                className="qb-clear-selection"
                onClick={handleClearFilters}
                style={{ minHeight: '36px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                Clear filters
              </button>
            )}
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
            <button
              type="button"
              className="qb-btn-upload"
              onClick={() => {
                if (currentPage !== 1) setCurrentPage(1);
                refetch();
              }}
              disabled={isFetching}
            >
              {isFetching ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        ) : questions.length === 0 ? (
          <div className="qb-state-card qb-state-card--empty">
            <h2>{hasActiveFilters ? 'No matching questions found' : 'No questions in the bank yet'}</h2>
            <p>
              {hasActiveFilters
                ? 'Try adjusting your search keywords or clear filters to see more results.'
                : 'Questions added to the bank will appear here.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                className="qb-btn-upload"
                onClick={handleClearFilters}
                style={{ marginTop: '12px' }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="qb-card" style={{ opacity: isFetching ? 0.75 : 1, transition: 'opacity 0.15s ease' }}>
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
                  {questions.map((q, idx) => {
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
                              onChange={() => toggleQuestionSelection(q)}
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
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalRecords)} of {totalRecords}
                </span>
                <div className="qb-pagination-buttons">
                  <button
                    type="button"
                    className="qb-page-btn"
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    disabled={currentPage <= 1 || isFetching}
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
                    disabled={currentPage >= totalPages || isFetching}
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
            onAssigned={() => {
              setSelectedQuestionIds(new Set());
              setSelectedQuestionsCache(new Map());
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
