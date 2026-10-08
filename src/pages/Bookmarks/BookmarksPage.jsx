/**
 * src/pages/Bookmarks/BookmarksPage.jsx
 * Dedicated Bookmarks page for QuestionHub.
 * Allows administrators and employees to review and organize bookmarked questions.
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { useBookmarks } from '../../utils/bookmarkStorage';
import '../Questions/Questions.css';
import '../Dashboard/Dashboard.css';

function BookmarkRibbonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function getDiffTone(diff) {
  if (!diff) return 'default';
  const d = String(diff).toLowerCase();
  if (d.includes('easy')) return 'easy';
  if (d.includes('med')) return 'medium';
  if (d.includes('hard')) return 'hard';
  return 'default';
}

export default function BookmarksPage() {
  const { bookmarks, bookmarkCount, removeBookmark, clearAllBookmarks } = useBookmarks();
  const [search, setSearch] = useState('');
  const [selectedTech, setSelectedTech] = useState('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const availableTechs = useMemo(() => {
    const set = new Set();
    bookmarks.forEach((b) => {
      if (b.technology) set.add(b.technology);
    });
    return Array.from(set).sort();
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      const matchesSearch = !search || (
        b.question?.toLowerCase().includes(search.toLowerCase()) ||
        b.technology?.toLowerCase().includes(search.toLowerCase()) ||
        b.client?.toLowerCase().includes(search.toLowerCase())
      );
      const matchesTech = selectedTech === 'all' || b.technology === selectedTech;
      return matchesSearch && matchesTech;
    });
  }, [bookmarks, search, selectedTech]);

  return (
    <DashboardLayout title="Bookmarks" eyebrow="Revision Deck">
      <div className="dash-wrapper">
        <div className="dash-clean-card">
          <div className="dash-card-header">
            <div>
              <h2 className="dash-card-title">
                Saved Questions
                <span className="dash-counter-pill">{bookmarkCount}</span>
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/questions" className="dash-secondary-btn">
                Browse Question Bank &rarr;
              </Link>
              {bookmarkCount > 0 && (
                confirmClear ? (
                  <div className="dash-confirm-bar">
                    <span>Clear all?</span>
                    <button
                      type="button"
                      className="dash-confirm-yes"
                      onClick={() => { clearAllBookmarks(); setConfirmClear(false); }}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className="dash-confirm-no"
                      onClick={() => setConfirmClear(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="dash-clear-link"
                    onClick={() => setConfirmClear(true)}
                  >
                    Clear All
                  </button>
                )
              )}
            </div>
          </div>

          {bookmarkCount > 0 && (
            <div className="dash-filter-bar" style={{ marginTop: '12px', marginBottom: '16px' }}>
              <div className="dash-search-box" style={{ maxWidth: '340px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search bookmarked questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search bookmarked questions"
                />
                {search && (
                  <button
                    type="button"
                    className="dash-clear-btn"
                    onClick={() => setSearch('')}
                  >
                    &times;
                  </button>
                )}
              </div>

              {availableTechs.length > 1 && (
                <select
                  className="dash-select-input"
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                >
                  <option value="all">All Technologies ({bookmarkCount})</option>
                  {availableTechs.map((tech) => (
                    <option key={tech} value={tech}>
                      {tech}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {bookmarkCount === 0 ? (
            <div className="dash-bookmarks-empty" style={{ padding: '48px 20px' }}>
              <div className="dash-empty-ribbon">
                <BookmarkRibbonIcon />
              </div>
              <h4>No Bookmarked Questions Yet</h4>
              <p>
                Click the bookmark ribbon 🔖 beside any question in the Question Bank
                to add it to your high-yield revision deck.
              </p>
              <Link to="/questions" className="dash-primary-btn" style={{ marginTop: '8px' }}>
                Open Question Bank
              </Link>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="dash-no-match" style={{ padding: '36px 20px' }}>
              <p>No questions match your current filter.</p>
              <button
                type="button"
                className="dash-secondary-btn"
                onClick={() => { setSearch(''); setSelectedTech('all'); }}
                style={{ marginTop: '8px' }}
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="dash-bookmarks-stack" style={{ gap: '10px' }}>
              {filteredBookmarks.map((item, index) => {
                const diffTone = getDiffTone(item.difficulty);
                return (
                  <article className="dash-bookmark-row" key={item.id} style={{ padding: '14px 16px' }}>
                    <div className="dash-bookmark-row__info">
                      <div className="dash-bookmark-tags">
                        <span style={{ fontSize: '0.75rem', fontWeight: '750', color: '#64748b', marginRight: '6px' }}>
                          #{index + 1}
                        </span>
                        <span className="dash-tech-pill">{item.technology}</span>
                        <span className={`qb-diff-badge qb-diff-badge--${diffTone}`}>
                          {item.difficulty}
                        </span>
                        {item.client && (
                          <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                            {item.client}
                          </span>
                        )}
                      </div>
                      <p className="dash-bookmark-title" style={{ fontSize: '0.92rem', marginTop: '4px' }}>
                        {item.question}
                      </p>
                    </div>

                    <div className="dash-bookmark-row__actions" style={{ gap: '8px' }}>
                      <Link
                        to="/questions"
                        className="dash-action-btn-link"
                        title="View in Question Bank"
                      >
                        View in Bank
                      </Link>
                      <button
                        type="button"
                        className="dash-action-btn-trash"
                        onClick={() => removeBookmark(item.id)}
                        title="Remove bookmark"
                        aria-label="Remove bookmark"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
