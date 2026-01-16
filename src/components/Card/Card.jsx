import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import CardModal from '../CardModal/CardModal';
import './Card.css';

const Card = ({ card, index }) => {
  const [showModal, setShowModal] = useState(false);
  const [labelsExpanded, setLabelsExpanded] = useState(false);

  const getChecklistProgress = () => {
    if (!card.checklists || card.checklists.length === 0) return null;
    
    let total = 0;
    let completed = 0;
    
    card.checklists.forEach((checklist) => {
      if (checklist.items) {
        total += checklist.items.length;
        completed += checklist.items.filter((item) => item.completed).length;
      }
    });
    
    return { total, completed, isComplete: total > 0 && completed === total };
  };

  const getDueDateStatus = () => {
    if (!card.dueDate) return null;
    
    const dueDate = new Date(card.dueDate);
    const now = new Date();
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return 'overdue';
    }
    if (isToday(dueDate) || isTomorrow(dueDate)) {
      return 'due-soon';
    }
    return 'normal';
  };

  const formatDueDate = () => {
    if (!card.dueDate) return null;
    const dueDate = new Date(card.dueDate);
    return format(dueDate, 'MMM d');
  };

  const checklistProgress = getChecklistProgress();
  const dueDateStatus = getDueDateStatus();
  const hasDescription = card.description && card.description.trim().length > 0;

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <div
            className={`card ${snapshot.isDragging ? 'dragging' : ''}`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setShowModal(true)}
          >
            <div className="card-content">
              {card.labels && card.labels.length > 0 && (
                <div 
                  className="card-labels"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLabelsExpanded(!labelsExpanded);
                  }}
                >
                  {card.labels.map((label) => (
                    <span
                      key={label.id}
                      className={`card-label ${labelsExpanded ? 'expanded' : ''}`}
                      style={{ backgroundColor: label.color }}
                      title={label.name}
                    >
                      {labelsExpanded && label.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="card-title">{card.title}</div>

              {(card.dueDate || hasDescription || checklistProgress) && (
                <div className="card-badges">
                  {card.dueDate && (
                    <span className={`card-badge due-date ${dueDateStatus}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {formatDueDate()}
                    </span>
                  )}

                  {hasDescription && (
                    <span className="card-badge description">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="15" y2="18" />
                      </svg>
                    </span>
                  )}

                  {checklistProgress && (
                    <span className={`card-badge checklist ${checklistProgress.isComplete ? 'complete' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                      {checklistProgress.completed}/{checklistProgress.total}
                    </span>
                  )}
                </div>
              )}

              {card.members && card.members.length > 0 && (
                <div className="card-members">
                  {card.members.slice(0, 4).map((member) => (
                    <span
                      key={member.id}
                      className="card-member"
                      style={{ backgroundColor: member.color }}
                      title={member.name}
                    >
                      {member.initials}
                    </span>
                  ))}
                  {card.members.length > 4 && (
                    <span className="card-member" style={{ backgroundColor: '#6b778c' }}>
                      +{card.members.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>

      {showModal && (
        <CardModal card={card} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default Card;
