import { useState, useRef, useEffect } from 'react';
import { useBoardContext } from '../../context/BoardContext';
import './List.css';

const AddList = () => {
  const { addList } = useBoardContext();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim()) {
      try {
        await addList(title.trim());
        setTitle('');
        // Keep form open for adding more lists
      } catch (err) {
        console.error('Failed to add list:', err);
      }
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isAdding) {
    return (
      <div className="add-list">
        <button 
          className="add-list-btn green"
          onClick={() => setIsAdding(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add another list
        </button>
      </div>
    );
  }

  return (
    <div className="add-list">
      <form className="add-list-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="add-list-input"
          placeholder="Enter list title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="add-list-actions">
          <button type="submit" className="add-list-submit">
            Add list
          </button>
          <button 
            type="button" 
            className="add-list-cancel"
            onClick={handleCancel}
          >
            ×
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddList;
