import { useState, useRef, useEffect, useCallback, useId } from 'react';
import './CustomSelect.css';

/**
 * CustomSelect Component
 * A modern, accessible, custom-styled dropdown filter adhering to UI standards.
 * 
 * Features:
 * - WAI-ARIA accessible (combobox/listbox pattern)
 * - Full keyboard navigation (Arrow Up/Down, Enter, Space, Escape, Tab)
 * - Click-outside dismiss
 * - Selected state with subtle checkmark indicator
 * - Rotating chevron animation
 * - Active filter highlight state
 */
export default function CustomSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select option',
  ariaLabel,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const listboxId = useId();

  // Find currently selected option
  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const hasValue = value !== '' && value !== 'all' && value !== undefined && value !== null;

  // Handle outside click to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sync highlighted index when opened
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex((opt) => String(opt.value) === String(value));
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, options, value]);

  const handleSelect = useCallback(
    (optValue) => {
      if (onChange) {
        onChange(optValue);
      }
      setIsOpen(false);
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    },
    [onChange]
  );

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
      return;
    }

    if (e.key === 'Tab') {
      if (isOpen) {
        setIsOpen(false);
      }
      return;
    }

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        handleSelect(options[highlightedIndex].value);
      }
    }
  };

  return (
    <div
      className={`custom-select-container ${className}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`custom-select-trigger ${isOpen ? 'is-open' : ''} ${hasValue ? 'has-value' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel || displayLabel}
      >
        <span className="custom-select-label">{displayLabel}</span>
        <svg
          className="custom-select-chevron"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 8 10 12 14 8" />
        </svg>
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          className="custom-select-menu"
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel || 'Options list'}
        >
          {options.map((opt, index) => {
            const isSelected = String(opt.value) === String(value);
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={opt.value ?? index}
                id={`${listboxId}-opt-${index}`}
                role="option"
                aria-selected={isSelected}
                className={`custom-select-option ${isSelected ? 'is-selected' : ''} ${
                  isHighlighted ? 'is-highlighted' : ''
                }`}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg
                    className="custom-select-check"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="4 10 8 14 16 6" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
