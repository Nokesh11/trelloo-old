import { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ 
  boards, 
  activeBoardId, 
  onBoardSelect, 
  onCreateBoard,
  isOpen,
  onToggle 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <button 
        className={`sidebar-toggle ${isOpen ? 'hidden' : ''}`}
        onClick={onToggle}
        title={isOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isOpen ? (
            <polyline points="15 18 9 12 15 6" />
          ) : (
            <polyline points="9 18 15 12 9 6" />
          )}
        </svg>
      </button>

      <div className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <input
            type="text"
            className="sidebar-search"
            placeholder="Search boards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <div 
              className="sidebar-section-header"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span className="sidebar-section-title">Your Boards</span>
              <button className="sidebar-section-toggle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isExpanded ? (
                    <polyline points="6 9 12 15 18 9" />
                  ) : (
                    <polyline points="9 18 15 12 9 6" />
                  )}
                </svg>
              </button>
            </div>

            {isExpanded && (
              <div className="sidebar-boards">
                {filteredBoards.map((board) => (
                  <div
                    key={board.id}
                    className={`sidebar-board-item ${board.id === activeBoardId ? 'active' : ''}`}
                    onClick={() => onBoardSelect(board.id)}
                  >
                    <div 
                      className="sidebar-board-thumbnail"
                      style={{ background: board.background || '#0079bf' }}
                    />
                    <span className="sidebar-board-title">{board.title}</span>
                  </div>
                ))}

                <button 
                  className="sidebar-create-btn"
                  onClick={onCreateBoard}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create new board
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
