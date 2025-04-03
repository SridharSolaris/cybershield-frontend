import React from "react";

const SDKSetupPage = () => {
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert("Code copied to clipboard!");
  };

  return (
    <div className="container mx-auto my-8 p-8 max-w-4xl">
      <h1 className="text-4xl font-extrabold text-center text-green-400 mb-8 tracking-wide">
        Firewall SDK Integration
      </h1>
      <p className="mt-4 text-xl text-gray-300 leading-relaxed">
        This page explains how to install and integrate the Cyshield SDK into your React application. Follow the steps below to get started with the integration.
      </p>

      {/* Demo Section - Add this before Step 1 */}
      <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-green-500">
        <h2 className="text-3xl font-semibold text-gray-100 mb-4">Live Demo</h2>

        <div className="space-y-6">
          {/* Demo Web App */}
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-2">Client Web App Demo</h3>
            <p className="text-gray-400 mb-2">Experience the firewall in action with our demo application:</p>
            <a
              href="https://cyshield-external.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-all duration-200"
            >
              Visit Demo App →
            </a>
          </div>

          {/* Test Account */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-xl font-semibold text-green-400 mb-2">Dashboard Test Account</h3>
            <p className="text-gray-400 mb-2">Use these credentials to explore the dashboard features:</p>
            <div className="bg-gray-900 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Email:</span>
                <code className="bg-gray-800 px-3 py-1 rounded text-green-400">user@gmail.com</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Password:</span>
                <code className="bg-gray-800 px-3 py-1 rounded text-green-400">123</code>
              </div>
            </div>
          </div>

          {/* Demo App Details */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-xl font-semibold text-green-400 mb-2">Demo App Details</h3>
            <div className="bg-gray-900 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">App Name:</span>
                <code className="bg-gray-800 px-3 py-1 rounded text-green-400">app1</code>
              </div>
              <p className="text-sm text-gray-500">
                This demo app demonstrates real-time IP monitoring, threat detection, and automated blocking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Install the SDK */}
      <div className="mt-8">
        <h2 className="text-3xl font-semibold text-gray-100">Step 1: Install the SDK</h2>
        <p className="mt-2 text-lg text-gray-400 leading-relaxed">
          First, install the Cyshield SDK in your React application using either npm:
        </p>
        <div className="mt-4 space-y-4">
          <div className="relative bg-gradient-to-r from-gray-700 to-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
            <pre className="text-lg text-gray-300 overflow-x-auto">{`
npm install cyshield-sdk
            `}</pre>
            <button
              onClick={() => handleCopyCode("npm install cyshield-sdk")}
              className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-all duration-200"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Set Configuration */}
      <div className="mt-8">
        <h2 className="text-3xl font-semibold text-gray-100">Step 2: Set Configuration</h2>
        <p className="mt-2 text-lg text-gray-400 leading-relaxed">
          After installing the SDK, you need to set up the configuration for the firewall in your app. Add the following code to your main app file (e.g., <code className="bg-gray-800 text-gray-200 p-1 rounded">App.js</code>):
        </p>
        <div className="mt-4 relative bg-gradient-to-r from-gray-700 to-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
          <pre className="text-lg text-gray-300 overflow-x-auto">{`
import React, { useEffect } from "react";
import { setConfig, ProtectedPage, setupAxiosInterceptors } from "cyshield-sdk";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import axios from "axios"; 
import Home from "./pages/Home";

// Set the configuration for the firewall
  useEffect(() => {
    setConfig({
      API_KEY,
      APP_ID,
      CUSTOM_HEADERS: { "x-source": "external-web-app" },
      REALTIME_MONITORING: true, // Set to true if real-time monitoring is required
    });

    // Set up interceptors on the default Axios instance
    setupAxiosInterceptors(axios);
  }, [APP_ID, API_KEY]);

function App() {
  return (
    <div className="App">
      <BrowserRouter> 
        <ProtectedPage>
          <Routes>
            <Route path="/home" element={<Home />} />
          </Routes>
        </ProtectedPage>
      </BrowserRouter>
    </div>
  );
}

export default App;
          `}</pre>
          <button
            onClick={() =>
              handleCopyCode(`
import React, { useEffect } from "react";
import { setConfig, ProtectedPage, setupAxiosInterceptors } from "cyshield-sdk";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import axios from "axios"; 
import Home from "./pages/Home";

// Set the configuration for the firewall
  useEffect(() => {
    setConfig({
      API_KEY,
      APP_ID,
      CUSTOM_HEADERS: { "x-source": "external-web-app" },
      REALTIME_MONITORING: true, // Set to true if real-time monitoring is required
    });

    // Set up interceptors on the default Axios instance
    setupAxiosInterceptors(axios);
  }, [APP_ID, API_KEY]);

function App() {
  return (
    <div className="App">
      <BrowserRouter> 
        <ProtectedPage>
          <Routes>
            <Route path="/home" element={<Home />} />
          </Routes>
        </ProtectedPage>
      </BrowserRouter>
    </div>
  );
}

export default App;
              `)
            }
            className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-all duration-200"
          >
            Copy
          </button>
        </div>

        <p className="mt-4 text-lg text-gray-400 leading-relaxed">
          Ensure you have set the following environment variables in your <code className="bg-gray-800 text-gray-200 p-1 rounded">.env</code> file. (You can find your API KEY and APP ID on our dashboard settings page):
        </p>
        <div className="mt-4 relative bg-gradient-to-r from-gray-700 to-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
          <pre className="text-lg text-gray-300 overflow-x-auto">{`
REACT_APP_FIREWALL_API_KEY="your-api-key"
REACT_APP_FIREWALL_APP_ID="your-app-id"
          `}</pre>
          <button
            onClick={() =>
              handleCopyCode(`
REACT_APP_FIREWALL_API_KEY="your-api-key"
REACT_APP_FIREWALL_APP_ID="your-app-id"
              `)
            }
            className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-all duration-200"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Step 3: Use ProtectedPage */}
      <div className="mt-8">
        <h2 className="text-3xl font-semibold text-gray-100">Step 3: Use ProtectedPage</h2>
        <p className="mt-2 text-lg text-gray-400 leading-relaxed">
          The SDK provides a <code className="bg-gray-800 text-gray-200 p-1 rounded">ProtectedPage</code> component that ensures only authorized users can access the content inside it. Wrap the content you want to protect with this component.
        </p>
      </div>

      {/* Step 4: Test the Integration */}
      <div className="mt-8">
        <h2 className="text-3xl font-semibold text-gray-100">Step 4: Test the Integration</h2>
        <p className="mt-2 text-lg text-gray-400 leading-relaxed">
          After completing the configuration, test your integration by running your app. Ensure that the protected content is visible only to authorized users while others are blocked by the firewall.
        </p>
      </div>

      {/* Add this note at the end of the steps */}
      <div className="mt-8 bg-gray-800 p-6 rounded-lg border-l-4 border-yellow-500">
        <h3 className="text-xl font-semibold text-yellow-400 mb-2">Important Note</h3>
        <p className="text-gray-400">
          The demo app uses the same cyshield SDK that you'll be implementing. Monitor its behavior in real-time by logging into the dashboard with the test account provided above.
        </p>
      </div>

      {/* Back to Home */}
      <div className="mt-10 text-center">
        <a
          href="/"
          className="text-xl text-green-400 hover:underline transition-all duration-200"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default SDKSetupPage;
