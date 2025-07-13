import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Import useRouter

interface ReportMetadata {
  resourceType: string;
  processingDate: string;
  embeddingModel: string;
  totalChunks: number;
  keywords: string[];
  semanticTags: string[];
}

interface Report {
  title: string;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  metadata: ReportMetadata;
  generatedAt: string;
  disclaimer: string;
}

export default function InteractiveReport() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const router = useRouter(); // Initialize useRouter
  const { resourceId } = router.query; // Get resourceId from query

  const fetchReport = async () => {
    if (!resourceId) {
      setError('No resource ID provided in the URL.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/v1/report?resourceId=${resourceId}`); // Use resourceId in API call
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to fetch report');
      }
      setReport(data);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Report Fetch Error:', e);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{report?.title || 'Analysis Report'}</h1>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Refreshing...' : 'Refresh Report'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading && !report && (
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {report && !error && (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <p className="text-gray-700">{report.summary}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Key Findings</h2>
            <ul className="list-disc pl-5 space-y-1">
              {report.keyFindings.length > 0 ? (
                report.keyFindings.map((finding, index) => (
                  <li key={index} className="text-gray-700">{finding}</li>
                ))
              ) : (
                <li className="text-gray-500">No key findings available.</li>
              )}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Recommendations</h2>
            <ul className="list-disc pl-5 space-y-1">
              {report.recommendations.length > 0 ? (
                report.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-700">{rec}</li>
                ))
              ) : (
                <li className="text-gray-500">No recommendations available.</li>
              )}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Metadata</h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong>Resource Type:</strong> {report.metadata.resourceType}
              </div>
              <div>
                <strong>Processing Date:</strong> {new Date(report.metadata.processingDate).toLocaleString()}
              </div>
              <div>
                <strong>Embedding Model:</strong> {report.metadata.embeddingModel}
              </div>
              <div>
                <strong>Total Chunks:</strong> {report.metadata.totalChunks}
              </div>
              <div>
                <strong>Keywords:</strong> {report.metadata.keywords.join(', ') || 'None'}
              </div>
              <div>
                <strong>Semantic Tags:</strong> {report.metadata.semanticTags.join(', ') || 'None'}
              </div>
            </div>
          </section>

          <section className="border-t pt-4 text-sm text-gray-500 italic">
            <p>{report.disclaimer}</p>
            <p className="mt-2">Generated at: {new Date(report.generatedAt).toLocaleString()}</p>
          </section>
        </div>
      )}

      {!loading && !report && !error && (
        <div className="bg-white p-6 rounded-lg shadow text-gray-500 text-center">
          No analysis report available. Process a document to generate a report.
        </div>
      )}
    </div>
  );
}
