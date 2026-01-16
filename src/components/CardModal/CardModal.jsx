import { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { useBoardContext } from '../../context/BoardContext';
import { cardApi, checklistApi } from '../../services/api';
import './CardModal.css';

const CardModal = ({ card, onClose }) => {
  const { board, members, updateCardInBoard, deleteCard } = useBoardContext();
  const [cardData, setCardData] = useState(card);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showLabelsPopover, setShowLabelsPopover] = useState(false);
  const [showMembersPopover, setShowMembersPopover] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('Checklist');
  const modalRef = useRef(null);
  const titleRef = useRef(null);

  // Find the list this card belongs to
  const listName = board?.lists?.find(l => l.id === card.listId)?.title || 'Unknown list';

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Auto-resize title textarea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
  }, [title]);

  const handleTitleBlur = async () => {
    if (title.trim() && title !== card.title) {
      try {
        const updated = await cardApi.update(cardData.id, { title: title.trim() });
        setCardData(prev => ({ ...prev, ...updated }));
        updateCardInBoard(cardData.id, updated);
      } catch (err) {
        console.error('Failed to update title:', err);
        setTitle(card.title);
      }
    }
  };

  const handleDescriptionSave = async () => {
    try {
      const updated = await cardApi.update(cardData.id, { description });
      setCardData(prev => ({ ...prev, ...updated }));
      updateCardInBoard(cardData.id, updated);
      setIsEditingDescription(false);
    } catch (err) {
      console.error('Failed to update description:', err);
    }
  };

  const handleLabelToggle = async (labelId) => {
    const currentLabelIds = cardData.labels?.map(l => l.id) || [];
    const newLabelIds = currentLabelIds.includes(labelId)
      ? currentLabelIds.filter(id => id !== labelId)
      : [...currentLabelIds, labelId];
    
    try {
      const updated = await cardApi.updateLabels(cardData.id, newLabelIds);
      setCardData(prev => ({ ...prev, ...updated }));
      updateCardInBoard(cardData.id, updated);
    } catch (err) {
      console.error('Failed to update labels:', err);
    }
  };

  const handleMemberToggle = async (memberId) => {
    const currentMemberIds = cardData.members?.map(m => m.id) || [];
    const newMemberIds = currentMemberIds.includes(memberId)
      ? currentMemberIds.filter(id => id !== memberId)
      : [...currentMemberIds, memberId];
    
    try {
      const updated = await cardApi.updateMembers(cardData.id, newMemberIds);
      setCardData(prev => ({ ...prev, ...updated }));
      updateCardInBoard(cardData.id, updated);
    } catch (err) {
      console.error('Failed to update members:', err);
    }
  };

  const handleDueDateChange = async (date) => {
    try {
      const updated = await cardApi.updateDueDate(cardData.id, date?.toISOString() || null);
      setCardData(prev => ({ ...prev, ...updated }));
      updateCardInBoard(cardData.id, updated);
      setShowDatePicker(false);
    } catch (err) {
      console.error('Failed to update due date:', err);
    }
  };

  const handleAddChecklist = async () => {
    try {
      const checklist = await checklistApi.create({ 
        cardId: cardData.id, 
        title: newChecklistTitle 
      });
      setCardData(prev => ({
        ...prev,
        checklists: [...(prev.checklists || []), checklist],
      }));
      updateCardInBoard(cardData.id, {
        checklists: [...(cardData.checklists || []), checklist],
      });
      setNewChecklistTitle('Checklist');
      setShowChecklistForm(false);
    } catch (err) {
      console.error('Failed to add checklist:', err);
    }
  };

  const handleDeleteChecklist = async (checklistId) => {
    try {
      await checklistApi.delete(checklistId);
      const newChecklists = cardData.checklists.filter(c => c.id !== checklistId);
      setCardData(prev => ({ ...prev, checklists: newChecklists }));
      updateCardInBoard(cardData.id, { checklists: newChecklists });
    } catch (err) {
      console.error('Failed to delete checklist:', err);
    }
  };

  const handleAddChecklistItem = async (checklistId, text) => {
    try {
      const item = await checklistApi.addItem(checklistId, { text });
      const newChecklists = cardData.checklists.map(c =>
        c.id === checklistId
          ? { ...c, items: [...(c.items || []), item] }
          : c
      );
      setCardData(prev => ({ ...prev, checklists: newChecklists }));
      updateCardInBoard(cardData.id, { checklists: newChecklists });
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const handleToggleChecklistItem = async (checklistId, itemId, completed) => {
    try {
      await checklistApi.updateItem(itemId, { completed });
      const newChecklists = cardData.checklists.map(c =>
        c.id === checklistId
          ? {
              ...c,
              items: c.items.map(i =>
                i.id === itemId ? { ...i, completed } : i
              ),
            }
          : c
      );
      setCardData(prev => ({ ...prev, checklists: newChecklists }));
      updateCardInBoard(cardData.id, { checklists: newChecklists });
    } catch (err) {
      console.error('Failed to toggle item:', err);
    }
  };

  const handleDeleteChecklistItem = async (checklistId, itemId) => {
    try {
      await checklistApi.deleteItem(itemId);
      const newChecklists = cardData.checklists.map(c =>
        c.id === checklistId
          ? { ...c, items: c.items.filter(i => i.id !== itemId) }
          : c
      );
      setCardData(prev => ({ ...prev, checklists: newChecklists }));
      updateCardInBoard(cardData.id, { checklists: newChecklists });
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleDeleteCard = async () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        await deleteCard(cardData.id);
        onClose();
      } catch (err) {
        console.error('Failed to delete card:', err);
      }
    }
  };

  const getDueDateStatus = () => {
    if (!cardData.dueDate) return null;
    const dueDate = new Date(cardData.dueDate);
    if (isPast(dueDate) && !isToday(dueDate)) return 'overdue';
    if (isToday(dueDate) || isTomorrow(dueDate)) return 'due-soon';
    return 'normal';
  };

  return (
    <div className="modal-overlay">
      <div className="card-modal" ref={modalRef}>
        {/* Header */}
        <div className="card-modal-header">
          <svg className="card-modal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
          </svg>
          
          <div className="card-modal-title-section">
            <textarea
              ref={titleRef}
              className="card-modal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              rows={1}
            />
            <div className="card-modal-list-info">
              in list <strong>{listName}</strong>
            </div>
          </div>

          <button className="card-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="card-modal-body">
          {/* Main Content */}
          <div className="card-modal-main">
            {/* Labels */}
            {cardData.labels && cardData.labels.length > 0 && (
              <div className="modal-labels">
                {cardData.labels.map((label) => (
                  <span
                    key={label.id}
                    className="modal-label"
                    style={{ backgroundColor: label.color }}
                    onClick={() => setShowLabelsPopover(true)}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}

            {/* Members */}
            {cardData.members && cardData.members.length > 0 && (
              <div className="modal-members">
                {cardData.members.map((member) => (
                  <span
                    key={member.id}
                    className="modal-member"
                    style={{ backgroundColor: member.color }}
                    title={member.name}
                  >
                    {member.initials}
                  </span>
                ))}
              </div>
            )}

            {/* Due Date Display */}
            {cardData.dueDate && (
              <div className="modal-due-date">
                <span className={`due-date-display ${getDueDateStatus()}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {format(new Date(cardData.dueDate), 'MMM d, yyyy')}
                </span>
              </div>
            )}

            {/* Description */}
            <div className="modal-section">
              <div className="modal-section-header">
                <svg className="modal-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="15" y2="18" />
                </svg>
                <h4 className="modal-section-title">Description</h4>
              </div>
              
              {isEditingDescription ? (
                <>
                  <textarea
                    className="description-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a more detailed description..."
                    autoFocus
                  />
                  <div className="description-actions">
                    <button className="btn-primary" onClick={handleDescriptionSave}>
                      Save
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={() => {
                        setDescription(cardData.description || '');
                        setIsEditingDescription(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div
                  className={`description-content ${description ? 'has-content' : ''}`}
                  onClick={() => setIsEditingDescription(true)}
                >
                  {description || 'Add a more detailed description...'}
                </div>
              )}
            </div>

            {/* Checklists */}
            {cardData.checklists?.map((checklist) => (
              <ChecklistComponent
                key={checklist.id}
                checklist={checklist}
                onDelete={() => handleDeleteChecklist(checklist.id)}
                onAddItem={(text) => handleAddChecklistItem(checklist.id, text)}
                onToggleItem={(itemId, completed) => handleToggleChecklistItem(checklist.id, itemId, completed)}
                onDeleteItem={(itemId) => handleDeleteChecklistItem(checklist.id, itemId)}
              />
            ))}
          </div>

          {/* Sidebar */}
          <div className="card-modal-sidebar">
            <div className="sidebar-section">
              <div className="sidebar-title">Add to card</div>
              
              <div style={{ position: 'relative' }}>
                <button 
                  className="sidebar-btn"
                  onClick={() => setShowMembersPopover(!showMembersPopover)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Members
                </button>
                {showMembersPopover && (
                  <MembersPopover
                    members={members}
                    selectedIds={cardData.members?.map(m => m.id) || []}
                    onToggle={handleMemberToggle}
                    onClose={() => setShowMembersPopover(false)}
                  />
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <button 
                  className="sidebar-btn"
                  onClick={() => setShowLabelsPopover(!showLabelsPopover)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  Labels
                </button>
                {showLabelsPopover && (
                  <LabelsPopover
                    labels={board?.labels || []}
                    selectedIds={cardData.labels?.map(l => l.id) || []}
                    onToggle={handleLabelToggle}
                    onClose={() => setShowLabelsPopover(false)}
                  />
                )}
              </div>

              <button 
                className="sidebar-btn"
                onClick={() => setShowChecklistForm(!showChecklistForm)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Checklist
              </button>
              {showChecklistForm && (
                <div style={{ marginTop: 8 }}>
                  <input
                    type="text"
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    placeholder="Checklist title"
                    style={{ width: '100%', marginBottom: 8 }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-primary" onClick={handleAddChecklist}>Add</button>
                    <button className="btn-secondary" onClick={() => setShowChecklistForm(false)}>Cancel</button>
                  </div>
                </div>
              )}

              <div style={{ position: 'relative' }}>
                <button 
                  className="sidebar-btn"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Due Date
                </button>
                {showDatePicker && (
                  <div className="popover" style={{ top: '100%', left: 0 }}>
                    <div className="popover-header">
                      <span className="popover-title">Due Date</span>
                      <button className="popover-close" onClick={() => setShowDatePicker(false)}>×</button>
                    </div>
                    <div className="popover-content">
                      <DatePicker
                        selected={cardData.dueDate ? new Date(cardData.dueDate) : null}
                        onChange={handleDueDateChange}
                        inline
                        showTimeSelect
                        dateFormat="Pp"
                      />
                      {cardData.dueDate && (
                        <button 
                          className="btn-secondary" 
                          style={{ width: '100%', marginTop: 8 }}
                          onClick={() => handleDueDateChange(null)}
                        >
                          Remove Due Date
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sidebar-section">
              <div className="sidebar-title">Actions</div>
              <button className="sidebar-btn danger" onClick={handleDeleteCard}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Checklist Component
const ChecklistComponent = ({ checklist, onDelete, onAddItem, onToggleItem, onDeleteItem }) => {
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  const items = checklist.items || [];
  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const handleAddItem = () => {
    if (newItemText.trim()) {
      onAddItem(newItemText.trim());
      setNewItemText('');
    }
  };

  return (
    <div className="modal-section checklist">
      <div className="checklist-header">
        <svg className="modal-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        <h4 className="checklist-title">{checklist.title}</h4>
        <button className="checklist-delete" onClick={onDelete}>Delete</button>
      </div>

      <div className="checklist-progress">
        <span className="checklist-percentage">{progress}%</span>
        <div className="checklist-progress-bar">
          <div 
            className={`checklist-progress-fill ${progress === 100 ? 'complete' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="checklist-items">
        {items.map((item) => (
          <div key={item.id} className="checklist-item">
            <input
              type="checkbox"
              className="checklist-checkbox"
              checked={item.completed}
              onChange={(e) => onToggleItem(item.id, e.target.checked)}
            />
            <span className={`checklist-item-text ${item.completed ? 'completed' : ''}`}>
              {item.text}
            </span>
            <button 
              className="checklist-item-delete"
              onClick={() => onDeleteItem(item.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {showAddItem ? (
        <div className="add-checklist-item-form">
          <input
            type="text"
            className="add-checklist-item-input"
            placeholder="Add an item"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddItem();
              if (e.key === 'Escape') setShowAddItem(false);
            }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={handleAddItem}>Add</button>
            <button className="btn-secondary" onClick={() => setShowAddItem(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="add-checklist-item" onClick={() => setShowAddItem(true)}>
          Add an item
        </div>
      )}
    </div>
  );
};

// Labels Popover Component
const LabelsPopover = ({ labels, selectedIds, onToggle, onClose }) => {
  return (
    <div className="popover" style={{ top: '100%', left: 0 }}>
      <div className="popover-header">
        <span className="popover-title">Labels</span>
        <button className="popover-close" onClick={onClose}>×</button>
      </div>
      <div className="popover-content">
        {labels.map((label) => (
          <div 
            key={label.id} 
            className="label-option"
            onClick={() => onToggle(label.id)}
          >
            <div 
              className="label-color-preview"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </div>
            {selectedIds.includes(label.id) && (
              <svg className="label-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Members Popover Component
const MembersPopover = ({ members, selectedIds, onToggle, onClose }) => {
  return (
    <div className="popover" style={{ top: '100%', left: 0 }}>
      <div className="popover-header">
        <span className="popover-title">Members</span>
        <button className="popover-close" onClick={onClose}>×</button>
      </div>
      <div className="popover-content">
        {members.map((member) => (
          <div 
            key={member.id} 
            className="member-option"
            onClick={() => onToggle(member.id)}
          >
            <span 
              className="member-avatar"
              style={{ backgroundColor: member.color }}
            >
              {member.initials}
            </span>
            <div className="member-info">
              <div className="member-name">{member.name}</div>
            </div>
            {selectedIds.includes(member.id) && (
              <svg className="member-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardModal;
