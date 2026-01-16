import { useState, useRef, useEffect } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { useBoardContext } from '../../context/BoardContext';
import Card from '../Card/Card';
import AddCard from '../Card/AddCard';
import './List.css';

const LIST_COLORS = [
  { name: 'green', color: '#4BCE97' },
  { name: 'yellow', color: '#F5CD47' },
  { name: 'orange', color: '#FCA700' },
  { name: 'red', color: '#F87168' },
  { name: 'purple', color: '#C97CF4' },
  { name: 'blue', color: '#669DF1' },
  { name: 'teal', color: '#6CC3E0' },
  { name: 'lime', color: '#94C748' },
  { name: 'magenta', color: '#E774BB' },
  { name: 'gray', color: '#8C8F97' },
];

const List = ({ list, index }) => {
  const { updateList, deleteList, getFilteredCards } = useBoardContext();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);
  const [listColor, setListColor] = useState(list.color || null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSubmit = async () => {
    if (title.trim() && title !== list.title) {
      await updateList(list.id, { title: title.trim() });
    } else {
      setTitle(list.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitle(list.title);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this list and all its cards?')) {
      await deleteList(list.id);
    }
    setShowMenu(false);
  };

  const handleColorChange = async (color) => {
    setListColor(color);
    // Update list in backend if needed
    try {
      await updateList(list.id, { color });
    } catch (err) {
      console.error('Failed to update list color:', err);
    }
  };

  const handleRemoveColor = async () => {
    setListColor(null);
    try {
      await updateList(list.id, { color: null });
    } catch (err) {
      console.error('Failed to remove list color:', err);
    }
  };

  const filteredCards = getFilteredCards(list.cards || []);

  // Get background color for list
  const getListBackground = () => {
    if (listColor) {
      return listColor;
    }
    return '#f1f2f4'; // Default grey
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`list ${snapshot.isDragging ? 'dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            backgroundColor: getListBackground(),
          }}
        >
          <div className="list-header" {...provided.dragHandleProps}>
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                className="list-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <h3 
                className="list-title" 
                onClick={() => setIsEditing(true)}
              >
                {list.title}
              </h3>
            )}

            <div ref={menuRef} style={{ position: 'relative' }}>
              <button 
                className="list-menu-btn"
                onClick={() => setShowMenu(!showMenu)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>

              {showMenu && (
                <div className="list-menu">
                  <div className="list-menu-header">
                    <span>List actions</span>
                    <button className="list-menu-close" onClick={() => setShowMenu(false)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Color Picker Section */}
                  <div className="list-menu-section">
                    <div className="list-menu-section-title">Change list color</div>
                    <div className="list-color-grid">
                      {LIST_COLORS.map((c) => (
                        <button
                          key={c.name}
                          className={`list-color-chip ${listColor === c.color ? 'active' : ''}`}
                          style={{ backgroundColor: c.color }}
                          onClick={() => handleColorChange(c.color)}
                          aria-label={c.name}
                          title={c.name}
                        />
                      ))}
                    </div>
                    
                    {/* Custom Color Picker */}
                    <div className="custom-color-picker">
                      <label htmlFor="list-color-input">Custom color:</label>
                      <input
                        type="color"
                        id="list-color-input"
                        onChange={(e) => handleColorChange(e.target.value)}
                      />
                    </div>
                    
                    <button className="list-remove-color" onClick={handleRemoveColor}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Remove color
                    </button>
                  </div>

                  <div className="list-menu-divider" />

                  {/* Delete List */}
                  <button 
                    className="list-menu-item danger"
                    onClick={handleDelete}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete list
                  </button>
                </div>
              )}
            </div>
          </div>

          <Droppable droppableId={list.id} type="CARD">
            {(dropProvided, dropSnapshot) => (
              <div
                className="list-cards"
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                style={{
                  background: dropSnapshot.isDraggingOver ? 'rgba(9, 30, 66, 0.04)' : 'transparent',
                }}
              >
                {filteredCards.map((card, cardIndex) => (
                  <Card key={card.id} card={card} index={cardIndex} />
                ))}
                {dropProvided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="list-footer">
            <AddCard listId={list.id} />
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default List;
