import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { BarChart3, Download, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import './Analytics.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { fileId } = useParams();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartConfig, setChartConfig] = useState({
    type: 'bar',
    xColumn: '',
    yColumn: '',
    groupBy: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (fileId && files.length > 0) {
      const file = files.find(f => f._id === fileId);
      if (file) {
        setSelectedFile(file);
        fetchStats(fileId);
      }
    }
  }, [fileId, files]);

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

  const fetchStats = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/analytics/stats/${id}`);
      setStats(response.data);
      
      // Set default chart configuration
      if (response.data.headers.length > 0) {
        setChartConfig(prev => ({
          ...prev,
          groupBy: response.data.categoricalColumns[0] || response.data.headers[0],
          xColumn: response.data.headers[0],
          yColumn: response.data.numericalColumns[0] || response.data.headers[1]
        }));
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const generateChart = async () => {
    if (!selectedFile) return;

    try {
      const response = await axios.post(`http://localhost:3001/api/analytics/chart/${selectedFile._id}`, chartConfig);
      setChartData(response.data);
    } catch (error) {
      console.error('Failed to generate chart:', error);
    }
  };

  const handleFileSelect = (e) => {
    const fileId = e.target.value;
    if (fileId) {
      const file = files.find(f => f._id === fileId);
      setSelectedFile(file);
      fetchStats(fileId);
      setChartData(null);
    }
  };

  const renderChart = () => {
    if (!chartData || !chartData.chartData) return null;

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `${chartConfig.type.charAt(0).toUpperCase() + chartConfig.type.slice(1)} Chart`,
        },
      },
    };

    switch (chartData.chartType) {
      case 'bar':
      case 'column':
        return <Bar data={chartData.chartData} options={options} />;
      case 'line':
        return <Line data={chartData.chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData.chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData.chartData} options={options} />;
      default:
        return <Bar data={chartData.chartData} options={options} />;
    }
  };

  if (loading) {
    return (
      <div className="analytics loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <h1>
          <BarChart3 size={32} />
          Data Analytics
        </h1>
      </div>

      {files.length === 0 ? (
        <div className="no-files">
          <p>No files uploaded yet.</p>
          <Link to="/upload" className="btn btn-primary">
            Upload Your First File
          </Link>
        </div>
      ) : (
        <div className="analytics-content">
          <div className="file-selector">
            <label htmlFor="file-select" className="form-label">
              Select File to Analyze:
            </label>
            <select
              id="file-select"
              value={selectedFile?._id || ''}
              onChange={handleFileSelect}
              className="form-select"
            >
              <option value="">Choose a file...</option>
              {files.map(file => (
                <option key={file._id} value={file._id}>
                  {file.originalName} ({file.rowCount} rows)
                </option>
              ))}
            </select>
          </div>

          {selectedFile && stats && (
            <>
              <div className="file-info">
                <h3>{selectedFile.originalName}</h3>
                <div className="file-stats">
                  <span>{stats.totalRows} rows</span>
                  <span>{stats.totalColumns} columns</span>
                  <span>Uploaded: {new Date(selectedFile.uploadDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="analytics-grid">
                <div className="chart-controls">
                  <h3>Chart Configuration</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Chart Type:</label>
                    <select
                      value={chartConfig.type}
                      onChange={(e) => setChartConfig(prev => ({ ...prev, type: e.target.value }))}
                      className="form-select"
                    >
                      <option value="bar">Bar Chart</option>
                      <option value="line">Line Chart</option>
                      <option value="pie">Pie Chart</option>
                      <option value="doughnut">Doughnut Chart</option>
                    </select>
                  </div>

                  {(chartConfig.type === 'bar' || chartConfig.type === 'line') && (
                    <>
                      <div className="form-group">
                        <label className="form-label">X-Axis Column:</label>
                        <select
                          value={chartConfig.xColumn}
                          onChange={(e) => setChartConfig(prev => ({ ...prev, xColumn: e.target.value }))}
                          className="form-select"
                        >
                          <option value="">Select column...</option>
                          {stats.headers.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Y-Axis Column:</label>
                        <select
                          value={chartConfig.yColumn}
                          onChange={(e) => setChartConfig(prev => ({ ...prev, yColumn: e.target.value }))}
                          className="form-select"
                        >
                          <option value="">Select column...</option>
                          {stats.numericalColumns.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {(chartConfig.type === 'pie' || chartConfig.type === 'doughnut') && (
                    <div className="form-group">
                      <label className="form-label">Group By:</label>
                      <select
                        value={chartConfig.groupBy}
                        onChange={(e) => setChartConfig(prev => ({ ...prev, groupBy: e.target.value }))}
                        className="form-select"
                      >
                        <option value="">Select column...</option>
                        {stats.categoricalColumns.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button onClick={generateChart} className="btn btn-primary">
                    Generate Chart
                  </button>
                </div>

                <div className="chart-display">
                  {chartData ? (
                    <div className="chart-container">
                      {renderChart()}
                    </div>
                  ) : (
                    <div className="chart-placeholder">
                      <BarChart3 size={64} />
                      <p>Configure your chart and click "Generate Chart" to visualize your data</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="data-summary">
                <h3>Data Summary</h3>
                <div className="summary-grid">
                  {Object.entries(stats.summary).map(([column, info]) => (
                    <div key={column} className="summary-card">
                      <h4>{column}</h4>
                      <div className="summary-details">
                        <p><strong>Type:</strong> {info.type}</p>
                        {info.type === 'numerical' ? (
                          <>
                            <p><strong>Min:</strong> {info.min}</p>
                            <p><strong>Max:</strong> {info.max}</p>
                            <p><strong>Average:</strong> {info.avg.toFixed(2)}</p>
                            <p><strong>Count:</strong> {info.count}</p>
                          </>
                        ) : (
                          <>
                            <p><strong>Unique Values:</strong> {info.uniqueCount}</p>
                            <p><strong>Total Count:</strong> {info.totalCount}</p>
                            <div className="top-values">
                              <strong>Top Values:</strong>
                              <ul>
                                {info.topValues.slice(0, 3).map(({ value, count }) => (
                                  <li key={value}>{value}: {count}</li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
