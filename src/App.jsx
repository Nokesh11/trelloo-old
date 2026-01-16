import { useEffect, useState, useCallback } from 'react';
import { BoardProvider } from './context/BoardContext';
import { boardApi } from './services/api';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import Board from './components/Board/Board';
import BottomNav from './components/BottomNav/BottomNav';
import BoardSwitcher from './components/BoardSwitcher/BoardSwitcher';
import CreateBoardModal from './components/CreateBoardModal/CreateBoardModal';
import './App.css';

function App() {
  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [boardSwitcherOpen, setBoardSwitcherOpen] = useState(false);

  const fetchBoards = useCallback(async () => {
    try {
      const data = await boardApi.getAll();
      setBoards(data);
      if (data.length > 0 && !selectedBoardId) {
        setSelectedBoardId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch boards:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBoardId]);

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async (boardData) => {
    try {
      const newBoard = await boardApi.create(boardData);
      setBoards(prev => [...prev, newBoard]);
      setSelectedBoardId(newBoard.id);
      setBoardSwitcherOpen(false);
    } catch (err) {
      console.error('Failed to create board:', err);
      throw err;
    }
  };

  const handleBoardSelect = (boardId) => {
    setSelectedBoardId(boardId);
    setSidebarOpen(false);
    setBoardSwitcherOpen(false);
  };

  const handleSwitchBoards = () => {
    setBoardSwitcherOpen(!boardSwitcherOpen);
  };

  const handleCreateFromSwitcher = () => {
    setBoardSwitcherOpen(false);
    setCreateModalOpen(true);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Loading Trello...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar
        boards={boards}
        activeBoardId={selectedBoardId}
        onBoardSelect={handleBoardSelect}
        onCreateBoard={() => setCreateModalOpen(true)}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="app-main">
        <BoardProvider key={selectedBoardId}>
          <Header onCreateBoard={() => setCreateModalOpen(true)} />
          
          {/* Board Content */}
          <div className="app-content-wrapper">
            <div className="board-wrapper">
              {selectedBoardId ? (
                <Board boardId={selectedBoardId} />
              ) : (
                <div className="app-empty">
                  <h2>Welcome to Trello</h2>
                  <p>Create your first board to get started!</p>
                  <button 
                    className="create-first-board-btn"
                    onClick={() => setCreateModalOpen(true)}
                  >
                    Create a board
                  </button>
                </div>
              )}
            </div>
          </div>
        </BoardProvider>
      </div>

      <BottomNav 
        onSwitchBoards={handleSwitchBoards} 
        boardSwitcherOpen={boardSwitcherOpen}
      />

      {/* Board Switcher Modal */}
      <BoardSwitcher
        isOpen={boardSwitcherOpen}
        onClose={() => setBoardSwitcherOpen(false)}
        boards={boards}
        activeBoardId={selectedBoardId}
        onBoardSelect={handleBoardSelect}
        onCreateBoard={handleCreateFromSwitcher}
      />

      <CreateBoardModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateBoard}
      />
    </div>
  );
}

export default App;
