import { useEffect, useState, useRef } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useBoardContext } from '../../context/BoardContext';
import { listApi, cardApi, boardApi } from '../../services/api';
import List from '../List/List';
import AddList from '../List/AddList';
import './Board.css';

const BOARD_COLORS = [
  { name: 'purple', color: 'linear-gradient(180deg, #8f63c5 0%, #a66ccf 40%, #c777d6 70%, #e07ac8 100%)' },
  { name: 'blue', color: 'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)' },
  { name: 'green', color: 'linear-gradient(135deg, #519839 0%, #7cb342 100%)' },
  { name: 'orange', color: 'linear-gradient(135deg, #d29034 0%, #e59866 100%)' },
  { name: 'red', color: 'linear-gradient(135deg, #b04632 0%, #cd6155 100%)' },
  { name: 'pink', color: 'linear-gradient(135deg, #cd5a91 0%, #e91e63 100%)' },
  { name: 'teal', color: 'linear-gradient(135deg, #00aecc 0%, #26c6da 100%)' },
  { name: 'lime', color: 'linear-gradient(135deg, #4bbf6b 0%, #00c853 100%)' },
  { name: 'violet', color: 'linear-gradient(135deg, #89609e 0%, #a569bd 100%)' },
  { name: 'gray', color: 'linear-gradient(135deg, #838c91 0%, #90a4ae 100%)' },
];

const Board = ({ boardId }) => {
  const { 
    board, 
    loading, 
    error, 
    fetchBoard, 
    fetchMembers,
    moveCard, 
    reorderLists,
    updateBoard
  } = useBoardContext();

  const [showMenu, setShowMenu] = useState(false);
  const [boardBackground, setBoardBackground] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId);
      fetchMembers();
    }
  }, [boardId, fetchBoard, fetchMembers]);

  useEffect(() => {
    if (board?.background) {
      setBoardBackground(board.background);
    }
  }, [board?.background]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBackgroundChange = async (background) => {
    setBoardBackground(background);
    setShowMenu(false);
    try {
      await boardApi.update(board.id, { background });
      if (updateBoard) {
        updateBoard({ background });
      }
    } catch (err) {
      console.error('Failed to update board background:', err);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, type, draggableId } = result;

    // Dropped outside a droppable
    if (!destination) return;
    
    // Dropped in the same place
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'LIST') {
      // Optimistically update UI
      reorderLists(source.index, destination.index);
      
      // Calculate new list order
      const newLists = [...board.lists];
      const [moved] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, moved);
      
      try {
        await listApi.reorder({
          boardId: board.id,
          listIds: newLists.map(l => l.id),
        });
      } catch (err) {
        console.error('Failed to reorder lists:', err);
        fetchBoard(boardId);
      }
    } else if (type === 'CARD') {
      const sourceListId = source.droppableId;
      const destListId = destination.droppableId;
      
      // Get the card being moved before the state update
      const sourceList = board.lists.find(l => l.id === sourceListId);
      if (!sourceList || !sourceList.cards) return;
      
      const movedCard = sourceList.cards[source.index];
      if (!movedCard) return;

      // Optimistically update UI
      moveCard(sourceListId, destListId, source.index, destination.index);
      
      // Calculate new card order for API call
      let newCardIds;
      if (sourceListId === destListId) {
        // Same list reorder
        const cards = [...sourceList.cards];
        const [removed] = cards.splice(source.index, 1);
        cards.splice(destination.index, 0, removed);
        newCardIds = cards.map(c => c.id);
      } else {
        // Cross-list move
        const destList = board.lists.find(l => l.id === destListId);
        const destCards = destList ? [...destList.cards] : [];
        destCards.splice(destination.index, 0, movedCard);
        newCardIds = destCards.map(c => c.id);
      }

      try {
        await cardApi.reorder({
          sourceListId,
          destinationListId: destListId,
          cardIds: newCardIds,
        });
      } catch (err) {
        console.error('Failed to reorder cards:', err);
        fetchBoard(boardId);
      }
    }
  };

  const currentBackground = boardBackground || board?.background || BOARD_COLORS[0].color;

  if (loading) {
    return (
      <div className="board-container" style={{ background: currentBackground }}>
        <div className="board-loading">
          <div className="loading-spinner" />
          <span>Loading board...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="board-container">
        <div className="board-error">
          <div className="error-message">
            <p>Failed to load board</p>
            <p>{error}</p>
          </div>
          <button className="retry-btn" onClick={() => fetchBoard(boardId)}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="board-container">
        <div className="board-error">
          <p>Board not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="board-container" style={{ background: currentBackground }}>
      <div className="board-header">
        <h1 className="board-title">{board.title}</h1>
        
        {/* Board Menu */}
        <div ref={menuRef} className="board-menu-container">
          <button 
            className="board-menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {showMenu && (
            <div className="board-menu">
              <div className="board-menu-header">
                <span>Board settings</span>
                <button className="board-menu-close" onClick={() => setShowMenu(false)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              
              <div className="board-menu-section">
                <div className="board-menu-section-title">Change background</div>
                <div className="board-color-grid">
                  {BOARD_COLORS.map((c) => (
                    <button
                      key={c.name}
                      className={`board-color-chip ${boardBackground === c.color ? 'active' : ''}`}
                      style={{ background: c.color }}
                      onClick={() => handleBackgroundChange(c.color)}
                      aria-label={c.name}
                      title={c.name}
                    />
                  ))}
                </div>
                
                {/* Custom Color Picker */}
                <div className="custom-color-picker">
                  <label htmlFor="board-color-input">Custom color:</label>
                  <input
                    type="color"
                    id="board-color-input"
                    onChange={(e) => handleBackgroundChange(e.target.value)}
                  />
                </div>
                
                <button className="board-remove-color" onClick={() => handleBackgroundChange(BOARD_COLORS[0].color)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Reset to default
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" type="LIST" direction="horizontal">
          {(provided) => (
            <div
              className="board-content"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {board.lists?.map((list, index) => (
                <List key={list.id} list={list} index={index} />
              ))}
              {provided.placeholder}
              <AddList />
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Board;
