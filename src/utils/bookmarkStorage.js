/**
 * src/utils/bookmarkStorage.js
 * Centralized client-side bookmark manager for QuestionHub.
 * Keeps bookmarks persistently synced across components and storage tabs.
 */
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'questionhub_bookmarks';
const UPDATE_EVENT = 'questionhub:bookmarks-updated';

export function getBookmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read bookmarks from localStorage:', err);
    return [];
  }
}

export function saveBookmarks(bookmarks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: bookmarks }));
  } catch (err) {
    console.error('Failed to save bookmarks to localStorage:', err);
  }
}

export function getQuestionId(question) {
  if (!question) return null;
  const id = typeof question === 'object' 
    ? (question.question_id ?? question.id ?? question._id)
    : question;
  if (id == null || id === '') return null;
  const num = Number(id);
  return Number.isInteger(num) ? num : String(id);
}

export function isBookmarked(questionOrId) {
  const targetId = getQuestionId(questionOrId);
  if (targetId == null) return false;
  const bookmarks = getBookmarks();
  return bookmarks.some((b) => String(b.id) === String(targetId));
}

export function toggleBookmark(question) {
  const targetId = getQuestionId(question);
  if (targetId == null) return false;

  const current = getBookmarks();
  const exists = current.some((b) => String(b.id) === String(targetId));

  let updated;
  if (exists) {
    updated = current.filter((b) => String(b.id) !== String(targetId));
  } else {
    const text = question.question 
      || question.question_text 
      || question.title 
      || question.prompt 
      || `Question #${targetId}`;

    const tech = question.technology_name 
      || question.technology 
      || question.tech_stack 
      || question.category 
      || 'General';

    const diff = question.difficulty 
      || question.difficulty_level 
      || question.level 
      || 'Medium';

    const bookmarkItem = {
      id: targetId,
      question: text,
      technology: tech,
      difficulty: diff,
      client: question.client_name || question.client || null,
      framework: question.framework && String(question.framework).toLowerCase() !== 'nan' ? question.framework : null,
      cloudPlatform: question.cloud_platform || question.cloud || null,
      addedAt: new Date().toISOString(),
    };
    updated = [bookmarkItem, ...current];
  }

  saveBookmarks(updated);
  return !exists;
}

export function removeBookmark(questionOrId) {
  const targetId = getQuestionId(questionOrId);
  if (targetId == null) return;
  const current = getBookmarks();
  const updated = current.filter((b) => String(b.id) !== String(targetId));
  saveBookmarks(updated);
}

export function clearAllBookmarks() {
  saveBookmarks([]);
}

/**
 * React hook to access and observe bookmarked questions.
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(getBookmarks);

  useEffect(() => {
    const handleUpdate = () => {
      setBookmarks(getBookmarks());
    };

    window.addEventListener(UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleToggle = useCallback((question) => {
    return toggleBookmark(question);
  }, []);

  const handleRemove = useCallback((questionOrId) => {
    removeBookmark(questionOrId);
  }, []);

  const checkIsBookmarked = useCallback((questionOrId) => {
    const targetId = getQuestionId(questionOrId);
    if (targetId == null) return false;
    return bookmarks.some((b) => String(b.id) === String(targetId));
  }, [bookmarks]);

  return {
    bookmarks,
    bookmarkCount: bookmarks.length,
    isBookmarked: checkIsBookmarked,
    toggleBookmark: handleToggle,
    removeBookmark: handleRemove,
    clearAllBookmarks,
  };
}
