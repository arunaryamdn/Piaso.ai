import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; // Adjust path as needed

const PortfolioUpload: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState('No file uploaded yet. Please select a file to upload your portfolio data.');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setFileName(file.name);
    setUploading(true);
    setUploadProgress(30);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:5000/api/upload-portfolio', {
        method: 'POST',
        body: formData,
      });
      setUploadProgress(80);
      if (!response.ok) throw new Error('Upload failed');
      setStatus('Upload successful! Ready to analyze.');
      setUploadProgress(100);
      setUploading(false);
      window.sessionStorage.setItem('portfolioUploaded', 'true');
    } catch (err: any) {
      setStatus('Upload failed. Please try again.');
      setUploadProgress(0);
      setUploading(false);
    }
  };

  const handleAnalyze = () => {
    if (uploadProgress === 100 && !uploading) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="upload-portfolio-root">
      <header className="upload-header">
        <div className="upload-header-title-row">
          <img src={logo} alt="Paiso.ai Logo" className="upload-logo" style={{ height: 32, width: 32 }} />
          <h2>Paiso.ai</h2>
        </div>
        <nav className="upload-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/portfolio" className="active">Portfolio</Link>
          <Link to="/ai">Analytics</Link>
          <Link to="/news">Research</Link>
          <Link to="/realtime">Community</Link>
        </nav>
        <div className="upload-header-actions">
          <button className="upload-notify-btn">
            <span className="material-icons">notifications</span>
          </button>
          <div className="upload-avatar" />
        </div>
      </header>
      <main className="upload-main">
        <header className="upload-title-block">
          <h1>Upload Portfolio Data</h1>
          <p>Upload your portfolio data from an Excel file to analyze your investments. Ensure your file is in the correct format as described below.</p>
        </header>
        <section className="upload-excel-format">
          <h3>Required Excel Format</h3>
          <p>Your Excel file should contain the following columns in this specific order: <br />
            <b>Stock Symbol, Quantity, Average Price, Date of Purchase</b>.<br />
            The first row must be the header row with these exact column names.
          </p>
          <a className="upload-download-link" href="#">
            <span className="material-icons">download</span>
            Download Sample Excel File
          </a>
        </section>
        <section className="upload-drop-section">
          <div className="upload-drop-area">
            <span className="material-icons upload-drop-icon">upload_file</span>
            <div className="upload-drop-texts">
              <p>Drag and drop your Excel file here, or</p>
              <label htmlFor="file-upload" className="upload-browse-label">Browse Files</label>
              <input id="file-upload" type="file" accept=".xlsx,.xls" className="upload-file-input" onChange={handleFileChange} />
            </div>
            <p className="upload-drop-hint">Supported file types: .xlsx, .xls. Max file size: 5MB.</p>
          </div>
        </section>
        <section className="upload-status-section">
          <h3>Upload Status</h3>
          <div className="status-message">{status}</div>
          <div className="upload-progress-row">
            <span>Upload Progress</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="upload-progress-bar-bg">
            <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
          </div>
        </section>
        <div className="upload-analyze-btn-row">
          <button
            className="upload-analyze-btn"
            disabled={uploadProgress < 100 || uploading}
            onClick={handleAnalyze}
          >
            <span className="material-icons">insights</span>
            <span>Analyze Portfolio</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default PortfolioUpload;