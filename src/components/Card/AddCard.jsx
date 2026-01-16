import { useState, useRef, useEffect } from 'react';
import { useBoardContext } from '../../context/BoardContext';
import './Card.css';

const AddCard = ({ listId }) => {
  const { addCard } = useBoardContext();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isAdding && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAdding]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim()) {
      try {
        await addCard(listId, title.trim());
        setTitle('');
        // Keep form open for adding more cards
      } catch (err) {
        console.error('Failed to add card:', err);
      }
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isAdding) {
    return (
      <button 
        className="add-card-btn"
        onClick={() => setIsAdding(true)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add a card
      </button>
    );
  }

  return (
    <form className="add-card-form" onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        className="add-card-textarea"
        placeholder="Enter a title for this card..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="add-card-actions">
        <button type="submit" className="add-card-submit">
          Add card
        </button>
        <button 
          type="button" 
          className="add-card-cancel"
          onClick={handleCancel}
        >
          ×
        </button>
      </div>
    </form>
  );
};

export default AddCard;
