// PortfolioUpload.tsx
// Portfolio upload component for Paiso.ai. Allows user to upload Excel file.

import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; // Adjust path as needed
import { UI_STRINGS } from '../config';

interface PortfolioUploadProps {
  onUploadSuccess: () => void;
}

/**
 * Portfolio upload component. Allows user to upload Excel file and shows status.
 */
const PortfolioUpload: React.FC<PortfolioUploadProps> = ({ onUploadSuccess }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'default' | 'success' | 'fail'>('default');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');
  const [processingError, setProcessingError] = useState('');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pollStatus = () => {
    setProcessing(true);
    setProcessingMsg('Processing your portfolio... This may take a few moments.');
    setProcessingError('');
    pollingRef.current = setInterval(async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/portfolio/status', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.status === 'ready') {
          setProcessing(false);
          setProcessingMsg('Portfolio processed!');
          clearInterval(pollingRef.current!);
          onUploadSuccess();
        } else if (data.status === 'failed') {
          setProcessing(false);
          setProcessingError('Portfolio processing failed. Please try again.');
          clearInterval(pollingRef.current!);
        }
      } catch (err) {
        setProcessing(false);
        setProcessingError('Error checking processing status.');
        clearInterval(pollingRef.current!);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus('default');
    setProcessing(false);
    setProcessingMsg('');
    setProcessingError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('http://localhost:5000/api/upload-portfolio', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` },
        body: formData,
      });
      if (!res.ok) {
        const errMsg = (await res.json())?.detail || 'Upload failed';
        setStatus('fail');
        setUploading(false);
        alert(errMsg);
        throw new Error(errMsg);
      }
      setStatus('success');
      setFileName(file.name);
      setUploading(false);
      pollStatus();
      console.debug('[PortfolioUpload] Upload successful, started polling for processing');
    } catch (err) {
      setStatus('fail');
      setUploading(false);
      setProcessing(false);
      setProcessingMsg('');
      setProcessingError('');
      console.error('[PortfolioUpload] Upload failed', err);
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
    <div className="portfolio-upload" style={{ background: '#1A2615', borderRadius: 12, padding: 32, boxShadow: '0 2px 16px #0002', maxWidth: 480 }}>
      <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 20, marginBottom: 12 }}>{UI_STRINGS.UPLOAD.TITLE}</h3>
      <p style={{ color: '#b2e3a7', marginBottom: 16 }}>{UI_STRINGS.UPLOAD.FORMAT_HINT}</p>
      <a href="/sample-portfolio.xlsx" download style={{ color: '#53d22c', fontWeight: 600, marginBottom: 16, display: 'inline-block' }}>{UI_STRINGS.UPLOAD.SAMPLE}</a>
      <div style={{ margin: '18px 0', color: '#7ecbff', fontWeight: 500 }}>
        {status === 'default' && UI_STRINGS.UPLOAD.STATUS_DEFAULT}
        {status === 'success' && <span style={{ color: '#53d22c' }}>{UI_STRINGS.UPLOAD.STATUS_SUCCESS}</span>}
        {status === 'fail' && <span style={{ color: '#ff4d4f' }}>{UI_STRINGS.UPLOAD.STATUS_FAIL}</span>}
      </div>
      {processing && (
        <div style={{ color: '#53d22c', marginBottom: 12 }}>
          <span className="spinner" style={{ marginRight: 8 }}>⏳</span>
          {processingMsg}
        </div>
      )}
      {processingError && (
        <div style={{ color: '#ff4d4f', marginBottom: 12 }}>{processingError}</div>
      )}
      <input
        type="file"
        accept=".xlsx,.xls"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={uploading || processing}
      />
      <button
        className="upload-btn"
        style={{ background: '#53d22c', color: '#162013', border: 'none', borderRadius: 8, padding: '0.7rem 1.6rem', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 8 }}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || processing}
      >
        {uploading ? UI_STRINGS.GENERAL.LOADING : UI_STRINGS.UPLOAD.BTN}
      </button>
      <div style={{ color: '#7ecbff', fontSize: '0.98rem', marginTop: 12 }}>
        Supported file types: .xlsx, .xls. Max file size: 2MB.
      </div>
    </div>
  );
};

export default PortfolioUpload;