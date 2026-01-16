import { useState, useEffect, useRef } from 'react';
import './BoardSwitcher.css';

const BOARD_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)',
  'linear-gradient(135deg, #d29034 0%, #e59866 100%)',
  'linear-gradient(135deg, #519839 0%, #7cb342 100%)',
  'linear-gradient(135deg, #b04632 0%, #cd6155 100%)',
  'linear-gradient(135deg, #89609e 0%, #a569bd 100%)',
  'linear-gradient(135deg, #cd5a91 0%, #e91e63 100%)',
  'linear-gradient(135deg, #4bbf6b 0%, #00c853 100%)',
  'linear-gradient(135deg, #00aecc 0%, #26c6da 100%)',
  'linear-gradient(135deg, #838c91 0%, #90a4ae 100%)',
];

const BoardSwitcher = ({ 
  isOpen, 
  onClose, 
  boards, 
  activeBoardId, 
  onBoardSelect,
  onCreateBoard 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const searchRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredBoards = boards.filter(board => 
    board.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get recent boards (last 4 accessed - simulated with most recent)
  const recentBoards = boards.slice(0, 4);

  const handleBoardClick = (boardId) => {
    onBoardSelect(boardId);
    onClose();
  };

  const getBoardBackground = (board, index) => {
    if (board.background) {
      if (board.background.startsWith('#')) {
        return board.background;
      }
      return board.background;
    }
    return BOARD_COLORS[index % BOARD_COLORS.length];
  };

  return (
    <div className="board-switcher-overlay">
      <div className="board-switcher" ref={modalRef}>
        <div className="board-switcher-header">
          <div className="board-switcher-search">
            <svg className="board-switcher-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search your boards"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="board-switcher-tabs">
            <button 
              className={`board-switcher-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={`board-switcher-tab ${activeTab === 'workspace' ? 'active' : ''}`}
              onClick={() => setActiveTab('workspace')}
            >
              My Workspace
            </button>
          </div>
        </div>

        <div className="board-switcher-content">
          {filteredBoards.length > 0 ? (
            <>
              {/* Recent Boards */}
              {!searchQuery && (
                <div className="board-switcher-section">
                  <div className="board-switcher-section-header">
                    <svg className="board-switcher-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="board-switcher-section-title">Recent</span>
                  </div>
                  <div className="board-switcher-grid">
                    {recentBoards.map((board, index) => (
                      <button
                        key={board.id}
                        className={`board-switcher-card ${board.id === activeBoardId ? 'active' : ''}`}
                        onClick={() => handleBoardClick(board.id)}
                      >
                        <div 
                          className="board-switcher-card-preview"
                          style={{ background: getBoardBackground(board, index) }}
                        />
                        <div className="board-switcher-card-title">
                          {board.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Boards / Workspace Boards */}
              <div className="board-switcher-section">
                <div className="board-switcher-section-header">
                  <svg className="board-switcher-section-icon" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <span className="board-switcher-section-title">
                    {searchQuery ? 'Search Results' : 'Your Boards'}
                  </span>
                </div>
                <div className="board-switcher-grid">
                  {filteredBoards.map((board, index) => (
                    <button
                      key={board.id}
                      className={`board-switcher-card ${board.id === activeBoardId ? 'active' : ''}`}
                      onClick={() => handleBoardClick(board.id)}
                    >
                      <div 
                        className="board-switcher-card-preview"
                        style={{ background: getBoardBackground(board, index) }}
                      />
                      <div className="board-switcher-card-title">
                        {board.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Create Board Button */}
              <button className="board-switcher-create" onClick={onCreateBoard}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create new board
              </button>
            </>
          ) : (
            <div className="board-switcher-empty">
              No boards match "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardSwitcher;
