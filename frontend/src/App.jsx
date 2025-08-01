import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analytics from './pages/Analytics';
import FileHistory from './pages/FileHistory';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/analytics/:fileId?" element={<Analytics />} />
            <Route path="/history" element={<FileHistory />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
