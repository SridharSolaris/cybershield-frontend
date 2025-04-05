import React, { useEffect, useState } from "react";
import { getApps, generateApiKey } from "../services/apiService";
import { Clipboard, ClipboardCheck } from "lucide-react";

const Settings = () => {
  const [userDetails] = useState({
    username: "user",
    email: "user@gmail.com",
  });
  const [apps, setApps] = useState([]);
  const [apiKey, setApiKey] = useState(null);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [copied, setCopied] = useState(null);
  const [token] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const data = await getApps(token);
        setApps(data);
      } catch (error) {
        console.error("Error fetching apps:", error.message);
      }
    };

    if (token) fetchApps();
  }, [token]);

  const handleGenerateApiKey = async (appId) => {
    try {
      const data = await generateApiKey(appId, token);
      setApiKey(data.apiKey);
      setSelectedAppId(appId);
    } catch (error) {
      console.error("Error generating API key:", error.message);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="max-w-6xl my-6 mx-auto p-6 bg-gray-900 rounded-xl shadow-lg">
      <h1 className="text-3xl font-semibold text-center mb-6 text-green-400">
        Settings
      </h1>

      {/* User Account Section */}
      <section className="bg-gray-800 p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500">
        <h2 className="text-xl font-semibold text-center mb-4 text-green-300">
          Account Details
        </h2>
        <p className="text-gray-300">
          <strong className="text-white">User/Organization Name:</strong> {userDetails.username}
        </p>
        <p className="text-gray-300">
          <strong className="text-white">Email:</strong> {userDetails.email}
        </p>

      </section>

      {/* API Management Section */}
      <section className="bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500">
        <h2 className="text-xl font-semibold  mb-4 text-green-300">
          API Management
        </h2>

        {apps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {apps.map((app) => (
              <div key={app._id} className="bg-gray-700 p-5 rounded-lg">
                <h3 className="text-lg font-semibold text-green-200 mb-4">
                  {app.appName}
                </h3>

                {/* API Key Display */}
                <div
                  className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-lg cursor-pointer mb-2"
                  onClick={() => handleCopy(app.apiKey, `api-${app._id}`)}
                >
                  <span className="text-gray-300 truncate">
                    <strong className="text-white">API Key:</strong> {app.apiKey}
                  </span>
                  {copied === `api-${app._id}` ? (
                    <ClipboardCheck className="text-green-400 w-5 h-5" />
                  ) : (
                    <Clipboard className="text-gray-400 hover:text-green-400 w-5 h-5" />
                  )}
                </div>

                {/* App ID Display */}
                <div
                  className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-lg cursor-pointer"
                  onClick={() => handleCopy(app._id, `id-${app._id}`)}
                >
                  <span className="text-gray-300 truncate">
                    <strong className="text-white">App ID:</strong> {app._id}
                  </span>
                  {copied === `id-${app._id}` ? (
                    <ClipboardCheck className="text-green-400 w-5 h-5" />
                  ) : (
                    <Clipboard className="text-gray-400 hover:text-green-400 w-5 h-5" />
                  )}
                </div>

                {/* Generate New API Key */}
                <button
                  onClick={() => handleGenerateApiKey(app._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg mt-4 w-full hover:bg-green-700 transition duration-300 ease-in-out"
                >
                  Generate New API Key
                </button>

                {/* Display New API Key */}
                {selectedAppId === app._id && apiKey && (
                  <div
                    className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-lg mt-2 cursor-pointer"
                    onClick={() => handleCopy(apiKey, "new-api")}
                  >
                    <span className="text-gray-300 truncate">
                      <strong className="text-white">New API Key:</strong> {apiKey}
                    </span>
                    {copied === "new-api" ? (
                      <ClipboardCheck className="text-green-400 w-5 h-5" />
                    ) : (
                      <Clipboard className="text-gray-400 hover:text-green-400 w-5 h-5" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300">No apps available. Please add one!</p>
        )}
      </section>
    </div>
  );
};

export default Settings;