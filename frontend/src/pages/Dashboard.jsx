import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, BarChart3, FileText, TrendingUp } from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalRows: 0,
    recentFiles: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/upload/files');
      const files = response.data.files;
      
      const totalRows = files.reduce((sum, file) => sum + file.rowCount, 0);
      
      setStats({
        totalFiles: files.length,
        totalRows,
        recentFiles: files.slice(0, 5)
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Excel Analytics Dashboard</h1>
        <p>Analyze your Excel data with powerful visualizations and insights</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={32} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalFiles}</h3>
            <p>Files Uploaded</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={32} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalRows.toLocaleString()}</h3>
            <p>Total Rows Processed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <BarChart3 size={32} />
          </div>
          <div className="stat-content">
            <h3>{stats.recentFiles.length}</h3>
            <p>Recent Analyses</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <Link to="/upload" className="action-card">
            <Upload size={48} />
            <h3>Upload New File</h3>
            <p>Upload Excel or CSV files for analysis</p>
          </Link>

          <Link to="/analytics" className="action-card">
            <BarChart3 size={48} />
            <h3>Create Charts</h3>
            <p>Generate interactive charts and visualizations</p>
          </Link>

          <Link to="/history" className="action-card">
            <FileText size={48} />
            <h3>View History</h3>
            <p>Browse previously uploaded files</p>
          </Link>
        </div>
      </div>

      {stats.recentFiles.length > 0 && (
        <div className="recent-files">
          <h2>Recent Files</h2>
          <div className="files-list">
            {stats.recentFiles.map((file) => (
              <div key={file._id} className="file-item">
                <div className="file-info">
                  <h4>{file.originalName}</h4>
                  <p>{file.rowCount} rows • {file.columnCount} columns</p>
                  <span className="upload-date">
                    {new Date(file.uploadDate).toLocaleDateString()}
                  </span>
                </div>
                <Link 
                  to={`/analytics/${file._id}`}
                  className="analyze-btn"
                >
                  Analyze
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
