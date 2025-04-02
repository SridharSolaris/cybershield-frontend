import React, { useEffect, useState } from "react";
import { getApps } from "../services/apiService";
import AddApp from "../components/Dashboard/AddApp";
import { data, useNavigate } from "react-router-dom"; // Import useNavigate

const Dashboard = () => {
  const [apps, setApps] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // Initialize useNavigate
  const handleAppAdded = (newApp) => {
    setApps((prevApps) => [...prevApps, newApp]);
  };
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const data = await getApps(token);
        setApps(data || []);
      } catch (error) {
        console.error("Error fetching apps:", error);
      }
    };
    fetchApps();
  }, [handleAppAdded]);

  const handleAppClick = (appId) => {
    navigate(`/app-details/${appId}`); // Navigate to AppDetails page
  };

  const handleManualIPAnalysis = () => {
    navigate("/indash"); // Navigate to the manual IP analysis page
  };


  return (
    <div className="min-h-screen my-6 bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-center text-green-400 mb-8">Dashboard</h1>
      <AddApp token={token} onAppAdded={handleAppAdded} />
      <h4 className="text-green-400 text-2xl my-6">Added Apps</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
        {apps.map((app) => (
          <div
            key={app._id}
            className="bg-gray-800 p-6 rounded-lg shadow-xl border-l-4 border-green-500 cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => handleAppClick(app._id)} // Handle click to navigate
          >
            <h3 className="font-medium text-xl text-green-200 mb-4">{app.appName}</h3>
          </div>
        ))}
      </div>

      {/* New Section for Manual IP Analysis */}
      <div className="mt-8">
        <h4 className="text-green-400 text-2xl mb-4">Manual IP Analysis</h4>
        <button
          onClick={handleManualIPAnalysis}
          className="bg-green-500 text-center text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
        >
          Go to Manual IP Analysis
        </button>
      </div>
    </div>
  );
};

export default Dashboard;