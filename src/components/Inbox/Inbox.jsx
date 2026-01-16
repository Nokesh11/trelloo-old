import { useState } from 'react';
import './Inbox.css';

const Inbox = ({ isOpen, onClose }) => {
  const [newCardTitle, setNewCardTitle] = useState('');

  // Sample inbox items (in a real app, these would come from API)
  const inboxItems = [
    { id: 1, title: 'Review project requirements', board: 'Project Alpha', time: '2 hours ago' },
    { id: 2, title: 'Update documentation', board: 'Marketing Campaign', time: '5 hours ago' },
    { id: 3, title: 'Team meeting notes', board: 'Personal Tasks', time: 'Yesterday' },
  ];

  const handleAddCard = (e) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      // In a real app, this would add a card to the inbox
      console.log('Adding card:', newCardTitle);
      setNewCardTitle('');
    }
  };

  return (
    <div className={`inbox-panel ${isOpen ? 'open' : ''}`}>
      <div className="inbox-header">
        <span className="inbox-title">Inbox</span>
        <button className="inbox-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="inbox-content">
        {/* Add a card section */}
        <div className="inbox-add-card">
          <label className="inbox-add-card-label">Add a card</label>
          <form onSubmit={handleAddCard}>
            <input
              type="text"
              className="inbox-add-card-input"
              placeholder="Enter a title for this card..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
            />
          </form>
        </div>

        {/* Inbox items */}
        {inboxItems.length > 0 ? (
          <div className="inbox-section">
            <div className="inbox-section-title">Recent</div>
            <div className="inbox-items">
              {inboxItems.map((item) => (
                <div key={item.id} className="inbox-item">
                  <svg className="inbox-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                  </svg>
                  <div className="inbox-item-content">
                    <div className="inbox-item-title">{item.title}</div>
                    <div className="inbox-item-meta">
                      {item.board} • {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="inbox-empty">
            <svg className="inbox-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 12H16L14 15H10L8 12H2" />
              <path d="M5.45 5.11L2 12V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V12L18.55 5.11C18.3844 4.77679 18.1292 4.49637 17.813 4.30028C17.4967 4.10419 17.1321 4.0002 16.76 4H7.24C6.86792 4.0002 6.50326 4.10419 6.18704 4.30028C5.87083 4.49637 5.61558 4.77679 5.45 5.11Z" />
            </svg>
            <div className="inbox-empty-title">Your inbox is empty</div>
            <div className="inbox-empty-text">Cards you add will appear here</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
