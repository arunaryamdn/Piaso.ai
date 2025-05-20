import React, { useState } from 'react';

const PortfolioUpload: React.FC = () => {
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload-portfolio', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      setPreview(data.preview);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setPreview([]);
    }
  };

  return (
    <div>
      <h2>Upload Portfolio Excel</h2>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {preview.length > 0 && (
        <table>
          <thead>
            <tr>
              {Object.keys(preview[0]).map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((val, i) => (
                  <td key={i}>{String(val)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PortfolioUpload;