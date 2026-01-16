import './BottomNav.css';

const BottomNav = ({ onSwitchBoards, boardSwitcherOpen }) => {

  return (
    <nav className="bottom-nav">
      {/* Board Button */}
      <button 
        className={`bottom-nav-item ${!boardSwitcherOpen ? 'active' : ''}`}
        aria-label="Board"
      >
        <span className="nav-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="5" height="18" rx="1" />
            <rect x="10" y="3" width="5" height="12" rx="1" />
            <rect x="17" y="3" width="5" height="15" rx="1" />
          </svg>
        </span>
        Board
      </button>

      {/* Switch Boards Button */}
      <button 
        className={`bottom-nav-item ${boardSwitcherOpen ? 'active' : ''}`}
        onClick={onSwitchBoards}
        aria-label="Switch boards"
      >
        <span className="nav-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <rect 
              x="3" 
              y="5" 
              width="14" 
              height="14" 
              rx="2" 
              stroke="currentColor" 
              strokeWidth="2"
            />
            <path 
              d="M7 3H19C20.1046 3 21 3.89543 21 5V17" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </svg>
        </span>
        Switch boards
      </button>
    </nav>
  );
};

export default BottomNav;
