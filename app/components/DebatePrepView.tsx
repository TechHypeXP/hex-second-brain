import { useState } from 'react';
import Link from 'next/link'; // Assuming Next.js for navigation

export default function DebatePrepView() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file && !url && !text) {
      setStatus('Please provide a file, URL, or text.');
      return;
    }

    setIsLoading(true);
    setStatus('Processing...');
    setJobId(null);

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
      formData.append('type', 'file'); // Indicate type
    } else if (url) {
      formData.append('url', url);
      formData.append('type', 'url'); // Indicate type
    } else if (text) {
      formData.append('content', text);
      formData.append('type', 'text'); // Indicate type
    }

    try {
      const response = await fetch('/api/v1/ingest', {
        method: 'POST',
        body: file ? formData : JSON.stringify(Object.fromEntries(formData)), // Send JSON for URL/Text, FormData for File
        headers: file ? {} : { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ingestion failed');
      }

      const result = await response.json();
      setStatus(`✅ Job submitted successfully: ${result.jobId}`);
      setJobId(result.jobId);
      console.log('Ingestion result:', result);
    } catch (error: any) {
      setStatus(`❌ Error submitting job: ${error.message}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Debate Preparation</h1>
      <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
        <p className="text-gray-700 mb-6 text-center">
          Provide a source document (file, URL, or text) to begin the analysis process.
        </p>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Document File (PDF, DOCX, etc.)
          </label>
          <input
            type="file"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setUrl(''); // Clear other inputs
              setText('');
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
          />
        </div>

        <div className="flex items-center justify-center text-gray-500 mb-6">
          — OR —
        </div>

        {/* URL Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Document URL (Article, Blog Post, etc.)
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setFile(null); // Clear other inputs
              setText('');
            }}
            placeholder="e.g., https://example.com/article"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

         <div className="flex items-center justify-center text-gray-500 mb-6">
          — OR —
        </div>

        {/* Text Area Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste Document Text
          </label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setFile(null); // Clear other inputs
              setUrl('');
            }}
            rows={6}
            placeholder="Paste your document text here..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>


        <button
          onClick={handleSubmit}
          disabled={isLoading || (!file && !url && !text)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4
                   rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2.062-2.647zm10.928 3.708A7.962 7.962 0 0120 12h4c0 3.042-1.135 5.824-3 7.938l-2.062-2.647z"></path>
            </svg>
          ) : null}
          {isLoading ? 'Processing...' : 'Process Document'}
        </button>

        {status && (
          <div className={`mt-4 p-3 rounded-md ${status.startsWith('✅') ? 'bg-green-100 border-l-4 border-green-500 text-green-700' : status.startsWith('❌') ? 'bg-red-100 border-l-4 border-red-500 text-red-700' : 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700'}`}>
            <p className="font-semibold">{status}</p>
            {jobId && status.startsWith('✅') && (
              <p className="mt-2">
                View job status on the <Link href="/dashboard" className="text-blue-600 hover:underline">Operational Dashboard</Link>.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
