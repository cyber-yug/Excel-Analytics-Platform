import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import './Upload.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['.xlsx', '.xls', '.csv'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        setError('Please select a valid Excel file (.xlsx, .xls) or CSV file');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect({ target: { files: [droppedFile] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Uploading file:', file.name);
      const response = await axios.post('http://localhost:3001/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);
      setUploadResult(response.data);
      
      // Auto-navigate to analytics after 2 seconds
      setTimeout(() => {
        navigate(`/analytics/${response.data.fileId}`);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      
      if (error.response) {
        // Server responded with error status
        setError(error.response.data?.error || `Server error: ${error.response.status}`);
      } else if (error.request) {
        // Request was made but no response received
        setError('Unable to connect to server. Please check if the backend is running.');
      } else {
        // Something else happened
        setError(error.message || 'Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-header">
        <h1>Upload Your Excel File</h1>
        <p>Upload Excel (.xlsx, .xls) or CSV files to start analyzing your data</p>
      </div>

      <div className="upload-container">
        <div 
          className={`upload-area ${file ? 'has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            id="file-input"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <label htmlFor="file-input" className="upload-label">
            {file ? (
              <div className="file-preview">
                <FileText size={48} />
                <h3>{file.name}</h3>
                <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="upload-prompt">
                <UploadIcon size={64} />
                <h3>Drop your file here or click to browse</h3>
                <p>Supports .xlsx, .xls, and .csv files</p>
              </div>
            )}
          </label>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {uploadResult && (
          <div className="success-message">
            <CheckCircle size={20} />
            <div>
              <h4>Upload Successful!</h4>
              <p>
                Processed {uploadResult.metadata.rows} rows and {uploadResult.metadata.columns} columns
              </p>
              <p>Redirecting to analytics...</p>
            </div>
          </div>
        )}

        {file && !uploadResult && (
          <button 
            className="upload-btn"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload & Analyze'}
          </button>
        )}
      </div>

      <div className="upload-info">
        <h3>Supported Features</h3>
        <div className="features-grid">
          <div className="feature">
            <h4>📊 Automatic Analysis</h4>
            <p>Automatically detect data types and generate insights</p>
          </div>
          <div className="feature">
            <h4>📈 Interactive Charts</h4>
            <p>Create bar charts, line graphs, pie charts, and more</p>
          </div>
          <div className="feature">
            <h4>📋 Data Summary</h4>
            <p>Get statistics and summaries for all your columns</p>
          </div>
          <div className="feature">
            <h4>💾 Secure Storage</h4>
            <p>Your data is securely stored and easily accessible</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
