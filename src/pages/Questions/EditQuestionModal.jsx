import { useState, useEffect } from 'react';
import { useUpdateQuestionMutation } from '../../features/questions/questionBankApi';
import { getApiErrorMessage } from '../../features/auth/authApi';
import './Questions.css';

const DEFAULT_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const FALLBACK_TECHNOLOGIES = [
  { id: 1, name: 'Python' },
  { id: 2, name: 'Java' },
  { id: 3, name: 'JavaScript' },
  { id: 4, name: 'React' },
  { id: 5, name: 'DevOps' },
  { id: 6, name: 'QA' },
  { id: 7, name: 'Data' },
];

export default function EditQuestionModal({
  isOpen,
  onClose,
  question,
  availableTechnologies = [],
  onSuccess,
}) {
  const [updateQuestion, { isLoading }] = useUpdateQuestionMutation();

  const [formData, setFormData] = useState({
    question: '',
    technology_id: 1,
    client_name: '',
    difficulty: 'Easy',
    framework: '',
    cloud_platform: '',
    rating: 0,
  });

  const [errorMsg, setErrorMsg] = useState('');

  // Merge available technologies with fallback list
  const techList = (() => {
    const map = new Map();
    // Add known fallbacks first
    FALLBACK_TECHNOLOGIES.forEach((t) => map.set(String(t.id), t));
    // Overlay any passed from the parent
    availableTechnologies.forEach((t) => {
      const id = t.id ?? t.technology_id;
      if (id != null) {
        map.set(String(id), { id: Number(id), name: t.name || t.technology_name || `Tech ${id}` });
      }
    });
    // If the question has a tech ID not in the map, add it
    if (question) {
      const qTechId = question.technology_id ?? question.tech_id;
      const qTechName = question.technology_name || question.technology || question.category;
      if (qTechId != null && !map.has(String(qTechId))) {
        map.set(String(qTechId), { id: Number(qTechId), name: qTechName || `Tech ${qTechId}` });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  })();

  useEffect(() => {
    if (question && isOpen) {
      const qTechId = question.technology_id ?? question.tech_id;
      const initialTechId = qTechId != null ? Number(qTechId) : (techList[0]?.id || 1);

      // Normalize difficulty to Title Case
      let diff = question.difficulty || 'Medium';
      if (String(diff).toLowerCase().includes('easy')) diff = 'Easy';
      else if (String(diff).toLowerCase().includes('hard')) diff = 'Hard';
      else diff = 'Medium';

      setFormData({
        question: question.question || question.question_text || question.title || '',
        technology_id: initialTechId,
        client_name: question.client_name || question.client || '',
        difficulty: diff,
        framework: question.framework && question.framework !== 'nan' ? question.framework : '',
        cloud_platform: question.cloud_platform || question.cloud || '',
        rating: question.rating != null && question.rating !== '—' ? Number(question.rating) : 0,
      });
      setErrorMsg('');
    }
  }, [question, isOpen]);

  if (!isOpen || !question) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'technology_id' || name === 'rating' ? Number(value) : value,
    }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      setErrorMsg('Question text is required.');
      return;
    }

    setErrorMsg('');

    try {
      const questionId = question.question_id ?? question.id ?? question._id;
      await updateQuestion({
        question_id: Number(questionId),
        technology_id: Number(formData.technology_id) || 0,
        client_name: formData.client_name.trim(),
        difficulty: formData.difficulty,
        framework: formData.framework.trim(),
        cloud_platform: formData.cloud_platform.trim(),
        question: formData.question.trim(),
        rating: Number(formData.rating) || 0,
      }).unwrap();

      onSuccess?.('Question updated successfully.');
      onClose();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    }
  };

  const questionId = question.question_id ?? question.id ?? question._id;

  return (
    <div
      className="upload-modal-overlay"
      onClick={() => !isLoading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-question-title"
    >
      <div className="upload-modal qb-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-modal__header">
          <div className="upload-modal__title-group">
            <h2 id="edit-question-title">Edit Question</h2>
            <p>Update question details and metadata</p>
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

        <form onSubmit={handleSubmit}>
          <div className="upload-modal__body" style={{ gap: '1rem', maxHeight: '70vh', overflowY: 'auto' }}>
            {errorMsg && (
              <div className="upload-alert upload-alert--error" role="alert">
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Question Text */}
            <div className="qb-form-field">
              <label htmlFor="edit-question-text" className="qb-form-label">
                Question Text <span className="qb-required">*</span>
              </label>
              <textarea
                id="edit-question-text"
                name="question"
                rows={4}
                className="qb-form-textarea"
                placeholder="Enter question text..."
                value={formData.question}
                onChange={handleChange}
                required
              />
            </div>

            {/* Two Column Grid */}
            <div className="qb-form-grid">
              {/* Technology Dropdown */}
              <div className="qb-form-field">
                <label htmlFor="edit-tech-id" className="qb-form-label">
                  Technology <span className="qb-required">*</span>
                </label>
                <select
                  id="edit-tech-id"
                  name="technology_id"
                  className="qb-form-select"
                  value={formData.technology_id}
                  onChange={handleChange}
                >
                  {techList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Dropdown */}
              <div className="qb-form-field">
                <label htmlFor="edit-difficulty" className="qb-form-label">
                  Difficulty <span className="qb-required">*</span>
                </label>
                <select
                  id="edit-difficulty"
                  name="difficulty"
                  className="qb-form-select"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  {DEFAULT_DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Name */}
              <div className="qb-form-field">
                <label htmlFor="edit-client" className="qb-form-label">Client Name</label>
                <input
                  type="text"
                  id="edit-client"
                  name="client_name"
                  className="qb-form-input"
                  placeholder="e.g. TCS, Infosys, Amazon"
                  value={formData.client_name}
                  onChange={handleChange}
                />
              </div>

              {/* Framework */}
              <div className="qb-form-field">
                <label htmlFor="edit-framework" className="qb-form-label">Framework</label>
                <input
                  type="text"
                  id="edit-framework"
                  name="framework"
                  className="qb-form-input"
                  placeholder="e.g. FastAPI, Spring Boot, React"
                  value={formData.framework}
                  onChange={handleChange}
                />
              </div>

              {/* Cloud Platform */}
              <div className="qb-form-field">
                <label htmlFor="edit-cloud" className="qb-form-label">Cloud Platform</label>
                <input
                  type="text"
                  id="edit-cloud"
                  name="cloud_platform"
                  className="qb-form-input"
                  placeholder="e.g. AWS, Azure, GCP"
                  value={formData.cloud_platform}
                  onChange={handleChange}
                />
              </div>

              {/* Rating */}
              <div className="qb-form-field">
                <label htmlFor="edit-rating" className="qb-form-label">Rating (0 - 5)</label>
                <input
                  type="number"
                  id="edit-rating"
                  name="rating"
                  min="0"
                  max="5"
                  step="1"
                  className="qb-form-input"
                  value={formData.rating}
                  onChange={handleChange}
                />
              </div>
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
              type="submit"
              className="upload-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="upload-spinner" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
