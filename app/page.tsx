"use client";

import { useState } from 'react';
import DebatePrepView from "@/app/components/DebatePrepView";
import OperationalDashboard from "@/app/components/OperationalDashboard";
import InteractiveReport from "@/app/components/InteractiveReport";
import IngestionSandbox from "@/app/components/IngestionSandbox";

export default function Home() {
  const [activeTab, setActiveTab] = useState('debate-prep');

  const renderContent = () => {
    switch (activeTab) {
      case 'debate-prep':
        return <DebatePrepView />;
      case 'dashboard':
        return <OperationalDashboard />;
      case 'report':
        return <InteractiveReport />;
      case 'sandbox':
        return <IngestionSandbox />;
      default:
        return <DebatePrepView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4">
        <ul className="flex space-x-4">
          <li>
            <button
              className={`px-4 py-2 rounded ${activeTab === 'debate-prep' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setActiveTab('debate-prep')}
            >
              Debate Prep
            </button>
          </li>
          <li>
            <button
              className={`px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Operational Dashboard
            </button>
          </li>
          <li>
            <button
              className={`px-4 py-2 rounded ${activeTab === 'report' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setActiveTab('report')}
            >
              Interactive Report
            </button>
          </li>
          <li>
            <button
              className={`px-4 py-2 rounded ${activeTab === 'sandbox' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setActiveTab('sandbox')}
            >
              Ingestion Sandbox
            </button>
          </li>
        </ul>
      </nav>
      <main className="p-4">
        {renderContent()}
      </main>
    </div>
  );
}
