import { useState, useRef, useEffect } from 'react';
import { useBoardContext } from '../../context/BoardContext';
import './Header.css';

const Header = ({ onCreateBoard }) => {
  const { 
    board, 
    members, 
    searchQuery, 
    setSearchQuery, 
    filters, 
    setFilters 
  } = useBoardContext();
  
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLabelFilter = (labelId) => {
    setFilters((prev) => ({
      ...prev,
      labels: prev.labels.includes(labelId)
        ? prev.labels.filter((id) => id !== labelId)
        : [...prev.labels, labelId],
    }));
  };

  const toggleMemberFilter = (memberId) => {
    setFilters((prev) => ({
      ...prev,
      members: prev.members.includes(memberId)
        ? prev.members.filter((id) => id !== memberId)
        : [...prev.members, memberId],
    }));
  };

  const setDueDateFilter = (value) => {
    setFilters((prev) => ({
      ...prev,
      dueDate: prev.dueDate === value ? null : value,
    }));
  };

  const clearFilters = () => {
    setFilters({ labels: [], members: [], dueDate: null });
    setSearchQuery('');
  };

  const hasActiveFilters = filters.labels.length > 0 || 
    filters.members.length > 0 || 
    filters.dueDate !== null ||
    searchQuery.length > 0;

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h8v14H3V3zm10 0h8v8h-8V3z" />
          </svg>
          Trello
        </div>
      </div>

      <div className="header-center">
        <div className="search-container">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Create Button */}
        <button className="create-btn" onClick={onCreateBoard}>
          Create 🎉
        </button>
      </div>

      <div className="header-right">
        <div ref={filterRef} style={{ position: 'relative' }}>
          <button 
            className={`header-btn filter-btn ${hasActiveFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter
            {hasActiveFilters && <span style={{ marginLeft: 4 }}>•</span>}
          </button>

          {showFilters && (
            <div className="filter-dropdown">
              <div className="filter-section">
                <div className="filter-title">Labels</div>
                <div className="filter-options">
                  {board?.labels?.map((label) => (
                    <button
                      key={label.id}
                      className={`filter-option ${filters.labels.includes(label.id) ? 'selected' : ''}`}
                      style={{ 
                        backgroundColor: filters.labels.includes(label.id) ? label.color : undefined,
                        borderLeft: `3px solid ${label.color}`,
                      }}
                      onClick={() => toggleLabelFilter(label.id)}
                    >
                      {label.name || 'No name'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <div className="filter-title">Members</div>
                <div className="filter-options">
                  {members.map((member) => (
                    <button
                      key={member.id}
                      className={`filter-option ${filters.members.includes(member.id) ? 'selected' : ''}`}
                      onClick={() => toggleMemberFilter(member.id)}
                    >
                      <span 
                        className="member-avatar-small" 
                        style={{ backgroundColor: member.color, marginRight: 4 }}
                      >
                        {member.initials}
                      </span>
                      {member.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <div className="filter-title">Due Date</div>
                <div className="filter-options">
                  {[
                    { value: 'overdue', label: 'Overdue' },
                    { value: 'today', label: 'Due Today' },
                    { value: 'week', label: 'Due This Week' },
                    { value: 'none', label: 'No Due Date' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      className={`filter-option ${filters.dueDate === option.value ? 'selected' : ''}`}
                      onClick={() => setDueDateFilter(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button className="clear-filters" onClick={clearFilters}>
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
