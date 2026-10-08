/**
 * src/pages/Dashboard/components/BookmarkHub.jsx
 * Professional Bookmarks Hub & Rapid Review Panel.
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBookmarks } from '../../../utils/bookmarkStorage';

function BookmarkRibbonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrashSmallIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

export default function BookmarkHub() {
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
        b.technology?.toLowerCase().includes(search.toLowerCase())
      );
      const matchesTech = selectedTech === 'all' || b.technology === selectedTech;
      return matchesSearch && matchesTech;
    });
  }, [bookmarks, search, selectedTech]);

  return (
    <div className="dash-clean-card dash-bookmarks-panel">
      <div className="dash-card-header">
        <div>
          <div className="dash-card-eyebrow">
            <span className="dash-indicator-dot dash-indicator-dot--amber" />
            <span>Revision Deck</span>
          </div>
          <h2 className="dash-card-title">
            Bookmarked Questions
            <span className="dash-counter-pill">{bookmarkCount}</span>
          </h2>
          <p className="dash-card-subtitle">
            Curate and spotlight tricky or high-priority interview problems
          </p>
        </div>

        <Link to="/questions" className="dash-link-btn">
          Question Bank &rarr;
        </Link>
      </div>

      {/* Search and Tech Filter Controls */}
      {bookmarkCount > 0 && (
        <div className="dash-filter-bar">
          <div className="dash-search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search saved questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search saved questions"
            />
            {search && (
              <button
                type="button"
                className="dash-clear-btn"
                onClick={() => setSearch('')}
                aria-label="Clear filter"
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
              aria-label="Filter by technology"
            >
              <option value="all">All Tracks ({bookmarkCount})</option>
              {availableTechs.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Bookmarks List Container */}
      <div className="dash-bookmarks-list-box">
        {bookmarkCount === 0 ? (
          <div className="dash-bookmarks-empty">
            <div className="dash-empty-ribbon">
              <BookmarkRibbonIcon />
            </div>
            <h4>No Bookmarked Questions Yet</h4>
            <p>
              Click the bookmark ribbon 🔖 beside any question in the Question Bank
              to add it to your quick review deck.
            </p>
            <Link to="/questions" className="dash-btn-teal-sm">
              Explore Question Bank
            </Link>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="dash-no-match">
            <p>No questions match your filter.</p>
            <button
              type="button"
              className="dash-reset-btn"
              onClick={() => { setSearch(''); setSelectedTech('all'); }}
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="dash-bookmarks-stack">
            {filteredBookmarks.slice(0, 5).map((item) => {
              const diffTone = getDiffTone(item.difficulty);
              return (
                <article className="dash-bookmark-row" key={item.id}>
                  <div className="dash-bookmark-row__info">
                    <div className="dash-bookmark-tags">
                      <span className="dash-tech-pill">{item.technology}</span>
                      <span className={`qb-diff-badge qb-diff-badge--${diffTone}`}>
                        {item.difficulty}
                      </span>
                    </div>
                    <p className="dash-bookmark-title">{item.question}</p>
                  </div>

                  <div className="dash-bookmark-row__actions">
                    <Link
                      to="/questions"
                      className="dash-action-btn-link"
                      title="View in Question Bank"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      className="dash-action-btn-trash"
                      onClick={() => removeBookmark(item.id)}
                      title="Remove bookmark"
                      aria-label="Remove bookmark"
                    >
                      <TrashSmallIcon />
                    </button>
                  </div>
                </article>
              );
            })}
            {filteredBookmarks.length > 5 && (
              <div className="dash-more-notice">
                <span>+ {filteredBookmarks.length - 5} more bookmarked items</span>
                <Link to="/questions">Review All in Bank &rarr;</Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Breakdown & Clear Action */}
      {bookmarkCount > 0 && (
        <div className="dash-bookmarks-footer">
          <div className="dash-footer-chips">
            {availableTechs.slice(0, 4).map((tech) => {
              const count = bookmarks.filter((b) => b.technology === tech).length;
              return (
                <span className="dash-mini-chip" key={tech}>
                  {tech}: <strong>{count}</strong>
                </span>
              );
            })}
          </div>

          <div>
            {confirmClear ? (
              <div className="dash-confirm-bar">
                <span>Confirm clear?</span>
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
                Clear Deck
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
