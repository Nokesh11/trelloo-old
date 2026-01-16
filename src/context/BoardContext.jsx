import { createContext, useContext, useState, useCallback } from 'react';
import { boardApi, listApi, cardApi, memberApi } from '../services/api';

const BoardContext = createContext(null);

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
};

export const BoardProvider = ({ children }) => {
  const [board, setBoard] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    labels: [],
    members: [],
    dueDate: null,
  });

  const fetchBoard = useCallback(async (boardId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await boardApi.getById(boardId);
      setBoard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      const data = await memberApi.getAll();
      setMembers(data);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  }, []);

  const updateBoardState = useCallback((updater) => {
    setBoard((prev) => {
      if (!prev) return prev;
      return typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
    });
  }, []);

  const addList = useCallback(async (title) => {
    if (!board) return;
    try {
      const newList = await listApi.create({ title, boardId: board.id });
      updateBoardState((prev) => ({
        ...prev,
        lists: [...prev.lists, { ...newList, cards: [] }],
      }));
      return newList;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [board, updateBoardState]);

  const updateList = useCallback(async (listId, data) => {
    try {
      await listApi.update(listId, data);
      updateBoardState((prev) => ({
        ...prev,
        lists: prev.lists.map((list) =>
          list.id === listId ? { ...list, ...data } : list
        ),
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [updateBoardState]);

  const deleteList = useCallback(async (listId) => {
    try {
      await listApi.delete(listId);
      updateBoardState((prev) => ({
        ...prev,
        lists: prev.lists.filter((list) => list.id !== listId),
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [updateBoardState]);

  const addCard = useCallback(async (listId, title) => {
    try {
      const newCard = await cardApi.create({ title, listId });
      updateBoardState((prev) => ({
        ...prev,
        lists: prev.lists.map((list) =>
          list.id === listId
            ? { ...list, cards: [...(list.cards || []), { ...newCard, labels: [], members: [], checklists: [] }] }
            : list
        ),
      }));
      return newCard;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [updateBoardState]);

  const updateCard = useCallback(async (cardId, data) => {
    try {
      const updatedCard = await cardApi.update(cardId, data);
      updateBoardState((prev) => ({
        ...prev,
        lists: prev.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card.id === cardId ? { ...card, ...updatedCard } : card
          ),
        })),
      }));
      return updatedCard;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [updateBoardState]);

  const deleteCard = useCallback(async (cardId) => {
    try {
      await cardApi.delete(cardId);
      updateBoardState((prev) => ({
        ...prev,
        lists: prev.lists.map((list) => ({
          ...list,
          cards: list.cards.filter((card) => card.id !== cardId),
        })),
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [updateBoardState]);

  const moveCard = useCallback((sourceListId, destListId, sourceIndex, destIndex) => {
    updateBoardState((prev) => {
      const newLists = prev.lists.map(list => ({
        ...list,
        cards: [...list.cards],
      }));
      
      const sourceList = newLists.find((l) => l.id === sourceListId);
      const destList = newLists.find((l) => l.id === destListId);

      if (!sourceList || !destList) return prev;

      const [movedCard] = sourceList.cards.splice(sourceIndex, 1);
      movedCard.listId = destListId;
      destList.cards.splice(destIndex, 0, movedCard);

      return { ...prev, lists: newLists };
    });
  }, [updateBoardState]);

  const reorderLists = useCallback((startIndex, endIndex) => {
    updateBoardState((prev) => {
      const newLists = [...prev.lists];
      const [removed] = newLists.splice(startIndex, 1);
      newLists.splice(endIndex, 0, removed);
      return { ...prev, lists: newLists };
    });
  }, [updateBoardState]);

  const updateCardInBoard = useCallback((cardId, updatedCard) => {
    updateBoardState((prev) => ({
      ...prev,
      lists: prev.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
          card.id === cardId ? { ...card, ...updatedCard } : card
        ),
      })),
    }));
  }, [updateBoardState]);

  const getFilteredCards = useCallback((cards = []) => {
    if (!cards) return [];
    
    let filtered = [...cards];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((card) =>
        card.title.toLowerCase().includes(query)
      );
    }

    // Label filter
    if (filters.labels.length > 0) {
      filtered = filtered.filter((card) =>
        card.labels?.some((label) => filters.labels.includes(label.id))
      );
    }

    // Member filter
    if (filters.members.length > 0) {
      filtered = filtered.filter((card) =>
        card.members?.some((member) => filters.members.includes(member.id))
      );
    }

    // Due date filter
    if (filters.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter((card) => {
        if (!card.dueDate) {
          return filters.dueDate === 'none';
        }
        
        const dueDate = new Date(card.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        switch (filters.dueDate) {
          case 'overdue':
            return dueDate < today;
          case 'today': {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return dueDate >= today && dueDate < tomorrow;
          }
          case 'week': {
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            return dueDate >= today && dueDate < nextWeek;
          }
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [searchQuery, filters]);

  const value = {
    board,
    members,
    loading,
    error,
    searchQuery,
    filters,
    setSearchQuery,
    setFilters,
    fetchBoard,
    fetchMembers,
    updateBoardState,
    addList,
    updateList,
    deleteList,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    reorderLists,
    updateCardInBoard,
    getFilteredCards,
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
};
