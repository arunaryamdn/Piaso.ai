import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; // Adjust path as needed

const PortfolioUpload: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState('No file uploaded yet. Please select a file to upload your portfolio data.');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', width: '100%' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Upload Portfolio</h1>
      </div>
      <div className="upload-portfolio-root">
        <main className="upload-main" style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
          <header className="upload-title-block" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#53d22c', marginBottom: 8 }}>Upload Portfolio Data</h2>
            <p style={{ color: '#b5cbb0', fontSize: '1.08rem' }}>Upload your portfolio data from an Excel file to analyze your investments. Ensure your file is in the correct format as described below.</p>
          </header>
          <section className="upload-excel-format fadeInUp" style={{ marginBottom: 24 }}>
            <h3 style={{ color: '#7ecbff', fontWeight: 600 }}>Required Excel Format</h3>
            <p style={{ color: '#e0e6ef' }}>Your Excel file should contain the following columns in this specific order: <br />
              <b>Stock Symbol, Quantity, Average Price, Date of Purchase</b>.<br />
              The first row must be the header row with these exact column names.
            </p>
            <a className="upload-download-link" href="#" style={{ color: '#53d22c', textDecoration: 'underline', fontWeight: 600 }}>
              <span className="material-icons" style={{ verticalAlign: 'middle' }}>download</span>
              Download Sample Excel File
            </a>
          </section>
          <section className="upload-drop-section fadeInUp" style={{ marginBottom: 24 }}>
            <div
              className={`upload-drop-area${dragActive ? ' drag-active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                background: dragActive ? '#1a2233' : '#232837',
                border: '2px dashed #7ecbff',
                borderRadius: 16,
                padding: 32,
                textAlign: 'center',
                marginBottom: 8,
                transition: 'border-color 0.2s, background 0.2s',
                cursor: 'pointer',
              }}
            >
              <span className="material-icons upload-drop-icon" style={{ fontSize: 48, color: '#7ecbff' }}>upload_file</span>
              <div className="upload-drop-texts" style={{ marginTop: 12 }}>
                <p style={{ color: '#b5cbb0', fontSize: '1.08rem' }}>Drag and drop your Excel file here, or</p>
                <label htmlFor="file-upload" className="upload-browse-label" style={{ color: '#53d22c', fontWeight: 600, cursor: 'pointer' }}>Browse Files</label>
                <input id="file-upload" type="file" accept=".xlsx,.xls" className="upload-file-input" onChange={handleFileChange} style={{ display: 'none' }} />
                {fileName && <div style={{ color: '#7ecbff', marginTop: 8 }}>Selected: {fileName}</div>}
              </div>
              <p className="upload-drop-hint" style={{ color: '#7ecbff', fontSize: '0.98rem', marginTop: 8 }}>Supported file types: .xlsx, .xls. Max file size: 5MB.</p>
            </div>
          </section>
          <section className="upload-status-section fadeInUp" style={{ marginBottom: 24 }}>
            <h3 style={{ color: '#7ecbff', fontWeight: 600 }}>Upload Status</h3>
            <div className="status-message" style={{ color: uploading ? '#ffb347' : uploadProgress === 100 ? '#53d22c' : '#e0e6ef', marginBottom: 8 }}>{status}</div>
            <div className="upload-progress-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span>Upload Progress</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="upload-progress-bar-bg" style={{ background: '#232837', borderRadius: 8, height: 10, width: '100%' }}>
              <div className="upload-progress-bar" style={{ width: `${uploadProgress}%`, background: '#53d22c', height: 10, borderRadius: 8, transition: 'width 0.3s' }} />
            </div>
          </section>
          <div className="upload-analyze-btn-row" style={{ textAlign: 'center', marginTop: 24 }}>
            <button
              className="upload-analyze-btn"
              disabled={uploadProgress < 100 || uploading}
              onClick={handleAnalyze}
              style={{
                background: uploadProgress === 100 ? 'linear-gradient(90deg, #53d22c 0%, #7ecbff 100%)' : '#232837',
                color: uploadProgress === 100 ? '#181c24' : '#b5cbb0',
                fontWeight: 800,
                fontSize: '1.1rem',
                border: 'none',
                borderRadius: 12,
                padding: '0.9rem 2.2rem',
                boxShadow: '0 2px 16px 0 rgba(40,255,80,0.12)',
                cursor: uploadProgress === 100 ? 'pointer' : 'not-allowed',
                transition: 'background 0.18s, color 0.18s, transform 0.18s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span className="material-icons">insights</span>
              <span>Analyze Portfolio</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PortfolioUpload;