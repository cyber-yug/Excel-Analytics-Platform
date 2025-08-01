import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Database, BarChart3, Trash2 } from 'lucide-react';
import axios from 'axios';
import './FileHistory.css';

const FileHistory = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/upload/files');
      setFiles(response.data.files);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const sortedFiles = [...files].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'uploadDate') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <div className="file-history loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="file-history">
      <div className="history-header">
        <h1>
          <FileText size={32} />
          File History
        </h1>
        <p>View and manage all your uploaded files</p>
      </div>

      {files.length === 0 ? (
        <div className="no-files">
          <FileText size={64} />
          <h3>No files uploaded yet</h3>
          <p>Upload your first Excel or CSV file to get started with analytics</p>
          <Link to="/upload" className="btn btn-primary">
            Upload File
          </Link>
        </div>
      ) : (
        <>
          <div className="history-controls">
            <div className="sort-controls">
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select"
              >
                <option value="uploadDate">Upload Date</option>
                <option value="originalName">File Name</option>
                <option value="rowCount">Row Count</option>
                <option value="fileSize">File Size</option>
              </select>
              
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="form-select"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
            
            <div className="file-count">
              {files.length} file{files.length !== 1 ? 's' : ''} total
            </div>
          </div>

          <div className="files-grid">
            {sortedFiles.map((file) => (
              <div key={file._id} className="file-card">
                <div className="file-header">
                  <div className="file-icon">
                    <FileText size={24} />
                  </div>
                  <div className="file-name">
                    <h3>{file.originalName}</h3>
                    <p>{file.filename}</p>
                  </div>
                </div>

                <div className="file-details">
                  <div className="detail-item">
                    <Database size={16} />
                    <span>{file.rowCount} rows × {file.columnCount} columns</span>
                  </div>
                  
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                  </div>
                  
                  {file.fileSize && (
                    <div className="detail-item">
                      <span>📁 {formatFileSize(file.fileSize)}</span>
                    </div>
                  )}
                </div>

                <div className="file-preview">
                  <h4>Columns:</h4>
                  <div className="columns-list">
                    {file.headers.slice(0, 4).map((header) => (
                      <span key={header} className="column-tag">
                        {header}
                      </span>
                    ))}
                    {file.headers.length > 4 && (
                      <span className="more-columns">
                        +{file.headers.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="file-actions">
                  <Link
                    to={`/analytics/${file._id}`}
                    className="btn btn-primary"
                  >
                    <BarChart3 size={16} />
                    Analyze
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FileHistory;
