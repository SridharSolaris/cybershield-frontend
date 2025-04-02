// dashboard/src/components/AppDetails/TrafficLogs.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { connectWebSocket, disconnectWebSocket, fetchTrafficLogs } from "../../api/firewallApi";

const TrafficLogs = ({ appId, onAnalyzeIP }) => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const logsPerPage = 10;
  const [selectedIP, setSelectedIP] = useState(null);
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'all'

  useEffect(() => {
    if (!appId) return;

    const handleTrafficUpdate = (newLog) => {
      console.log("🚀 Received traffic update:", newLog);

      if (!newLog) {
        console.warn("⚠️ Received empty traffic update");
        return;
      }

      // If missing URL, try to extract it from request
      if (!newLog.url && newLog.request) {
        newLog.url = newLog.request.url || newLog.request;
      }

      // Add timestamp if missing
      if (!newLog.timestamp) {
        newLog.timestamp = new Date().toISOString();
      }

      setLogs((prevLogs) => {
        // Prevent duplicate logs
        const isDuplicate = prevLogs.some(log =>
          log.timestamp === newLog.timestamp && log.url === newLog.url
        );

        if (isDuplicate) return prevLogs;

        console.log("✅ Adding new log to state:", newLog);
        return [newLog, ...prevLogs]; // Prepend new log
      });
    };

    const initializeTrafficMonitoring = async () => {
      try {
        console.log(`🔄 Initializing traffic monitoring for app: ${appId}`);
        await connectWebSocket(appId, handleTrafficUpdate);
        setSocketConnected(true);
        await fetchLogs(1);
      } catch (error) {
        console.error("❌ Failed to initialize traffic monitoring:", error);
        setError("Failed to connect to traffic monitoring");
        setSocketConnected(false);
      }
    };

    initializeTrafficMonitoring();

    return () => {
      console.log(`🔌 Disconnecting WebSocket for app: ${appId}`);
      disconnectWebSocket(appId);
      setSocketConnected(false);
    };
  }, [appId]);

  // Memoize the groupLogsByIP function
  const groupLogsByIP = useCallback((logsArray) => {
    return logsArray.reduce((acc, log) => {
      if (!log.ip) return acc;
      if (!acc[log.ip]) acc[log.ip] = [];
      acc[log.ip].push(log);
      return acc;
    }, {});
  }, []);

  // Memoize the grouped logs
  const groupedLogs = useMemo(() => groupLogsByIP(logs), [logs, groupLogsByIP]);

  // Optimize the stats calculation with memoization
  const calculateIPStats = useCallback((ipLogs) => {
    const successfulRequests = ipLogs.filter(log => log.statusCode >= 200 && log.statusCode < 400).length;
    const successRate = ((successfulRequests / ipLogs.length) * 100).toFixed(1);

    // Optimize URL counting
    const mostUsedUrl = Object.entries(
      ipLogs.reduce((acc, log) => {
        acc[log.url] = (acc[log.url] || 0) + 1;
        return acc;
      }, {})
    ).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

    const lastAccess = new Date(Math.max(...ipLogs.map(log => new Date(log.timestamp))));

    return { successRate, mostUsedUrl, lastAccess };
  }, []);

  // Optimized log fetching with debouncing
  const fetchLogs = useCallback(async (pageNum) => {
    if (!appId || loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetchTrafficLogs(appId, pageNum, logsPerPage);
      if (response?.logs?.length > 0) {
        setLogs(prev => {
          const newLogs = pageNum === 1 ? response.logs : [...prev, ...response.logs];
          return [...new Set(newLogs.map(JSON.stringify))].map(JSON.parse);
        });
        setTotalPages(response.totalPages || 1);
        setPage(pageNum);
      } else if (pageNum === 1) {
        setLogs([]);
        setError("No logs found.");
      }
    } catch (err) {
      console.error("❌ Error fetching logs:", err);
      setError("Error fetching logs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [appId, logsPerPage, loading]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl transition-all duration-300">
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
          <span className={`text-sm ${socketConnected ? 'text-green-400' : 'text-yellow-400'}`}>
            {socketConnected ? 'Live Monitoring' : 'Connecting...'}
          </span>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      {/* View Toggle Buttons */}
      <div className="mb-4 flex justify-between items-center bg-gray-700 p-2 rounded-lg">
        <div className="flex space-x-2">
          {['grouped', 'all'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${viewMode === mode
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
            >
              {mode === 'grouped' ? '📊 Grouped by IP' : '📋 All Logs'}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Display */}
      <div className="max-h-[600px] overflow-y-auto custom-scrollbar border border-green-500/30 rounded-lg p-2">
        {viewMode === 'grouped' ? (
          <GroupedLogsView
            groupedLogs={groupedLogs}
            calculateIPStats={calculateIPStats}
            selectedIP={selectedIP}
            setSelectedIP={setSelectedIP}
            onAnalyzeIP={onAnalyzeIP}
          />
        ) : (
          <AllLogsView logs={logs} />
        )}
      </div>

      {/* Enhanced Pagination */}
      <div className="mt-4 flex items-center justify-between bg-gray-700 p-2 rounded-lg">
        <button
          className="px-4 py-2 bg-gray-600 text-green-300 rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          onClick={() => fetchLogs(page - 1)}
          disabled={page <= 1 || loading}
        >
          ← Previous
        </button>
        <div className="flex items-center space-x-2">
          {[...Array(Math.min(5, totalPages))].map((_, idx) => {
            const pageNum = page - 2 + idx;
            if (pageNum > 0 && pageNum <= totalPages) {
              return (
                <button
                  key={idx}
                  onClick={() => fetchLogs(pageNum)}
                  className={`w-8 h-8 rounded-md transition-all duration-200 ${page === pageNum
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                >
                  {pageNum}
                </button>
              );
            }
            return null;
          })}
        </div>
        <button
          className="px-4 py-2 bg-gray-600 text-green-300 rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          onClick={() => fetchLogs(page + 1)}
          disabled={page >= totalPages || loading}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

// Separated view components for better organization
const GroupedLogsView = React.memo(({ groupedLogs, calculateIPStats, selectedIP, setSelectedIP, onAnalyzeIP }) => (
  Object.entries(groupedLogs).length > 0 ? (
    <div className="space-y-4">
      {Object.entries(groupedLogs).map(([ip, ipLogs]) => {
        const stats = calculateIPStats(ipLogs);
        return (
          <div key={ip} className="bg-gray-700 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div className="flex-grow">
                <h3 className="text-green-300 font-bold cursor-pointer"
                  onClick={() => setSelectedIP(selectedIP === ip ? null : ip)}>
                  {ip}
                </h3>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div className="text-gray-300">
                    <span className="text-gray-400">Total Requests:</span> {ipLogs.length}
                  </div>
                  <div className="text-gray-300">
                    <span className="text-gray-400">Success Rate:</span> {stats.successRate}%
                  </div>
                  <div className="text-gray-300 col-span-2 truncate">
                    <span className="text-gray-400">Most Used:</span> {stats.mostUsedUrl}
                  </div>
                  <div className="text-gray-300 col-span-2">
                    <span className="text-gray-400">Last Access:</span> {stats.lastAccess.toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onAnalyzeIP && onAnalyzeIP(ip)}
                className="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm self-start"
              >
                Analyze
              </button>
            </div>

            {selectedIP === ip && (
              <div className="mt-2 space-y-2">
                {ipLogs.map((log, idx) => (
                  <div key={idx} className="bg-gray-800 p-2 rounded">
                    <div className="text-green-200 text-sm">
                      <div><strong>URL:</strong> {log.url}</div>
                      <div><strong>Method:</strong> {log.method}</div>
                      <div><strong>Status:</strong> {log.statusCode}</div>
                      <div><strong>Time:</strong> {new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  ) : (
    <p className="text-green-200">No traffic data available yet.</p>
  )
));

const AllLogsView = React.memo(({ logs }) => (
  <ul className="divide-y divide-green-700">
    {logs.map((log, index) => (
      <li key={index} className="py-4 text-green-200">
        <div><strong>IP:</strong> {log.ip}</div>
        <div><strong>Full URL:</strong> {log.url}</div>
        <div><strong>Method:</strong> {log.method}</div>
        <div><strong>Status:</strong> {log.statusCode}</div>
        <div><strong>Time:</strong> {new Date(log.timestamp).toLocaleString()}</div>
      </li>
    ))}
  </ul>
));

export default React.memo(TrafficLogs);