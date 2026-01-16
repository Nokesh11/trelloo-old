import { useState, useEffect, useRef } from 'react';
import './CreateBoardModal.css';

const BACKGROUND_COLORS = [
  '#0079bf', // Blue
  '#d29034', // Orange
  '#519839', // Green
  '#b04632', // Red
  '#89609e', // Purple
  '#cd5a91', // Pink
  '#4bbf6b', // Lime
  '#00aecc', // Cyan
  '#838c91', // Grey
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Gradient
];

const CreateBoardModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [background, setBackground] = useState(BACKGROUND_COLORS[0]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Board title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onCreate({ title: title.trim(), background });
      setTitle('');
      setBackground(BACKGROUND_COLORS[0]);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create board');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-board-modal-overlay">
      <div className="create-board-modal" ref={modalRef}>
        <div className="create-board-modal-header">
          <span className="create-board-modal-title">Create board</span>
          <button className="create-board-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="create-board-modal-content">
          {/* Board Preview */}
          <div 
            className="board-preview"
            style={{ background }}
          >
            {title && (
              <span className="board-preview-title">{title}</span>
            )}
          </div>

          {/* Background Selection */}
          <div className="background-section">
            <label className="background-label">Background</label>
            <div className="background-grid">
              {BACKGROUND_COLORS.map((color, index) => (
                <button
                  key={index}
                  className={`background-option ${background === color ? 'selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => setBackground(color)}
                  type="button"
                />
              ))}
            </div>
          </div>

          {/* Board Title */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Board title <span className="required">*</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter board title"
              />
              {error && (
                <div className="form-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2" />
                    <circle cx="12" cy="16" r="1" fill="white" />
                  </svg>
                  {error}
                </div>
              )}
            </div>

            <div className="create-board-actions">
              <button 
                type="submit" 
                className="create-btn"
                disabled={!title.trim() || isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBoardModal;
