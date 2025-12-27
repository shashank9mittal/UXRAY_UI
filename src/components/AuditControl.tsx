import { useState } from 'react';

interface AuditControlProps {
  userId?: string;
  url?: string;
}

function AuditControl({ userId = 'test-user-2', url: urlProp }: AuditControlProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState(urlProp || '');

  const handleStartAudit = async () => {
    setIsLoading(true);
    
    try {
      const requestBody: { userId: string; url?: string } = { userId };
      if (url && url.trim()) {
        requestBody.url = url.trim();
      }

      const response = await fetch('http://localhost:3000/session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Audit started');
    } catch (error) {
      console.error('Error starting audit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full my-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-2xl">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to audit (optional)"
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
        <button
          onClick={handleStartAudit}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
        >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Starting...
          </span>
        ) : (
          'Start Audit'
        )}
        </button>
      </div>
    </div>
  );
}

export default AuditControl;

