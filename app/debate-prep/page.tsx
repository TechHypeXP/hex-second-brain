"use client";
import React, { useState } from 'react';
import axios from 'axios';

export default function DebatePrepView() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!file) {
      setStatus('No file selected');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      setStatus('Uploading...');
      const response = await axios.post('/api/ingest', formData);
      setStatus(`Success: ${response.data.jobId}`);
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  };

  return (
    <div>
      <h1>Debate Prep Upload</h1>
      <input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload}>Upload</button>
      <p>{status}</p>
    </div>
  );
}
